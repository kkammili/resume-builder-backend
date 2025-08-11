import React from 'react';

const ResumePreview = ({ resumeData }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Resume Preview</h3>
      <button
        onClick={() => window.print()}
        className="toolbar-btn bg-blue-600 text-white hover:bg-blue-700"
      >
        <i className="fas fa-download mr-2"></i>
        Download PDF
      </button>
    </div>

    <div className="resume-preview p-8 rounded-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center border-b pb-6 mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {resumeData.name}
        </h1>
        <div className="text-muted-foreground space-x-4">
          <span>
            <i className="fas fa-envelope mr-1"></i>
            {resumeData.contact.email}
          </span>
          <span>
            <i className="fas fa-phone mr-1"></i>
            {resumeData.contact.phone}
          </span>
          <span>
            <i className="fas fa-map-marker-alt mr-1"></i>
            {resumeData.contact.location}
          </span>
          {resumeData.contact.linkedin && (
            <span>
              <i className="fab fa-linkedin mr-1"></i>
              {resumeData.contact.linkedin}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground border-b-2 border-primary pb-2 mb-4">
          SUMMARY
        </h2>
        <p className="text-foreground leading-relaxed">
          {resumeData.professionalSummary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground border-b-2 border-primary pb-2 mb-4">
          EXPERIENCE
        </h2>
        {resumeData.workExperience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-foreground">{exp.role}</h3>
                <p className="text-muted-foreground">
                  {exp.company} • {exp.location}
                </p>
              </div>
              <span className="text-muted-foreground text-sm">
                {exp.startDate} - {exp.endDate}
              </span>
            </div>
            {exp.projects.map((project, pIndex) => (
              <div key={pIndex} className="mb-3">
                <h4 className="font-semibold text-foreground">
                  {project.name}
                </h4>
                {project.description && (
                  <p className="text-muted-foreground mb-2">
                    {project.description}
                  </p>
                )}
                <ul className="list-disc list-inside text-foreground space-y-1">
                  {project.keyAchievements.map((achievement, aIndex) => (
                    <li key={aIndex}>{achievement}</li>
                  ))}
                </ul>
                {project.techStack && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">
                      Tech Stack:{" "}
                    </span>
                    <span className="text-sm text-foreground">
                      {project.techStack.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground border-b-2 border-primary pb-2 mb-4">
          SKILLS
        </h2>
        {Object.entries(resumeData.technicalSkills).map(
          ([category, skills]) => (
            <div key={category} className="mb-3">
              <h3 className="font-semibold text-foreground mb-2">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground border-b-2 border-primary pb-2 mb-4">
          EDUCATION
        </h2>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-foreground">
              {resumeData.education.degree}
            </h3>
            <p className="text-muted-foreground">
              {resumeData.education.university}
            </p>
            {resumeData.education.gpa && (
              <p className="text-muted-foreground text-sm">
                GPA: {resumeData.education.gpa}
              </p>
            )}
          </div>
          {resumeData.education.year && (
            <span className="text-muted-foreground text-sm">
              {resumeData.education.year}
            </span>
          )}
        </div>
      </div>

      {/* Certifications */}
      {resumeData.certifications && resumeData.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground border-b-2 border-primary pb-2 mb-4">
            CERTIFICATIONS
          </h2>
          <ul className="list-disc list-inside text-foreground space-y-1">
            {resumeData.certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Awards */}
      {resumeData.awards && resumeData.awards.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground border-b-2 border-primary pb-2 mb-4">
            AWARDS & HONORS
          </h2>
          <ul className="list-disc list-inside text-foreground space-y-1">
            {resumeData.awards.map((award, index) => (
              <li key={index}>{award}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

export default ResumePreview;
