# NotedAI - AI-Powered Smart Note Assistant

NotedAI is an AI-powered tool that captures spoken conversations in real time, transcribes them into text, and summarizes key points — so users can focus on listening, not typing.

## Project Overview

NotedAI consists of two main components:

1. **Chrome Extension**: Captures audio, provides real-time transcription and summarization
2. **Web Platform**: Manages transcripts, provides search functionality, and allows audio uploads

## Features

- 🎤 **Real-Time Transcription**: Captures audio from microphone or browser tab
- 🤖 **AI Summarization**: Uses Gemini API to create bullet-pointed summaries
- 🔍 **Search & Question Answering**: Ask questions about your recordings
- 🔒 **Private Journaling**: Secure storage option for sensitive information
- 📊 **Wellness Tracking**: Monitors usage patterns and provides wellness tips
- 🌐 **Cross-Platform**: Use in the browser or as a Chrome extension

## Tech Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: Google SSO
- **AI Services**: Gemini API
- **Secure Storage**: Midnight for private journaling
- **Wellness**: OM1 integration for behavioral health trends

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB Atlas account
- Google Cloud Platform account (for OAuth and Speech-to-Text)
- Gemini API key
- Chrome browser (for extension)

### Installation

#### Backend Setup

1. Navigate to the web platform directory:  cd web-platform

2. Install dependencies:  npm install

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Fill in your MongoDB URI, Google OAuth credentials, and API keys

4. Start the development server: npm run dev

#### Frontend Setup

1. Navigate to the client directory: cd web-platform/client

2. Install dependencies: npm install

3. Start the development server: npm start

#### Chrome Extension Setup

1. Navigate to the chrome-extension directory: cd chrome-extension

2. Install dependencies: npm install

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Fill in your API URL and Gemini API key

4. Build the extension: npm run build

5. Load the extension in Chrome:
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the `dist` directory

## Usage

### Web Platform

1. Visit `http://localhost:3000` in your browser
2. Sign in with your Google account
3. Access your dashboard to view previous sessions
4. Upload audio files for transcription and summarization
5. Search through your notes and ask questions

### Chrome Extension

1. Click the NotedAI icon in your Chrome toolbar
2. Login with your Google account
3. Choose your audio source (microphone or tab audio)
4. Start recording
5. View real-time transcription
6. Stop recording to generate summary
7. Save your session to access it in the web platform

## API Documentation

The API documentation is available at `/api-docs` when running the server.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Gemini API](https://ai.google.dev/gemini) for AI capabilities
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database
- [Midnight](https://midnight.pub/) for secure journaling
- [OM1](https://www.om1.com/) for wellness insights