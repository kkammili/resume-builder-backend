import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.AI_KEY });

// ✅ Function to process JSON resume in parallel
const processResumeAsync = async (resumeJson) => {
  try {
    // Extract required fields
    const resumeText = JSON.stringify(resumeJson);
    const techSkills = resumeJson.technicalSkills;

    // Parallel operations using Promise.all()
    const [
      extractedResumeTechSkills,
      techSkillsAnalysis,
      professionalSummary,
      workExperienceJson,
      refinedWorkExperience,
      finalFormattedJson
    ] = await Promise.all([
      extractResumeTechSkills(techSkills),
      analyzeTechSkills(techSkills),
      generateProfessionalSummary(resumeText),
      transformWorkExperience(resumeJson.workExperience),
      refineWorkExperience(resumeJson.workExperience),
      // generateFinalJson(resumeJson)
    ]);

    // ✅ Construct the final output
    return {
      success: true,
      extractedResumeTechSkills,
      techSkillsAnalysis,
      professionalSummary,
      workExperienceJson,
      refinedWorkExperience,
      finalFormattedJson
    };

  } catch (error) {
    console.error("Error processing resume:", error);
    return { success: false, error: "Error processing resume" };
  }
};

// ✅ Asynchronous function to extract tech skills
const extractResumeTechSkills = async (techSkills) => {
  return Object.values(techSkills).flat(); // Combines all tech skills into a single array
};

// ✅ Asynchronous function to analyze tech skills using AI
const analyzeTechSkills = async (techSkills) => {
  const prompt = `Analyze the following technical skills: ${JSON.stringify(techSkills)} and provide insights.`;
  return callOpenAI(prompt);
};

// ✅ Asynchronous function to generate professional summary
const generateProfessionalSummary = async (resumeText) => {
  const prompt = `Rewrite this resume professional summary: ${resumeText}`;
  return callOpenAI(prompt);
};

// ✅ Asynchronous function to transform work experience into JSON
const transformWorkExperience = async (workExperience) => {
  const prompt = `Convert the following work experience into structured JSON: ${JSON.stringify(workExperience)}`;
  return callOpenAI(prompt);
};

// ✅ Asynchronous function to refine work experience details
const refineWorkExperience = async (workExperience) => {
  const prompt = `Refine the details of this work experience: ${JSON.stringify(workExperience)}`;
  return callOpenAI(prompt);
};

// ✅ Asynchronous function to generate final JSON
// const generateFinalJson = async (resumeJson) => {
//   const prompt = `Format the following resume JSON into a final refined JSON structure: ${JSON.stringify(resumeJson)}`;
//   return callOpenAI(prompt);
// };

// ✅ Utility function to call OpenAI
const callOpenAI = async (prompt) => {
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
    max_tokens: 500,
  });
  return response.choices[0].message.content;
};

export default processResumeAsync

// ✅ Example usage
// const sampleResumeJson = {
//   name: "John Doe",
//   contact: { location: "NY, USA", email: "johndoe@example.com", phone: "123-456-7890" },
//   professionalSummary: "Experienced software engineer...",
//   technicalSkills: {
//     frontendTechnologies: ["React.js", "Vue.js", "Angular"],
//     backendTechnologies: ["Node.js", "GraphQL", "MongoDB"],
//     devOpsAndTools: ["AWS", "Docker", "Jenkins"]
//   },
//   workExperience: [{ role: "Software Engineer", company: "TechCorp", startDate: "2020", endDate: "Present" }]
// };

// processResumeAsync(sampleResumeJson).then(console.log);
