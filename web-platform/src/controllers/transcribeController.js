const multer = require('multer');
const { summarizeTranscript } = require('../utils/aiServices');
const speech = require('@google-cloud/speech');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('audio');

// Handle audio file upload and transcription
const transcribeAudio = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }
    console.log("Uploaded file type:", req.file.mimetype);
    try {
      // Set up Google Cloud Speech-to-Text client
      // const client = new speech.SpeechClient({
      //   credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
      // });
      const client = new speech.SpeechClient(); // Google SDK reads credentials from file automatically

      
      // Convert buffer to base64
      const audioBytes = req.file.buffer.toString('base64');
      console.log("Audio buffer length:", audioBytes.length);
      // Configure request
      const audio = {
        content: audioBytes
      };
      const config = {
        encoding: 'MP3',
        languageCode: 'en-US'
      };
      const request = {
        audio: audio,
        config: config
      };
      
      // Perform transcription
      const [response] = await client.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      
      // Generate summary
      const summary = await summarizeTranscript(transcription);
      
      res.json({
        transcript: transcription,
        summary: summary
      });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ message: 'Error transcribing audio' });
    }
  });
};

module.exports = {
  transcribeAudio
};
