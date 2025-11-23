# WOD Generator

A Next.js application that generates personalized CrossFit-style Workouts of the Day (WOD) using Azure OpenAI.

## Features

- Generate personalized CrossFit workouts based on your goals, equipment, preferences, and limitations
- Clean, modern UI with responsive design
- Voice input support (requires HTTPS)
- Form validation and error handling
- Formatted workout display with clear sections

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Azure OpenAI credentials:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Azure OpenAI endpoint, API key, and deployment name

```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your Azure OpenAI credentials:
```
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
```

## Development

### HTTPS Development Server (Recommended for Voice Input)

Run the development server with HTTPS:

```bash
npm run dev
```

This will:
- Generate self-signed SSL certificates automatically (first time only)
- Start the server on `https://localhost:3000`
- Allow you to test voice input features on mobile devices

**Note:** Your browser will show a security warning for the self-signed certificate. This is normal for local development. Click "Advanced" → "Proceed to localhost" to continue.

### HTTP Development Server (No Voice Input)

If you don't need voice input, you can use the standard HTTP server:

```bash
npm run dev:http
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing on Mobile Devices

To test voice input on mobile:

1. Make sure your computer and mobile device are on the same WiFi network
2. Find your computer's local IP address:
   - macOS/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Windows: `ipconfig | findstr IPv4`
3. On your mobile device, navigate to `https://YOUR_IP:3000` (e.g., `https://192.168.1.100:3000`)
4. Accept the security warning (self-signed certificate)
5. Voice input should now work!

## Usage

1. Fill out the form with your workout preferences:
   - **Goal** (required): Describe your fitness goals
   - **Available Equipment** (required): List equipment you have available
   - **Preferences**: Any specific preferences for the workout style
   - **Limitations**: Any physical limitations or concerns
   - **Notes**: Additional notes or preferences

2. Click "Generate WOD" to create your personalized workout

3. The generated workout will appear on the right side with:
   - Workout title and format
   - Warm-up section
   - Main workout section
   - Optional cooldown section
   - Required equipment list
   - Additional notes

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Azure OpenAI
- Tailwind CSS
- React Hook Form
- Zod
- Web Speech API
