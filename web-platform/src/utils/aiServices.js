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
    
    // Extract summary from Gemini response
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
    
    // Extract answer from Gemini response
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Question answering error:', error);
    throw new Error('Failed to answer question');
  }
};

// Midnight API for secure, private journaling
const secureStore = async (userId, transcript, summary) => {
  try {
    // This would integrate with Midnight API for secure storage
    // Implementation would depend on Midnight API documentation
    
    // Placeholder implementation
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
  secureStore
};
