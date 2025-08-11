import Joi from "joi";

export const resumeValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
  }),
  contact: Joi.object({
    location: Joi.string().max(200).allow("").messages({
      "string.max": "Location cannot exceed 200 characters",
    }),
    email: Joi.string().email().allow("").messages({
      "string.email": "Please provide a valid email address",
    }),
    phone: Joi.string().allow("").messages({
      "string.empty": "Phone number is optional",
    }),
    linkedin: Joi.string().allow("").messages({
      "string.uri": "Please provide a valid LinkedIn URL",
    }),
    website: Joi.string().uri().allow("").messages({
      "string.uri": "Please provide a valid website URL",
    }),
  })
    .required()
    .messages({
      "object.base": "Contact information is required",
    }),
  professionalSummary: Joi.string().min(10).max(2000).required().messages({
    "string.empty": "Professional summary is required",
    "string.min": "Professional summary must be at least 10 characters long",
    "string.max": "Professional summary cannot exceed 2000 characters",
  }),
  technicalSkills: Joi.object()
    .pattern(Joi.string(), Joi.array().items(Joi.string().min(1)))
    .required()
    .messages({
      "object.base": "Technical skills are required",
      "object.pattern.base": "Technical skills must be organized by category",
    }),
  workExperience: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().required().messages({
          "string.empty": "Job role is required",
        }),
        company: Joi.string().required().messages({
          "string.empty": "Company name is required",
        }),
        location: Joi.string().allow(""),
        startDate: Joi.string().required().messages({
          "string.empty": "Start date is required",
        }),
        endDate: Joi.string().required().messages({
          "string.empty": "End date is required",
        }),
        projects: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required().messages({
                "string.empty": "Project name is required",
              }),
              description: Joi.string().allow(""),
              keyAchievements: Joi.array().items(Joi.string().min(1)).messages({
                "array.base": "Key achievements must be an array of strings",
              }),
              techStack: Joi.array().items(Joi.string().min(1)).messages({
                "array.base": "Tech stack must be an array of strings",
              }),
            })
          )
          .min(1)
          .messages({
            "array.min": "At least one project is required per work experience",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Work experience is required",
      "array.min": "At least one work experience entry is required",
    }),
  education: Joi.object({
    degree: Joi.string().required().messages({
      "string.empty": "Degree is required",
    }),
    university: Joi.string().required().messages({
      "string.empty": "University name is required",
    }),
    gpa: Joi.string().allow(""),
    year: Joi.string().allow(""),
  })
    .required()
    .messages({
      "object.base": "Education information is required",
    }),
  portfolio: Joi.object({
    github: Joi.string().uri().allow("").messages({
      "string.uri": "Please provide a valid GitHub URL",
    }),
    webPortfolio: Joi.string().uri().allow("").messages({
      "string.uri": "Please provide a valid portfolio URL",
    }),
    projects: Joi.array().items(Joi.string().min(1)).messages({
      "array.base": "Projects must be an array of strings",
    }),
  }).optional(),
  certifications: Joi.array().items(Joi.string().min(1)).optional().messages({
    "array.base": "Certifications must be an array of strings",
  }),
  awards: Joi.array().items(Joi.string().min(1)).optional().messages({
    "array.base": "Awards must be an array of strings",
  }),
});

export const validateResume = (resumeData) => {
  const { error, value } = resumeValidationSchema.validate(resumeData, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false,
  });

  if (error) {
    const validationErrors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
      type: detail.type,
    }));
    return { isValid: false, errors: validationErrors };
  }

  return { isValid: true, data: value };
};

// Helper function to format validation errors for user display
export const formatValidationErrors = (errors) => {
  return errors.map((error) => {
    const fieldName = error.field.split(".").pop();
    const readableField =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    return `${readableField}: ${error.message}`;
  });
};
