const { useState, useEffect, useRef } = React;

// Utility functions
const cn = (...classes) => classes.filter(Boolean).join(" ");

const ResumeBuilder = () => {
  // Theme state
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  // Resume data state
  const [resumeData, setResumeData] = useState({
    name: "KRISHNAM RAJU KAMMILI",
    contact: {
      location: "Plano, TX",
      email: "kkrajus777@gmail.com",
      phone: "469-569-6257",
      linkedin: "in/@krishnamraju-kammili",
      website: "",
    },
    professionalSummary:
      "Senior Full Stack Developer with 8+ years of experience building scalable web applications and cloud-native platforms. Passionate about crafting robust frontend/backend solutions, streamlining DevOps workflows, and leading cross-functional teams. Awarded Lumen's 2022 Employee of the Year and Fidelity's Q2 2024 Most Valuable Associate.",
    technicalSkills: {
      Frontend: ["React", "Angular", "Vue.js", "TypeScript", "JavaScript"],
      Backend: ["Node.js", "Python", "Java", "Express", "Django"],
      "Cloud & DevOps": ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD"],
      Databases: ["MongoDB", "PostgreSQL", "MySQL", "Redis"],
    },
    workExperience: [
      {
        role: "Sr. Full Stack Developer",
        company: "Fidelity",
        location: "Durham, NC",
        startDate: "May 2023",
        endDate: "Present",
        projects: [
          {
            name: "Plan Sponsor WebStation (PSW) Modernization",
            description:
              "Led the modernization of the Plan Sponsor WebStation platform",
            keyAchievements: [
              "Improved data visualization, enabling real-time secure access",
              "Streamlined the cloud migration of legacy systems",
              "Introduced user-centric dashboards and form validations",
              "Built the Edithub frontend using Angular 18 with scalable architecture",
              "Maintained 95%+ test coverage (Jest) and integrated Cypress into CI/CD workflows",
            ],
            techStack: [
              "Angular 18",
              "NgRx Signal Store",
              "RxJS",
              "WireMock",
              "Jest",
              "Cypress",
              "AWS S3",
            ],
          },
        ],
      },
      {
        role: "Sr. Full Stack Developer",
        company: "Lumen",
        location: "Littleton, CO",
        startDate: "Oct 2021",
        endDate: "May 2023",
        projects: [
          {
            name: "Dycon - Global Self-Service Cloud Connectivity Portal",
            description:
              "Led the development of Dycon, a global self-service cloud connectivity portal",
            keyAchievements: [
              "Supported AWS, Azure, and GCP integrations",
              "Implemented scalable cloud-native architecture",
              "Reduced deployment time by 60% through automation",
            ],
            techStack: [
              "React",
              "Node.js",
              "AWS",
              "Azure",
              "GCP",
              "Docker",
              "Kubernetes",
            ],
          },
        ],
      },
    ],
    education: {
      degree: "Bachelor of Science in Computer Science",
      university: "University of Texas at Dallas",
      gpa: "3.8/4.0",
      year: "2016",
    },
    certifications: [
      "AWS Certified Solutions Architect",
      "Microsoft Azure Fundamentals",
      "Google Cloud Professional",
    ],
    awards: [
      "Lumen's 2022 Employee of the Year",
      "Fidelity's Q2 2024 Most Valuable Associate",
    ],
  });

  // UI state
  const [activeSection, setActiveSection] = useState("json");
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(resumeData, null, 2)
  );
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [resumeScore, setResumeScore] = useState(87);
  const [suggestions, setSuggestions] = useState([]);
  const [showNotifications, setShowNotifications] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLiveEditor, setShowLiveEditor] = useState(false);

  // Refs
  const liveEditorRef = useRef(null);

  // Theme management
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.className = theme;
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Notification system
  const showNotification = (message, type = "success") => {
    const id = Date.now();
    const notification = { id, message, type };
    setShowNotifications((prev) => [...prev, notification]);
    setTimeout(() => {
      setShowNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  // JSON validation
  const validateJson = async () => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      const parsedData = JSON.parse(jsonInput);

      const response = await fetch("http://localhost:3001/api/analyze/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: parsedData }),
      });

      const result = await response.json();

      if (result.success) {
        setResumeData(parsedData);
        setResumeScore(result.resumeScore);
        setSuggestions(result.suggestions);
        showNotification("Resume validated successfully!", "success");
      } else {
        setValidationErrors(result.formattedErrors || result.validationErrors);
        showNotification(
          "Validation failed. Please check the errors.",
          "error"
        );
      }
    } catch (error) {
      setValidationErrors(["Invalid JSON format. Please check your syntax."]);
      showNotification("Invalid JSON format.", "error");
    } finally {
      setIsValidating(false);
    }
  };

  // AI Analysis
  const analyzeWithAI = async () => {
    if (!jobDescription.trim()) {
      showNotification("Please enter a job description first.", "error");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("http://localhost:3001/api/analyze/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: resumeData,
          jd: jobDescription,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResumeData(result.updatedResume);
        setResumeScore(result.resumeScore);
        setSuggestions(result.suggestions);
        setJsonInput(JSON.stringify(result.updatedResume, null, 2));
        showNotification("Resume optimized successfully!", "success");
      } else {
        showNotification("Analysis failed. Please try again.", "error");
      }
    } catch (error) {
      showNotification("Analysis failed. Please try again.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Live editor functions
  const updateLiveEditor = (newData) => {
    setResumeData(newData);
    setJsonInput(JSON.stringify(newData, null, 2));
  };

  const sections = [
    { id: "json", label: "JSON Editor", icon: "fas fa-code" },
    { id: "live", label: "Live Editor", icon: "fas fa-edit" },
    { id: "preview", label: "Preview", icon: "fas fa-eye" },
    { id: "ai", label: "AI Analysis", icon: "fas fa-robot" },
  ];

  // Components
  const JsonEditor = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">JSON Resume Editor</h3>
        <button
          onClick={validateJson}
          disabled={isValidating}
          className="toolbar-btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isValidating ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Validating...
            </>
          ) : (
            <>
              <i className="fas fa-check mr-2"></i>
              Validate JSON
            </>
          )}
        </button>
      </div>

      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        className="json-editor w-full h-96 p-4 resize-none"
        placeholder="Paste your resume JSON here..."
      />

      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            Validation Errors:
          </h4>
          <ul className="space-y-1">
            {validationErrors.map((error, index) => (
              <li
                key={index}
                className="text-red-700 dark:text-red-300 text-sm"
              >
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

      </div>

      {showLiveEditor && (
        <div className="space-y-6">
          {/* Contact Section */}
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={resumeData.name}
                onChange={(e) =>
                  updateLiveEditor({ ...resumeData, name: e.target.value })
                }
                className="p-2 border rounded bg-background text-foreground"
              />
              <input
                type="email"
                placeholder="Email"
                value={resumeData.contact.email}
                onChange={(e) =>
                  updateLiveEditor({
                    ...resumeData,
                    contact: { ...resumeData.contact, email: e.target.value },
                  })
                }
                className="p-2 border rounded bg-background text-foreground"
              />
              <input
                type="text"
                placeholder="Phone"
                value={resumeData.contact.phone}
                onChange={(e) =>
                  updateLiveEditor({
                    ...resumeData,
                    contact: { ...resumeData.contact, phone: e.target.value },
                  })
                }
                className="p-2 border rounded bg-background text-foreground"
              />
              <input
                type="text"
                placeholder="Location"
                value={resumeData.contact.location}
                onChange={(e) =>
                  updateLiveEditor({
                    ...resumeData,
                    contact: {
                      ...resumeData.contact,
                      location: e.target.value,
                    },
                  })
                }
                className="p-2 border rounded bg-background text-foreground"
              />
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Professional Summary</h4>
            <textarea
              value={resumeData.professionalSummary}
              onChange={(e) =>
                updateLiveEditor({
                  ...resumeData,
                  professionalSummary: e.target.value,
                })
              }
              className="w-full p-3 border rounded h-32 bg-background text-foreground resize-none"
              placeholder="Write your professional summary..."
            />
          </div>

          {/* Skills Section */}
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Technical Skills</h4>
            {Object.entries(resumeData.technicalSkills).map(
              ([category, skills]) => (
                <div key={category} className="mb-4">
                  <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => {
                      const newSkills = { ...resumeData.technicalSkills };
                      delete newSkills[category];
                      newSkills[e.target.value] = skills;
                      updateLiveEditor({
                        ...resumeData,
                        technicalSkills: newSkills,
                      });
                    }}
                    className="p-2 border rounded bg-background text-foreground mb-2"
                  />
                  <textarea
                    value={skills.join(", ")}
                    onChange={(e) => {
                      const newSkills = { ...resumeData.technicalSkills };
                      newSkills[category] = e.target.value
                        .split(", ")
                        .filter((s) => s.trim());
                      updateLiveEditor({
                        ...resumeData,
                        technicalSkills: newSkills,
                      });
                    }}
                    className="w-full p-2 border rounded bg-background text-foreground"
                    placeholder="Skills separated by commas"
                  />
                </div>
              )
            )}
            <button
              onClick={() => {
                const newSkills = {
                  ...resumeData.technicalSkills,
                  "New Category": [],
                };
                updateLiveEditor({ ...resumeData, technicalSkills: newSkills });
              }}
              className="toolbar-btn bg-green-600 text-white hover:bg-green-700"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Skill Category
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const ResumePreview = () => (
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

  const AIAnalysis = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI Resume Analysis</h3>
        <button
          onClick={analyzeWithAI}
          disabled={isAnalyzing || !jobDescription.trim()}
          className="toolbar-btn bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Analyzing...
            </>
          ) : (
            <>
              <i className="fas fa-magic mr-2"></i>
              Optimize Resume
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Description Input */}
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Job Description</h4>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3 border rounded h-64 bg-background text-foreground resize-none"
            placeholder="Paste the job description here to get AI suggestions..."
          />
        </div>

        {/* Analysis Results */}
        <div className="space-y-4">
          {/* Resume Score */}
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Resume Score</h4>
            <div className="flex items-center space-x-4">
              <div className="score-circle w-16 h-16">
                <div className="score-inner w-full h-full text-lg">
                  {resumeScore}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {resumeScore}/100
                </p>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-semibold mb-3">AI Suggestions</h4>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
                  <span className="text-sm text-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "json":
        return <JsonEditor />;
      case "preview":
        return <ResumePreview />;
      case "ai":
        return <AIAnalysis />;
      default:
        return <JsonEditor />;
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary">
            <i className="fas fa-file-alt mr-2"></i>
            AI Resume Builder
          </h1>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? (
              <i className="fas fa-moon text-foreground"></i>
            ) : (
              <i className="fas fa-sun text-foreground"></i>
            )}
          </button>
          <button
            onClick={() => setActiveSection("ai")}
            className="toolbar-btn bg-purple-600 text-white hover:bg-purple-700"
          >
            <i className="fas fa-robot mr-2"></i>AI Optimize
          </button>
          <button
            onClick={() => window.print()}
            className="toolbar-btn bg-blue-600 text-white hover:bg-blue-700"
          >
            <i className="fas fa-download mr-2"></i>Download PDF
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 sidebar p-6">
          <div className="space-y-2 mb-6">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded cursor-pointer transition-colors",
                  activeSection === section.id
                    ? "section-active"
                    : "hover:bg-accent"
                )}
              >
                <i className={`${section.icon} text-muted-foreground`}></i>
                <span className="font-medium text-foreground">
                  {section.label}
                </span>
              </div>
            ))}
          </div>

          {/* Resume Score */}
          <div className="bg-card border rounded-lg p-6 text-center mb-6">
            <h3 className="font-semibold text-foreground mb-4">Resume Score</h3>
            <div className="score-circle w-24 h-24 mx-auto mb-4">
              <div className="score-inner w-full h-full text-2xl">
                {resumeScore}
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              {resumeScore >= 90
                ? "Excellent"
                : resumeScore >= 80
                ? "Good"
                : resumeScore >= 70
                ? "Fair"
                : "Needs Improvement"}
            </p>
            <button
              onClick={() => setActiveSection("ai")}
              className="mt-3 toolbar-btn bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              <i className="fas fa-chart-line mr-2"></i>
              Improve Score
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">{renderActiveSection()}</div>
      </div>

      {/* Notifications */}
      {showNotifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "notification",
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          )}
        >
          <div className="flex items-center space-x-2">
            <i
              className={`fas fa-${
                notification.type === "success"
                  ? "check-circle"
                  : "exclamation-circle"
              }`}
            ></i>
            <span>{notification.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

ReactDOM.render(<ResumeBuilder />, document.getElementById("root"));
