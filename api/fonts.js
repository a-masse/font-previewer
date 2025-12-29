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

        if (!apiKey) {
            res.status(400).json({ error: 'API key is required' });
            return;
        }

        const isLiteLLM = endpoint && endpoint.includes('chat/completions');
        const apiEndpoint = endpoint || 'https://api.anthropic.com/v1/messages';

        const prompt = `I need exactly 30 Google Fonts that are ${styleDescription}.

Please provide ONLY a JSON array of font names, nothing else. The fonts should be real Google Fonts that exist.
Format: ["Font Name 1", "Font Name 2", ...]

Mix different styles including serif, sans-serif, display, and handwriting fonts that match the description. Make sure all font names are exact matches to Google Fonts (proper capitalization and spacing).`;

        let requestBody, headers;

        if (isLiteLLM) {
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            requestBody = {
                model: 'claude-3-5-sonnet-20241022',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1024
            };
        } else {
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            };
            requestBody = {
                model: 'claude-3-5-sonnet-20241022',
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
            res.status(response.status).json({
                error: `API request failed: ${response.statusText}`,
                details: errorText
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
