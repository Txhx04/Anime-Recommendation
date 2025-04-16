const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const db = require('../models/db');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Ensure the images directory exists
const imagesDir = path.join(__dirname, '../public/images/anime');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Generate an image for an anime
exports.generateAnimeImage = async (req, res) => {
  try {
    const { animeId } = req.params;
    
    // Check if image already exists in cache
    const imagePath = path.join(imagesDir, `${animeId}.png`);
    console.log("Image path:", imagePath);

    // Get anime details from database
    const query = "SELECT title, genre, studio FROM anime WHERE anime_id = ?";
    db.query(query, [animeId], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ success: false, message: "Anime not found" });
      }

      const anime = results[0];
      
      // Prepare prompt for Gemini
      const prompt = `Generate a high-quality anime-style image for "${anime.title}". 
                     Genre: ${anime.genre}
                     Studio: ${anime.studio}
                     Style: Anime, detailed, vibrant colors, digital art`;

      
      try {
        // Call Gemini API to generate image
        const response = await genAI.models.generateContent({
          model: "gemini-2.0-flash-exp-image-generation",
          contents: prompt,
          config: {
            responseModalities: ["Text", "Image"],
          },
        });
        console.log("Gemini API response:");
        const part = response.candidates[0].content.parts[0];
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          fs.writeFileSync(imagePath, buffer);
          
          res.json({ 
            success: true, 
            imageUrl: `/images/anime/${animeId}.png`
          });
        } else {
          throw new Error("No image data received");
        }
      } 
      catch (apiError) {
        console.error("Gemini API error:", apiError);
        res.status(500).json({ success: false, message: "Failed to generate image" });
      }
    });
  } 
  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get image for anime (checks cache first)
exports.getAnimeImage = async (req, res) => {
  const { animeId } = req.params;

  const jpgPath = path.join(imagesDir, `${animeId}.jpg`);
  const pngPath = path.join(imagesDir, `${animeId}.png`);

  if (fs.existsSync(jpgPath)) {
    return res.json({ 
      success: true, 
      imageUrl: `/public/images/anime/${animeId}.jpg` 
    });
  }

  else if  (fs.existsSync(pngPath)) {
    return res.json({ 
      success: true, 
      imageUrl: `/public/images/anime/${animeId}.png` 
    });
  }

 else{
  this.generateAnimeImage(req, res);
 }
};
