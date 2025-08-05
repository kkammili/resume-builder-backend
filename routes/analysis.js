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
import { genOldFormattedResume, genJobDescDetails, processSkills, generateImprovedSummary, genWorkExperience } from "./utils.js";
import { diffLines } from "diff";

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
        generateImprovedSummary(oldFormattedResume?.professionalSummary, jd, jobDescDetails.company_name),
    ])

    const finalWorkExperience = await genWorkExperience(oldFormattedResume?.workExperience, finalUpdatedSkills?.missingSkills)

    // Create updated resume object
    const updatedResume = {
        ...oldFormattedResume,
        technicalSkills: finalUpdatedSkills,
        professionalSummary: finalProfessionalSummary.improved_summary,
        workExperience: finalWorkExperience
    };

    // Generate diff between original and updated resume
    const originalResumeText = JSON.stringify(oldFormattedResume, null, 2);
    const updatedResumeText = JSON.stringify(updatedResume, null, 2);
    const diff = diffLines(originalResumeText, updatedResumeText);

    // Calculate resume score based on various factors
    const calculateScore = (resume, jobDesc) => {
        let score = 60; // Base score
        
        // Add points for having key sections
        if (resume.professionalSummary && resume.professionalSummary.length > 50) score += 10;
        if (resume.workExperience && resume.workExperience.length > 0) score += 15;
        if (resume.technicalSkills && Object.keys(resume.technicalSkills).length > 0) score += 10;
        
        // Add points for skill matching
        if (finalUpdatedSkills.missingSkills && finalUpdatedSkills.missingSkills.length < 5) score += 5;
        
        return Math.min(score, 100);
    };

    const resumeScore = calculateScore(updatedResume, jobDescDetails);

    // ✅ Send JSON response
    res.json({
        success: true,
        originalResume: oldFormattedResume,
        updatedResume,
        jobDescDetails,
        finalUpdatedSkills,
        finalProfessionalSummary,
        finalWorkExperience,
        resumeScore,
        suggestions: [
            "Add more quantifiable achievements with numbers and percentages",
            "Include industry-specific keywords from the job description",
            "Expand your technical skills section with relevant technologies",
            "Optimize your professional summary for ATS systems"
        ],
        diff
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
