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
import {
  genOldFormattedResume,
  genJobDescDetails,
  processSkills,
  generateImprovedSummary,
  genWorkExperience,
} from "./utils.js";
import { validateResume, formatValidationErrors } from "./validation.js";
import { diffLines } from "diff";

const router = express.Router();

// New route for JSON resume validation and analysis
router.post("/json", async (req, res) => {
  const { resumeData, jd } = req.body;

  try {
    // Validate the provided JSON resume data
    const validation = validateResume(resumeData);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Resume validation failed",
        validationErrors: validation.errors,
        formattedErrors: formatValidationErrors(validation.errors),
      });
    }

    // Check if this is just a validation request (no job description)
    const isValidationOnly = !jd || jd.trim() === "";

    if (isValidationOnly) {
      // Calculate basic resume score
      const basicScore = calculateBasicScore(validation.data);

      return res.json({
        success: true,
        message: "Resume validation successful",
        resumeData: validation.data,
        resumeScore: basicScore,
        suggestions: generateBasicSuggestions(validation.data),
      });
    }

    // Process with job description for optimization
    const jobDescDetails = await genJobDescDetails(jd);

    // Generate optimized resume components
    const [finalUpdatedSkills, finalProfessionalSummary] = await Promise.all([
      processSkills(
        validation.data?.technicalSkills,
        jobDescDetails?.job_desc_tech_skills
      ),
      generateImprovedSummary(
        validation.data?.professionalSummary,
        jd,
        jobDescDetails.company_name
      ),
    ]);

    const finalWorkExperience = await genWorkExperience(
      validation.data?.workExperience,
      finalUpdatedSkills?.missingSkills
    );

    // Create updated resume object
    const updatedResume = {
      ...validation.data,
      technicalSkills: finalUpdatedSkills,
      professionalSummary: finalProfessionalSummary.improved_summary,
      workExperience: finalWorkExperience,
    };

    // Generate diff between original and updated resume
    const originalResumeText = JSON.stringify(validation.data, null, 2);
    const updatedResumeText = JSON.stringify(updatedResume, null, 2);
    const diff = diffLines(originalResumeText, updatedResumeText);

    // Calculate comprehensive resume score
    const resumeScore = calculateComprehensiveScore(
      updatedResume,
      jobDescDetails,
      finalUpdatedSkills
    );

    res.json({
      success: true,
      originalResume: validation.data,
      updatedResume,
      jobDescDetails,
      finalUpdatedSkills,
      finalProfessionalSummary,
      finalWorkExperience,
      resumeScore,
      suggestions: generateOptimizedSuggestions(
        updatedResume,
        jobDescDetails,
        finalUpdatedSkills
      ),
      diff,
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

// Enhanced original route for text-based resume processing
router.post("/", async (req, res) => {
  const { resume, jd } = req.body;
  try {
    // Check if this is just a parsing request (no real job description)
    const isParsingOnly = jd === "Convert this resume to structured format";

    if (isParsingOnly) {
      // Just parse and return the original resume structure
      const oldFormattedResume = await genOldFormattedResume(resume);

      // Validate the formatted resume
      const validation = validateResume(oldFormattedResume);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Resume validation failed",
          validationErrors: validation.errors,
          formattedErrors: formatValidationErrors(validation.errors),
        });
      }

      return res.json({
        success: true,
        originalResume: oldFormattedResume,
        resumeScore: calculateBasicScore(oldFormattedResume),
        suggestions: generateBasicSuggestions(oldFormattedResume),
      });
    }

    // resume and jd inputs for optimization
    const [oldFormattedResume, jobDescDetails] = await Promise.all([
      genOldFormattedResume(resume),
      genJobDescDetails(jd),
    ]);

    // Validate the formatted resume
    const validation = validateResume(oldFormattedResume);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Resume validation failed",
        validationErrors: validation.errors,
        formattedErrors: formatValidationErrors(validation.errors),
      });
    }

    // generating final resume
    const [finalUpdatedSkills, finalProfessionalSummary] = await Promise.all([
      processSkills(
        oldFormattedResume?.technicalSkills,
        jobDescDetails?.job_desc_tech_skills
      ),
      generateImprovedSummary(
        oldFormattedResume?.professionalSummary,
        jd,
        jobDescDetails.company_name
      ),
    ]);

    const finalWorkExperience = await genWorkExperience(
      oldFormattedResume?.workExperience,
      finalUpdatedSkills?.missingSkills
    );

    // Create updated resume object
    const updatedResume = {
      ...oldFormattedResume,
      technicalSkills: finalUpdatedSkills,
      professionalSummary: finalProfessionalSummary.improved_summary,
      workExperience: finalWorkExperience,
    };

    // Generate diff between original and updated resume
    const originalResumeText = JSON.stringify(oldFormattedResume, null, 2);
    const updatedResumeText = JSON.stringify(updatedResume, null, 2);
    const diff = diffLines(originalResumeText, updatedResumeText);

    // Calculate resume score based on various factors
    const resumeScore = calculateComprehensiveScore(
      updatedResume,
      jobDescDetails,
      finalUpdatedSkills
    );

    res.json({
      success: true,
      originalResume: oldFormattedResume,
      updatedResume,
      jobDescDetails,
      finalUpdatedSkills,
      finalProfessionalSummary,
      finalWorkExperience,
      resumeScore,
      suggestions: generateOptimizedSuggestions(
        updatedResume,
        jobDescDetails,
        finalUpdatedSkills
      ),
      diff,
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

// Helper functions for score calculation and suggestions
const calculateBasicScore = (resume) => {
  let score = 60; // Base score

  // Add points for having key sections
  if (resume.professionalSummary && resume.professionalSummary.length > 50)
    score += 10;
  if (resume.workExperience && resume.workExperience.length > 0) score += 15;
  if (resume.technicalSkills && Object.keys(resume.technicalSkills).length > 0)
    score += 10;
  if (resume.education) score += 5;

  return Math.min(score, 100);
};

const calculateComprehensiveScore = (resume, jobDesc, skills) => {
  let score = 60; // Base score

  // Add points for having key sections
  if (resume.professionalSummary && resume.professionalSummary.length > 50)
    score += 10;
  if (resume.workExperience && resume.workExperience.length > 0) score += 15;
  if (resume.technicalSkills && Object.keys(resume.technicalSkills).length > 0)
    score += 10;

  // Add points for skill matching
  if (skills?.missingSkills && skills.missingSkills.length < 5) score += 5;
  if (skills?.matchedSkills && skills.matchedSkills.length > 3) score += 5;

  // Add points for job description alignment
  if (
    jobDesc?.company_name &&
    resume.professionalSummary
      ?.toLowerCase()
      .includes(jobDesc.company_name.toLowerCase())
  )
    score += 5;

  return Math.min(score, 100);
};

const generateBasicSuggestions = (resume) => {
  const suggestions = [];

  if (!resume.professionalSummary || resume.professionalSummary.length < 100) {
    suggestions.push(
      "Add a comprehensive professional summary (100+ characters)"
    );
  }

  if (!resume.workExperience || resume.workExperience.length === 0) {
    suggestions.push("Add work experience with quantifiable achievements");
  }

  if (
    !resume.technicalSkills ||
    Object.keys(resume.technicalSkills).length === 0
  ) {
    suggestions.push("Include technical skills organized by category");
  }

  if (!resume.education) {
    suggestions.push("Add education information");
  }

  return suggestions.length > 0
    ? suggestions
    : ["Resume looks good! Consider adding more quantifiable achievements."];
};

const generateOptimizedSuggestions = (resume, jobDesc, skills) => {
  const suggestions = [];

  if (skills?.missingSkills && skills.missingSkills.length > 0) {
    suggestions.push(
      `Add these missing skills: ${skills.missingSkills.slice(0, 3).join(", ")}`
    );
  }

  if (resume.professionalSummary && resume.professionalSummary.length < 150) {
    suggestions.push(
      "Expand your professional summary to better highlight key achievements"
    );
  }

  if (
    jobDesc?.company_name &&
    !resume.professionalSummary
      ?.toLowerCase()
      .includes(jobDesc.company_name.toLowerCase())
  ) {
    suggestions.push(
      `Mention ${jobDesc.company_name} in your summary to show interest`
    );
  }

  suggestions.push(
    "Add more quantifiable achievements with numbers and percentages"
  );
  suggestions.push(
    "Include industry-specific keywords from the job description"
  );

  return suggestions;
};

export default router;
