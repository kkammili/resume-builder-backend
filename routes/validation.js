
import Joi from 'joi';

export const resumeValidationSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    contact: Joi.object({
        location: Joi.string().max(200).allow(''),
        email: Joi.string().email().allow(''),
        phone: Joi.string().allow('')
    }).required(),
    professionalSummary: Joi.string().min(10).max(2000).required(),
    technicalSkills: Joi.object().pattern(
        Joi.string(),
        Joi.array().items(Joi.string())
    ).required(),
    workExperience: Joi.array().items(
        Joi.object({
            role: Joi.string().required(),
            company: Joi.string().required(),
            location: Joi.string(),
            startDate: Joi.string().required(),
            endDate: Joi.string().required(),
            projects: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    description: Joi.string(),
                    keyAchievements: Joi.array().items(Joi.string()),
                    techStack: Joi.array().items(Joi.string())
                })
            )
        })
    ).min(1).required(),
    education: Joi.object({
        degree: Joi.string().required(),
        university: Joi.string().required(),
        gpa: Joi.string()
    }),
    portfolio: Joi.object({
        github: Joi.string().uri(),
        webPortfolio: Joi.string().uri(),
        projects: Joi.array().items(Joi.string())
    })
});

export const validateResume = (resumeData) => {
    const { error, value } = resumeValidationSchema.validate(resumeData, {
        abortEarly: false,
        stripUnknown: true
    });
    
    if (error) {
        const validationErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));
        return { isValid: false, errors: validationErrors };
    }
    
    return { isValid: true, data: value };
};
