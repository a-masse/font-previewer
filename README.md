# Font Previewer

A beautiful web tool that helps you find the perfect Google Font for your project by using AI to suggest fonts based on your style preferences.

## Features

- **AI-Powered Font Suggestions**: Uses Claude AI to intelligently suggest Google Fonts based on your keyword descriptions
- **Live Preview**: See your text rendered in 30 different fonts instantly
- **Keyword-Based Search**: Describe the style you want (elegant, modern, bold, etc.) and get relevant font suggestions
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Easy Comparison**: View multiple fonts side-by-side to find your perfect match

## Use Case

Perfect for finding the ideal font for:
- Logo design
- Website headers
- Branding projects
- Custom gifts and engraving
- Wedding invitations
- Social media graphics
- Any typography project

## How to Use

1. Enter your text (e.g., initials, a word, or phrase)
2. Describe the style you're looking for (e.g., "elegant", "bold and modern", "vintage serif")
3. Click "Generate Font Previews"
4. Browse through 30 AI-suggested fonts displaying your text
5. Find your favorite!

## Deployment (Works on Mobile!)

This app uses a serverless backend to avoid CORS issues on mobile browsers. Deploy to Vercel (free):

### Option 1: Deploy to Vercel (Recommended - 2 minutes)

1. **Install Vercel CLI** (if you haven't already):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from this directory**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Login to your Vercel account
   - Set up project settings (accept defaults)
   - Your app will be live in seconds!

4. **Get your URL**: Vercel will give you a URL like `https://font-previewer-xyz.vercel.app`

5. **Use on any device**: Open the URL on your iPhone, Android, or any browser!

### Option 2: Deploy via Vercel Website (No CLI needed)

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub repo
4. Vercel will auto-detect settings
5. Click "Deploy" - done!

### After Deployment

1. Open your Vercel URL on your phone
2. Click "⚙️ API Settings"
3. Paste your Anthropic API key: `sk-ant-api03-...`
4. Click "💾 Save Settings"
5. Enter text and style keywords
6. Generate fonts!

## Technology

- HTML/CSS/JavaScript frontend
- Serverless backend (Vercel Functions) to handle API calls
- Anthropic Claude API for intelligent font suggestions
- Google Fonts API for font loading and display
- Mobile-friendly with CORS handling

## Privacy & Security

Your API key is stored securely:
- ✅ Keys are stored in your browser's localStorage (never sent to our servers except for API calls)
- ✅ Backend proxy prevents key exposure in client code
- ✅ CORS protection works on all mobile browsers
- ✅ No data is logged or stored on our servers
