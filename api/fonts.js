// Serverless function for Vercel/Netlify
// This proxies requests to Anthropic API to avoid CORS issues

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { apiKey, endpoint, styleDescription } = req.body;

        // Clean the API key - remove any whitespace
        const cleanApiKey = apiKey ? apiKey.trim().replace(/\s+/g, '') : '';

        if (!cleanApiKey) {
            res.status(400).json({ error: 'API key is required' });
            return;
        }

        // Log debugging info (first 20 chars of key for security)
        console.log('API Key length:', cleanApiKey.length);
        console.log('API Key starts with:', cleanApiKey.substring(0, 20));
        console.log('Endpoint:', endpoint);

        const isLiteLLM = endpoint && endpoint.includes('chat/completions');
        const apiEndpoint = endpoint || 'https://api.anthropic.com/v1/messages';

        const prompt = `You are a Google Fonts expert. I need exactly 30 REAL Google Fonts that are ${styleDescription}.

CRITICAL: Only return fonts that actually exist on fonts.google.com. Do NOT make up font names.

Examples of REAL Google Fonts: Playfair Display, Montserrat, Roboto, Lora, Open Sans, Merriweather, Raleway, Dancing Script, Pacifico, Cinzel, Cormorant Garamond, Bebas Neue, Great Vibes.

Return ONLY a JSON array with exact font names (proper capitalization):
["Font Name 1", "Font Name 2", ...]

Mix serif, sans-serif, display, and script fonts that match: ${styleDescription}`;

        let requestBody, headers;

        if (isLiteLLM) {
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanApiKey}`
            };
            requestBody = {
                model: 'claude-haiku-4-5-20251001',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1024
            };
        } else {
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': cleanApiKey,
                'anthropic-version': '2023-06-01'
            };
            requestBody = {
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }]
            };
        }

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            res.status(response.status).json({
                error: `API request failed: ${response.statusText}`,
                details: errorText,
                debugInfo: {
                    keyLength: cleanApiKey.length,
                    keyPrefix: cleanApiKey.substring(0, 15),
                    endpoint: apiEndpoint,
                    expectedKeyStart: 'sk-ant-api03-'
                }
            });
            return;
        }

        const data = await response.json();
        let content;

        if (isLiteLLM && data.choices && data.choices[0]) {
            content = data.choices[0].message.content;
        } else if (data.content && data.content[0]) {
            content = data.content[0].text;
        } else {
            res.status(500).json({ error: 'Unexpected API response format' });
            return;
        }

        // Extract JSON array
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            res.status(500).json({ error: 'Could not parse font list from API response' });
            return;
        }

        const fontList = JSON.parse(jsonMatch[0]);
        res.status(200).json({ fonts: fontList });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
