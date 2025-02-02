// import { HfInference } from "@huggingface/inference";
// const hf = new HfInference(process.env.HG_KEY);
 
 
 // 1. Skill Matching
    // const similarity = await hf.sentenceSimilarity({
    //   inputs: {
    //     source_sentence: jd,
    //     sentences: [resume],
    //   },
    //   model: "sentence-transformers/all-MiniLM-L6-v2",
    // });

// suggestions: suggestions.choices[0].message.content,

import express from "express";
import { genOldFormattedResume, genJobDescDetails, processSkills, generateImprovedSummary } from "./utils.js";
// import processResumeAsync from "./processResumeAsync.js";

const router = express.Router();
router.post("/", async (req, res) => {
  const { resume, jd } = req.body;
  try {
 
    // resume and jd inputs
    const [oldFormattedResume, jobDescDetails] = await Promise.all([
        genOldFormattedResume(resume),
        genJobDescDetails(jd)
    ])
    // generating final resume
    const [finalUpdatedSkills, finalProfessionalSummary] = await Promise.all([
        processSkills(oldFormattedResume?.technicalSkills, jobDescDetails?.job_desc_tech_skills),
        generateImprovedSummary(oldFormattedResume?.professionalSummary, jd, jobDescDetails.company_name)
    ])

    // ✅ Send JSON response
    res.json({
        success: true,
        oldFormattedResume,
        jobDescDetails,
        finalUpdatedSkills,
        finalProfessionalSummary
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
