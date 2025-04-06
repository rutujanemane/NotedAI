const multer = require('multer');
const speech = require('@google-cloud/speech');
const { summarizeTranscript, detectMeetingsUsingGemini } = require('../utils/aiServices');
const { createCalendarInvite } = require('../utils/calendarService');
const chrono = require('chrono-node');


// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single('audio');

// Controller: handles audio upload, transcription, Gemini + calendar logic
const transcribeAudio = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {      
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    try {
      const client = new speech.SpeechClient();
            
      const audioBytes = req.file.buffer.toString('base64');
      const request = {
        audio: { content: audioBytes },
        config: {
          encoding: 'MP3',
          languageCode: 'en-US',
        },
      };

      
      // Google Speech-to-Text
      const [response] = await client.recognize(request);
      
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

        console.log(transcription);

      if (!transcription) {
        return res.status(400).json({ message: 'No speech detected in audio' });
      }

      // Gemini Summary
      let summary = '';
      try {
        summary = await summarizeTranscript(transcription);
      } catch (err) {
        console.error("Gemini summarization failed:", err.message);
      }

      // Gemini Meeting Insights
      let meetingInsights = null;
      let calendarLink = null;
      let parsedInsights = null;

      try {
        meetingInsights = await detectMeetingsUsingGemini(transcription);

        const raw = meetingInsights?.rawResponse;

  
  const jsonStr = raw?.replace(/```json|```/g, '').trim();

  if(jsonStr)
  parsedInsights = JSON.parse(jsonStr);
else{
  parsedInsights = meetingInsights;
}

        console.log('meetingInsights',parsedInsights);
        // If Gemini returned valid meeting time, create calendar invite
        const parsedDate = chrono.parseDate(parsedInsights.dateTime);
          console.log('datatime',parsedDate);
        if (parsedInsights?.dateTime) {
          const parsedDate = chrono.parseDate(parsedInsights.dateTime);
          console.log('datatime',parsedDate);
          console.log(parsedDate);
          if (parsedDate) {
            try {
              calendarLink = await createCalendarInvite({
                summary: 'Follow-up from Meeting Transcript',
                description: parsedInsights.phrases?.join('\n') || 'Auto-created meeting from CapNotes',
                startDateTime: parsedDate.toISOString(),                
              });
            } catch (calendarErr) {
              console.error("Calendar invite creation error:", calendarErr.message);
            }
          } else {
            console.warn("Could not parse date:", parsedInsights.dateTime);
          }
        }
        
      } catch (insightErr) {
        console.error("Gemini meeting detection error:", insightErr.message);
      }

      res.status(200).json({
        transcript: transcription,
        summary,
        meetingInsights : parsedInsights,
        calendarLink,
      });
    } catch (error) {
      console.error('Transcriptionn error:', error);
      res.status(500).json({ message: 'Error processing audio file' });
    }
  });
};

module.exports = {
  transcribeAudio,
};

