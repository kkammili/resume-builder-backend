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