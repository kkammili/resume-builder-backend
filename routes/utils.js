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