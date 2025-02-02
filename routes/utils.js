import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";

const openai = new OpenAI({apiKey: process.env.AI_KEY})

// reading prompts
// Get directory path (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the structure prompt JSON
const RESUME_FORMAT_PROMPT = path.join(__dirname, "../prompts/1.resumeFormat.json");
const JD_PROMPT = path.join(__dirname, "../prompts/2.jdPrompt.json")
const SKILL_CMP_PROMPT = path.join(__dirname, "../prompts/3.compareSkillsPrompt.json")
const PROF_SUMM_PROMPT = path.join(__dirname, "../prompts/4.professionalSummaryPrompt.json")
const GEN_POINTS_PROMPT = path.join(__dirname, "../prompts/5.generateResumePtPrompt.json")

export const genOldFormattedResume = async(resume)=>{
    let resumeFormatPrompt = formatData(RESUME_FORMAT_PROMPT)
    try{
        resumeFormatPrompt = resumeFormatPrompt.prompt.replace("{{resume}}", resume);
        // 3️⃣ **Generate Resume JSON Structure using OpenAI**
        let oldFormattedResume = await promptUtil(resumeFormatPrompt)
        return JSON.parse(oldFormattedResume)
    }catch(error){
        throw new Error(error.message)
    }
}

export const genJobDescDetails = async(jd)=>{
    let jdPrompt = formatData(JD_PROMPT)
    try{
        jdPrompt = jdPrompt.prompt.replace("{{job_description}}", jd)
        let jobDescAnalysis = await promptUtil(jdPrompt)
        return JSON.parse(jobDescAnalysis)
    }catch(error){
        throw new Error(error.message)
    }
}


export const processSkills = async (resumeSkills, jobDescSkills) => {
    console.log("🚀 Processing Resume Skills and Job Description Skills...");
  
    // ✅ Step 1: Identify Missing Skills
    const missingSkills = identifyMissingSkills(resumeSkills, jobDescSkills);
  
    // ✅ Step 2: Categorize Missing Skills Using OpenAI
    const aiCategorizedSkills = await categorizeSkillsWithAI(missingSkills);
  
    // ✅ Step 3: Merge AI Categorized Skills into Resume
    let updatedResumeSkills = mergeSkills(resumeSkills, aiCategorizedSkills.categorized_skills);
    updatedResumeSkills.missingSkills = missingSkills
    return updatedResumeSkills;
  };
  
  /**
   * ✅ Identify Missing Skills
   * @param {Object} resumeSkills - Categorized technical skills from resume
   * @param {Array} jobDescSkills - Flat list of skills from job description
   * @returns {Array} - List of missing skills
   */
  const identifyMissingSkills = (resumeSkills, jobDescSkills) => {
    const flattenedResumeSkills = Object.values(resumeSkills).flat().map(skill => skill.toLowerCase());

    return jobDescSkills.filter(skill => {
      const lowerSkill = skill.toLowerCase();
      return !flattenedResumeSkills.some(existingSkill => existingSkill.startsWith(lowerSkill));
    });
  };
  
  /**
   * ✅ Use OpenAI to Categorize Missing Skills
   * @param {Array} missingSkills - List of missing skills
   * @returns {Object} - AI-categorized skills
   */
  const categorizeSkillsWithAI = async (missingSkills) => {
    if (missingSkills.length === 0) {
      return { missing_skills: [], categorized_skills: {} };
    }
    let cmpSkillsPrompt = formatData(SKILL_CMP_PROMPT)
    try{
        cmpSkillsPrompt = cmpSkillsPrompt.prompt
        .replace("{{missingSkills}}", JSON.stringify(missingSkills));
        let cmpSkills = await promptUtil(cmpSkillsPrompt)
        return JSON.parse(cmpSkills)
    }catch(error){
        throw new Error(error.message)
    }
}
  
  /**
   * ✅ Merge AI-Categorized Skills into Resume Skills
   * @param {Object} resumeSkills - Original resume technical skills
   * @param {Object} aiCategorizedSkills - AI-categorized skills
   * @returns {Object} - Updated resume technical skills
   */
  const mergeSkills = (resumeSkills, aiCategorizedSkills) => {
    const updatedTechnicalSkills = { ...resumeSkills };
  
    for (const [category, skills] of Object.entries(aiCategorizedSkills)) {
      if (!updatedTechnicalSkills[category]) {
        updatedTechnicalSkills[category] = [];
      }
      updatedTechnicalSkills[category].push(...skills);
    }
  
    return updatedTechnicalSkills;
  };


/**
 * ✅ Generate an Improved Professional Summary
 * @param {string} oldSummary - The professional summary from the user's resume
 * @param {string} jobDescription - The job description of the desired job
 * @returns {Promise<Object>} - JSON containing the improved professional summary
 */
export const generateImprovedSummary = async (oldSummary, jobDescription, companyName) => {
    let impSummPrompt = formatData(PROF_SUMM_PROMPT)

    try{
        impSummPrompt = impSummPrompt.prompt
        .replace("{{oldSummary}}", oldSummary)
        .replace("{{jobDescription}}", jobDescription)
        .replace("{{companyName}}", companyName);
        let impSumm = await promptUtil(impSummPrompt)
        return JSON.parse(impSumm)
    }catch(error){
        throw new Error(error.message)
    }
};


/**
 * ✅ Generate Resume Points for Missing Skills
 * @param {Array} missingSkills - The list of missing skills
 * @returns {Promise<Object>} - JSON containing generated resume points
 */
const generateResumePoints = async (missingSkills) => {
    let resPointPrompt = formatData(GEN_POINTS_PROMPT)

    try{
        resPointPrompt = resPointPrompt.prompt
        .replace("{{missingSkills}}", JSON.stringify(missingSkills, null, 2));
        let resPoints = await promptUtil(resPointPrompt)
        return JSON.parse(resPoints)
    }catch(error){
        throw new Error(error.message)
    }
};

/**
 * ✅ Enhance Work Experience by Adding Resume Points
 * @param {Array} workExperience - Work experience array
 * @param {Object} generatedResumePoints - Resume points grouped by skill
 * @returns {Array} - New work experience with resume points distributed
 */
const updateResumeWithGeneratedPoints = (workExperience, generatedResumePoints) => {
    console.log("🚀 Creating a new enhanced work experience...");
  
    // ✅ Extract actual resume points from OpenAI response
    const actualResumePoints = generatedResumePoints.resume_points || generatedResumePoints;
  
    // ✅ Deep copy work experience to avoid modifying the original data
    const newWorkExperience = JSON.parse(JSON.stringify(workExperience));
  
    // ✅ Track assigned resume points to evenly distribute across projects
    const assignedSkills = new Map();
  
    Object.entries(actualResumePoints).forEach(([skill, resumePoints]) => {
      let skillAdded = false;
  
      if (!Array.isArray(resumePoints)) {
        console.error(`⚠️ Skipping invalid resume points for ${skill}:`, resumePoints);
        return;
      }
  
      newWorkExperience.forEach(job => {
        job.projects.forEach(project => {
          const techStackLower = project.techStack.map(t => t.toLowerCase());
  
          // ✅ If skill already exists in tech stack, it's a relevant project
          if (techStackLower.some(existingSkill => existingSkill.startsWith(skill.toLowerCase()))) {
            if (!assignedSkills.has(skill)) {
              assignedSkills.set(skill, []);
            }
  
            const assignedPoints = assignedSkills.get(skill);
  
            // ✅ Distribute resume points evenly across multiple projects
            resumePoints.forEach(point => {
              if (!assignedPoints.includes(point)) {
                project.keyAchievements.push(point);
                assignedPoints.push(point);
                skillAdded = true;
              }
            });
          }
        });
      });
  
      // ✅ If no relevant project is found, assign it to multiple projects evenly
      if (!skillAdded && newWorkExperience.length > 0) {
        newWorkExperience.forEach((job, index) => {
          job.projects.forEach(project => {
            if (!assignedSkills.has(skill)) {
              assignedSkills.set(skill, []);
            }
  
            const assignedPoints = assignedSkills.get(skill);
  
            resumePoints.forEach((point, i) => {
              if (!assignedPoints.includes(point) && i % newWorkExperience.length === index) {
                project.keyAchievements.push(point);
                assignedPoints.push(point);
                project.techStack.push(skill); // ✅ Add missing skill to tech stack
              }
            });
          });
        });
      }
    });
  
    return newWorkExperience;
  };
  

export const genWorkExperience = async (workExperience, missingSkills) => {
    console.log("🔍 Step 1: Generating Resume Points...");
    const generatedResumePoints = await generateResumePoints(missingSkills);
    console.log("✅ Resume Points Generated:", generatedResumePoints);
  
    console.log("🔍 Step 2: Updating Work Experience with Resume Points...");
    const updatedWorkExperience = updateResumeWithGeneratedPoints(workExperience, generatedResumePoints);
  
    console.log("✅ Final Updated Work Experience:", updatedWorkExperience);
  
    return updatedWorkExperience;
};


const promptUtil = async (prompt) =>{
    try{
        const res = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            max_tokens: 4096,
         });
    
         return res.choices[0].message.content
    }catch(error){
        throw new Error(error.message)
    }
}

const formatData = (data) =>{
    let dataObj
    try {
        dataObj = JSON.parse(fs.readFileSync(data, "utf8"));
    } catch (error) {
        console.error("Error reading structurePrompt.json:", error);
        dataObj = { prompt: "" }; // Fallback
    }
    return dataObj
}