import express from "express";
import { HfInference } from "@huggingface/inference";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const hf = new HfInference(process.env.HG_KEY);
const openai = new OpenAI({apiKey: process.env.AI_KEY})

// reading prompts
// Get directory path (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the structure prompt JSON
const RESUME_FORMAT = path.join(__dirname, "../prompts/1.resumeFormat.json");

let resumeFormatData
try {
  resumeFormatData = JSON.parse(fs.readFileSync(RESUME_FORMAT, "utf8"));
} catch (error) {
  console.error("Error reading structurePrompt.json:", error);
  structurePromptData = { prompt: "" }; // Fallback
}

router.post("/", async (req, res) => {
  const { resume, jd } = req.body;
  try {
    // 1. Skill Matching
    const similarity = await hf.sentenceSimilarity({
      inputs: {
        source_sentence: jd,
        sentences: [resume],
      },
      model: "sentence-transformers/all-MiniLM-L6-v2",
    });
     // 2️⃣ **Use the Structure Prompt from JSON File**
     const structurePrompt = resumeFormatData.prompt.replace("{{resume}}", resume);

     // 3️⃣ **Generate Resume JSON Structure using OpenAI**
     const structuredResume = await openai.chat.completions.create({
        messages: [{ role: "user", content: structurePrompt }],
        model: "gpt-3.5-turbo",
        max_tokens: 4096,
      });
  
      // ✅ **Parse JSON output from OpenAI**
      let formattedResume;
      try {
        formattedResume = structuredResume.choices[0].message.content
        formattedResume = JSON.parse(formattedResume);
      } catch (error) {
        throw new Error("Failed to parse JSON from AI response.");
      }

      // ✅ Send JSON response
      res.json({
        success: true,
        similarity,
        formattedResume
        // suggestions: suggestions.choices[0].message.content,
      });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default router;
