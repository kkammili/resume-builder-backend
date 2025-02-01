import express from "express";
import { HfInference } from "@huggingface/inference";
import { OpenAI } from "openai";

const router = express.Router();
const hf = new HfInference(process.env.HG_KEY);
const openai = new OpenAI({apiKey: process.env.AI_KEY})
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
    // 2. Generate Improvements
    const suggestions = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Improve this resume section for the job: ${jd}\nResume: ${resume}`,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 500,
    });

      // ✅ Send JSON response
      res.json({
        success: true,
        similarity,
        suggestions: suggestions.choices[0].message.content,
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
