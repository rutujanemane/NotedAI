const axios = require('axios');

// Gemini API for summarization
const summarizeTranscript = async (transcript) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Summarize the following transcript into bullet points, capturing the key information:\n\n${transcript}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Summarization error:', error);
    throw new Error('Failed to summarize transcript');
  }
};

// Ask questions about a transcript using Gemini
const askGemini = async (transcript, question) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Based on the following transcript, answer this question: "${question}"\n\nTranscript:\n${transcript}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Question answering error:', error);
    throw new Error('Failed to answer question');
  }
};

// 🔍 NEW: Detect meeting or collaboration references in transcript
const detectMeetingsUsingGemini = async (transcript) => {
  try {
    const prompt = `
You are an intelligent assistant. From the following meeting transcript, identify:

1. "meetingsDiscussed": true/false — did the speaker mention or schedule any future meetings, collaborations, or follow-ups?
2. "phrases": list of exact phrases that indicate meetings or collaboration plans.
3. "participants": people involved in those plans, if known.
4. "dateTime": If a date and/or time was discussed (e.g., "next Tuesday at 3 PM"), convert it into a full datetime string (ISO 8601 or plain English). If not mentioned, return null.

Transcript:
"""
${transcript}
"""
Return a valid JSON object.
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const raw = response.data.candidates[0].content.parts[0].text;

    console.log("detectMeetingsUsingGemini",raw);

    // Try to parse the JSON response
    try {
      return JSON.parse(raw);
    } catch (e) {
      return { rawResponse: raw }; // fallback if not pure JSON
    }
  } catch (error) {
    console.error('Meeting detection error:', error);
    return { error: 'Failed to detect meeting-related info' };
  }
};

// Midnight API placeholder
const secureStore = async (userId, transcript, summary) => {
  try {
    console.log(`Securely storing data for user ${userId}`);
    return { success: true, message: 'Data securely stored' };
  } catch (error) {
    console.error('Secure storage error:', error);
    throw new Error('Failed to securely store data');
  }
};

module.exports = {
  summarizeTranscript,
  askGemini,
  detectMeetingsUsingGemini, 
  secureStore
};
