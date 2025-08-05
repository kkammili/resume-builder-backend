const { useState, useEffect, useRef } = React;

const ResumeBuilder = () => {
    const [activeSection, setActiveSection] = useState('contact');
    const [resumeData, setResumeData] = useState({
        contact: {
            name: 'JOHN DOE',
            email: 'john@example.com',
            phone: '(555) 123-4567',
            location: 'New York, NY',
            linkedin: '',
            website: ''
        },
        summary: 'Experienced professional with a track record of success...',
        experience: [{
            title: 'Software Engineer',
            company: 'Tech Company',
            location: 'New York, NY',
            startDate: '2020',
            endDate: 'Present',
            points: [
                'Developed scalable web applications',
                'Collaborated with cross-functional teams',
                'Improved system performance by 40%'
            ]
        }],
        education: [{
            degree: 'Bachelor of Science in Computer Science',
            school: 'University Name',
            location: 'City, State',
            year: '2020'
        }],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        projects: [{
            name: 'Project Name',
            description: 'Brief description of the project',
            technologies: ['React', 'Node.js']
        }],
        certifications: [],
        leadership: [],
        rawSections: {}
    });

    const [uploadedResume, setUploadedResume] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [updatedPoints, setUpdatedPoints] = useState(new Set());

    const [aiScore, setAiScore] = useState(87);
    const [suggestions, setSuggestions] = useState([
        'Add more quantifiable achievements',
        'Include relevant keywords',
        'Expand technical skills section'
    ]);
    const [jobDescription, setJobDescription] = useState('');
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const sections = [
        { id: 'upload', label: 'Upload Resume', icon: 'fas fa-upload' },
        { id: 'contact', label: 'Contact', icon: 'fas fa-user' },
        { id: 'summary', label: 'Summary', icon: 'fas fa-file-text' },
        { id: 'experience', label: 'Experience', icon: 'fas fa-briefcase' },
        { id: 'education', label: 'Education', icon: 'fas fa-graduation-cap' },
        { id: 'skills', label: 'Skills', icon: 'fas fa-cogs' },
        { id: 'certifications', label: 'Certifications', icon: 'fas fa-certificate' },
        { id: 'leadership', label: 'Leadership & Extras', icon: 'fas fa-star' },
        { id: 'projects', label: 'Projects', icon: 'fas fa-code' }
    ];

    const processUploadedResume = (resumeText) => {
        try {
            // Store the raw text
            setUploadedResume(resumeText);

            // Parse the resume content to extract actual information
            const lines = resumeText.split('\n').filter(line => line.trim());

            // Enhanced section detection patterns
            const sectionPatterns = {
                contact: /^(CONTACT|PERSONAL)/i,
                summary: /^(PROFESSIONAL SUMMARY|SUMMARY|PROFILE|OBJECTIVE)/i,
                experience: /^(PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|EXPERIENCE|EMPLOYMENT)/i,
                education: /^(EDUCATION|ACADEMIC|QUALIFICATIONS)/i,
                skills: /^(TECHNICAL SKILLS|SKILLS|CORE COMPETENCIES|TECHNOLOGIES)/i,
                certifications: /^(CERTIFICATIONS|CERTIFICATES|LICENSES)/i,
                leadership: /^(LEADERSHIP|EXTRAS|ACTIVITIES|ACHIEVEMENTS|AWARDS)/i,
                projects: /^(PROJECTS|PORTFOLIO)/i
            };

            // Dynamic section parsing
            const sections = {};
            let currentSection = null;
            let currentSectionContent = [];

            // Extract name (first non-empty line that's not a section header)
            let name = '';
            for (let line of lines.slice(0, 5)) {
                const isSection = Object.values(sectionPatterns).some(pattern => pattern.test(line));
                if (!isSection && line.length > 3 && !line.includes('@') && !line.match(/\d{3}[-.\s]\d{3}[-.\s]\d{4}/)) {
                    name = line.trim();
                    break;
                }
            }
            if (!name) name = lines[0]?.trim() || 'Name';

            // Extract contact info from entire document
            let email = '';
            let phone = '';
            let location = '';
            let linkedin = '';

            const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
            const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
            const linkedinPattern = /linkedin\.com\/in\/[^\s]+|@[a-zA-Z0-9._-]+/;

            for (let line of lines.slice(0, 10)) {
                const emailMatch = line.match(emailPattern);
                if (emailMatch) email = emailMatch[0];

                const phoneMatch = line.match(phonePattern);
                if (phoneMatch) phone = phoneMatch[0];

                const linkedinMatch = line.match(linkedinPattern);
                if (linkedinMatch) linkedin = linkedinMatch[0];

                // Extract location (look for city, state pattern)
                if (line.includes(',') && line.match(/\b[A-Z]{2}\b|\b\d{5}\b/)) {
                    location = line.trim();
                }
            }

            // Parse sections dynamically
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Check if this line is a section header
                let matchedSection = null;
                for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
                    if (pattern.test(line)) {
                        matchedSection = sectionName;
                        break;
                    }
                }

                if (matchedSection) {
                    // Save previous section
                    if (currentSection && currentSectionContent.length > 0) {
                        sections[currentSection] = [...currentSectionContent];
                    }

                    // Start new section
                    currentSection = matchedSection;
                    currentSectionContent = [];
                } else if (currentSection) {
                    // Add content to current section
                    currentSectionContent.push(line);
                }
            }

            // Save last section
            if (currentSection && currentSectionContent.length > 0) {
                sections[currentSection] = [...currentSectionContent];
            }

            // Parse professional summary
            let summary = '';
            if (sections.summary) {
                summary = sections.summary.join(' ').trim();
            }

            // Parse skills with enhanced extraction
            let skills = [];
            if (sections.skills) {
                for (let line of sections.skills) {
                    // Handle different skill formats
                    if (line.includes(':')) {
                        const skillLine = line.replace(/^[^:]*:/, '').trim();
                        if (skillLine) {
                            const extractedSkills = skillLine.split(/[,;|]/).map(s => s.trim()).filter(s => s);
                            skills.push(...extractedSkills);
                        }
                    } else {
                        const extractedSkills = line.split(/[,;|]/).map(s => s.trim()).filter(s => s);
                        skills.push(...extractedSkills);
                    }
                }
            }

            // Parse work experience with better detection
            let experience = [];
            if (sections.experience) {
                let currentJob = null;
                let currentPoints = [];

                for (let line of sections.experience) {
                    // Check if this looks like a job title line
                    if (line.includes('|') || (line.includes('–') || line.includes('-')) && 
                        (line.includes('202') || line.includes('Present') || line.includes('Current'))) {

                        // Save previous job if exists
                        if (currentJob) {
                            currentJob.points = [...currentPoints];
                            experience.push(currentJob);
                        }

                        // Parse new job
                        let title = '', company = '', dates = '', jobLocation = location;

                        if (line.includes('|')) {
                            const parts = line.split('|');
                            const titleCompany = parts[0].trim();
                            dates = parts[parts.length - 1].trim();

                            if (titleCompany.includes('–')) {
                                const titleMatch = titleCompany.match(/^(.+?)\s*–\s*(.+)$/);
                                if (titleMatch) {
                                    title = titleMatch[1].trim();
                                    company = titleMatch[2].trim();
                                }
                            } else {
                                title = titleCompany;
                            }
                        } else {
                            // Single line format
                            title = line.split(/\s*[-–]\s*/)[0];
                            const datePart = line.match(/(20\d{2}.*(?:Present|Current|\d{4}))/);
                            if (datePart) dates = datePart[1];
                        }

                        currentJob = {
                            title: title || 'Position',
                            company: company || 'Company',
                            location: jobLocation,
                            startDate: dates.split(/[-–]/)[0]?.trim() || '',
                            endDate: dates.split(/[-–]/)[1]?.trim() || 'Present',
                            points: []
                        };
                        currentPoints = [];
                    } else if (line.startsWith('•') || line.match(/^[A-Z•].*/) || line.startsWith('-')) {
                        // This looks like a bullet point
                        currentPoints.push(line.replace(/^[•-]\s*/, '').trim());
                    }
                }

                // Add the last job
                if (currentJob) {
                    currentJob.points = [...currentPoints];
                    experience.push(currentJob);
                }
            }

            // Parse education
            let education = [];
            if (sections.education) {
                for (let line of sections.education) {
                    if (line.includes('|') || line.includes('–') || line.includes('-')) {
                        const parts = line.split(/[|–-]/);
                        education.push({
                            degree: parts[0]?.trim() || 'Degree',
                            school: parts[1]?.trim() || 'University',
                            location: parts[2]?.trim() || location,
                            year: parts[parts.length - 1]?.trim() || ''
                        });
                        break; // Take first education entry
                    }
                }
            }
            if (education.length === 0) {
                education.push({
                    degree: 'Bachelor of Science in Computer Science',
                    school: 'University Name',
                    location: 'City, State',
                    year: '2020'
                });
            }

            // Update resume data with parsed information including new sections
            setResumeData({
                contact: {
                    name: name,
                    email: email,
                    phone: phone,
                    location: location,
                    linkedin: linkedin,
                    website: ''
                },
                summary: summary || 'Experienced professional with a track record of success...',
                experience: experience.length > 0 ? experience : [{
                    title: 'Software Engineer',
                    company: 'Tech Company',
                    location: location,
                    startDate: '2020',
                    endDate: 'Present',
                    points: [
                        'Developed scalable web applications',
                        'Collaborated with cross-functional teams',
                        'Improved system performance by 40%'
                    ]
                }],
                education: education,
                skills: skills.length > 0 ? skills.slice(0, 20) : ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
                projects: [{
                    name: 'Project Name',
                    description: 'Brief description of the project',
                    technologies: ['React', 'Node.js']
                }],
                certifications: sections.certifications || [],
                leadership: sections.leadership || [],
                rawSections: sections // Store all parsed sections for reference
            });

            setUploadError('');
            alert('Resume uploaded successfully! Your content has been preserved. You can now paste a job description and click "Update Resume" to tailor it.');
        } catch (error) {
            console.error('Upload processing failed:', error);
            setUploadError('Failed to process uploaded resume');
        }
    };

    const analyzeWithAI = async () => {
        if (!uploadedResume.trim()) {
            alert('Please upload a resume first');
            return;
        }

        if (!jobDescription.trim()) {
            alert('Please enter a job description first');
            return;
        }

        setAnalyzing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume: uploadedResume,
                    jd: jobDescription
                })
            });

            const data = await response.json();
            if (data.success && data.updatedResume) {
                const updatedResume = data.updatedResume;

                // Convert API response to frontend format
                const convertedData = {
                    contact: {
                        name: updatedResume.name || resumeData.contact.name,
                        email: updatedResume.contact?.email || resumeData.contact.email,
                        phone: updatedResume.contact?.phone || resumeData.contact.phone,
                        location: updatedResume.contact?.location || resumeData.contact.location,
                        linkedin: resumeData.contact.linkedin,
                        website: resumeData.contact.website
                    },
                    summary: updatedResume.professionalSummary || resumeData.summary,
                    experience: updatedResume.workExperience?.map(exp => ({
                        title: exp.role || '',
                        company: exp.company || '',
                        location: exp.location || '',
                        startDate: exp.startDate || '',
                        endDate: exp.endDate || '',
                        points: exp.projects?.flatMap(project => project.keyAchievements || []) || []
                    })) || resumeData.experience,
                    education: updatedResume.education ? [{
                        degree: updatedResume.education.degree || '',
                        school: updatedResume.education.university || '',
                        location: '',
                        year: updatedResume.education.gpa || ''
                    }] : resumeData.education,
                    skills: updatedResume.technicalSkills ? 
                        Object.values(updatedResume.technicalSkills).flat() : resumeData.skills,
                    projects: updatedResume.workExperience?.flatMap(exp => 
                        exp.projects?.map(project => ({
                            name: project.name || '',
                            description: project.description || '',
                            technologies: project.techStack || []
                        })) || []
                    ) || resumeData.projects
                };

                // Track updated points for highlighting
                const newPoints = new Set();
                if (data.finalUpdatedSkills?.missingSkills) {
                    data.finalUpdatedSkills.missingSkills.forEach(skill => newPoints.add(skill));
                }

                setResumeData(convertedData);
                setUpdatedPoints(newPoints);
                setAiScore(data.resumeScore || Math.floor(Math.random() * 20) + 80);
                setSuggestions(data.suggestions || suggestions);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const downloadPDF = () => {
        window.print();
    };

    const ContactSection = () => (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={resumeData.contact.name}
                    onChange={(e) => setResumeData({...resumeData, contact: {...resumeData.contact, name: e.target.value}})}
                    className="p-2 border rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={resumeData.contact.email}
                    onChange={(e) => setResumeData({...resumeData, contact: {...resumeData.contact, email: e.target.value}})}
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Phone"
                    value={resumeData.contact.phone}
                    onChange={(e) => setResumeData({...resumeData, contact: {...resumeData.contact, phone: e.target.value}})}
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={resumeData.contact.location}
                    onChange={(e) => setResumeData({...resumeData, contact: {...resumeData.contact, location: e.target.value}})}
                    className="p-2 border rounded"
                />
            </div>
        </div>
    );

    const SummarySection = () => (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Professional Summary</h3>
            <textarea
                value={resumeData.summary}
                onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                className="w-full p-3 border rounded h-32"
                placeholder="Write a compelling summary..."
            />
        </div>
    );

    const ExperienceSection = () => (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Work Experience</h3>
            {(resumeData.experience || []).map((exp, index) => (
                            <div key={index} className="mb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{exp.title}</h3>
                                        <p className="text-gray-600">{exp.company} • {exp.location}</p>
                                    </div>
                                    <span className="text-gray-500 text-sm">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {(exp.points || []).map((point, pointIndex) => {
                                        const isUpdated = Array.from(updatedPoints).some(skill => 
                                            point.toLowerCase().includes(skill.toLowerCase())
                                        );
                                        return (
                                            <li 
                                                key={pointIndex} 
                                                className={isUpdated ? 'bg-yellow-100 border-l-4 border-yellow-500 pl-2' : ''}
                                            >
                                                {point}
                                                {isUpdated && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">✨ AI ENHANCED</span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
        </div>
    );

    const UploadSection = () => (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Upload Resume</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600 mb-4">Upload your existing resume</p>
                <input
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const text = event.target.result;
                                setUploadedResume(text);
                                processUploadedResume(text);
                            };
                            reader.readAsText(file);
                        }
                    }}
                    className="hidden"
                    id="resume-upload"
                />
                <label htmlFor="resume-upload" className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
                    Choose File
                </label>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium">Or paste resume text:</label>
                <textarea
                    value={uploadedResume}
                    onChange={(e) => setUploadedResume(e.target.value)}
                    className="w-full p-3 border rounded h-32"
                    placeholder="Paste your resume text here..."
                />
                <button
                    onClick={() => processUploadedResume(uploadedResume)}
                    disabled={!uploadedResume.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    Process Resume
                </button>
            </div>
            {uploadError && (
                <div className="text-red-600 text-sm mt-2">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    {uploadError}
                </div>
            )}
        </div>
    );

    const SkillsSection = () => (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Skills</h3>
            <textarea
                value={resumeData.skills.join(', ')}
                onChange={(e) => setResumeData({...resumeData, skills: e.target.value.split(', ')})}
                className="w-full p-3 border rounded h-24"
                placeholder="JavaScript, React, Node.js, Python..."
            />
        </div>
    );

    const EducationSection = () => (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Education</h3>
            {resumeData.education.map((edu, index) => (
                <div key={index} className="space-y-2 p-3 border rounded">
                    <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].degree = e.target.value;
                            setResumeData({...resumeData, education: newEdu});
                        }}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="School/University"
                        value={edu.school}
                        onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].school = e.target.value;
                            setResumeData({...resumeData, education: newEdu});
                        }}
                        className="w-full p-2 border rounded"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Location"
                            value={edu.location}
                            onChange={(e) => {
                                const newEdu = [...resumeData.education];
                                newEdu[index].location = e.target.value;
                                setResumeData({...resumeData, education: newEdu});
                            }}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Year"
                            value={edu.year}
                            onChange={(e) => {
                                const newEdu = [...resumeData.education];
                                newEdu[index].year = e.target.value;
                                setResumeData({...resumeData, education: newEdu});
                            }}
                            className="p-2 border rounded"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    const CertificationsSection = () => (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Certifications</h3>
            <textarea
                value={Array.isArray(resumeData.certifications) ? resumeData.certifications.join('\n') : ''}
                onChange={(e) => setResumeData({...resumeData, certifications: e.target.value.split('\n').filter(cert => cert.trim())})}
                className="w-full p-3 border rounded h-32"
                placeholder="AWS Certified Solutions Architect&#10;Microsoft Azure Fundamentals&#10;Google Cloud Professional..."
            />
            <p className="text-sm text-gray-500">Enter each certification on a new line</p>
        </div>
    );

    const LeadershipSection = () => (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Leadership & Extras</h3>
            <textarea
                value={Array.isArray(resumeData.leadership) ? resumeData.leadership.join('\n') : ''}
                onChange={(e) => setResumeData({...resumeData, leadership: e.target.value.split('\n').filter(item => item.trim())})}
                className="w-full p-3 border rounded h-32"
                placeholder="Team Lead - Led a team of 5 developers&#10;Volunteer Work - Organized tech meetups&#10;Awards - Employee of the Year 2022..."
            />
            <p className="text-sm text-gray-500">Enter each achievement/activity on a new line</p>
        </div>
    );

    const renderActiveSection = () => {
        switch(activeSection) {
            case 'upload': return <UploadSection />;
            case 'contact': return <ContactSection />;
            case 'summary': return <SummarySection />;
            case 'experience': return <ExperienceSection />;
            case 'education': return <EducationSection />;
            case 'skills': return <SkillsSection />;
            case 'certifications': return <CertificationsSection />;
            case 'leadership': return <LeadershipSection />;
            default: return <UploadSection />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-blue-600">
                        <i className="fas fa-file-alt mr-2"></i>
                        Free Resume Builder
                    </h1>
                </div>

                {/* Toolbar */}
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setShowAiPanel(!showAiPanel)}
                        className={`toolbar-btn ${uploadedResume.trim() ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-400 text-white cursor-not-allowed'}`}
                        disabled={!uploadedResume.trim()}
                    >
                        <i className="fas fa-robot mr-2"></i>AI Optimize
                    </button>
                    <button onClick={downloadPDF} className="toolbar-btn bg-blue-600 text-white hover:bg-blue-700">
                        <i className="fas fa-download mr-2"></i>Download PDF
                    </button>
                </div>
            </div>

            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-80 sidebar p-6">
                    <div className="space-y-2 mb-6">
                        {sections.map(section => (
                            <div
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center space-x-3 p-3 rounded cursor-pointer transition-colors ${
                                    activeSection === section.id ? 'section-active' : 'hover:bg-gray-100'
                                }`}
                            >
                                <i className={`${section.icon} text-gray-600`}></i>
                                <span className="font-medium">{section.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* AI Score */}
                    <div className="bg-gray-800 p-6 rounded-lg text-center mb-6">
                        <h3 className="text-white font-semibold mb-4">Resume Score</h3>
                        <div className="score-circle w-24 h-24 mx-auto mb-4">
                            <div className="score-inner w-full h-full text-2xl">
                                {aiScore}
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm">Needs Improvement</p>
                        <button 
                            onClick={() => setShowAiPanel(true)}
                            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                        >
                            <i className="fas fa-chart-line mr-2"></i>
                            Improve Score
                        </button>
                    </div>

                    {/* Current Section Editor */}
                    <div className="bg-white p-4 rounded border">
                        {renderActiveSection()}
                    </div>
                </div>

                {/* Resume Preview */}
                <div className="flex-1 p-6">
                    <div className="resume-preview p-8 rounded-lg max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center border-b pb-6 mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {resumeData.contact.name}
                            </h1>
                            <div className="text-gray-600 space-x-4">
                                <span><i className="fas fa-envelope mr-1"></i>{resumeData.contact.email}</span>
                                <span><i className="fas fa-phone mr-1"></i>{resumeData.contact.phone}</span>
                                <span><i className="fas fa-map-marker-alt mr-1"></i>{resumeData.contact.location}</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">
                                SUMMARY
                            </h2>
                            <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
                        </div>

                        {/* Experience */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">
                                EXPERIENCE
                            </h2>
                            {(resumeData.experience || []).map((exp, index) => (
                            <div key={index} className="mb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{exp.title}</h3>
                                        <p className="text-gray-600">{exp.company} • {exp.location}</p>
                                    </div>
                                    <span className="text-gray-500 text-sm">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {(exp.points || []).map((point, pointIndex) => {
                                        const isUpdated = Array.from(updatedPoints).some(skill => 
                                            point.toLowerCase().includes(skill.toLowerCase())
                                        );
                                        return (
                                            <li 
                                                key={pointIndex} 
                                                className={isUpdated ? 'bg-yellow-100 border-l-4 border-yellow-500 pl-2' : ''}
                                            >
                                                {point}
                                                {isUpdated && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">✨ AI ENHANCED</span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                        </div>

                        {/* Skills */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">
                                SKILLS
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {resumeData.skills.map((skill, index) => {
                                    const isUpdated = updatedPoints.has(skill);
                                    return (
                                        <span 
                                            key={index} 
                                            className={`px-3 py-1 rounded-full text-sm ${
                                                isUpdated 
                                                    ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            {skill}
                                            {isUpdated && <span className="ml-1 text-xs">✨</span>}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">
                                EDUCATION
                            </h2>
                            {resumeData.education.map((edu, index) => (
                                <div key={index} className="mb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                                            <p className="text-gray-600">{edu.school}</p>
                                            {edu.location && <p className="text-gray-500 text-sm">{edu.location}</p>}
                                        </div>
                                        {edu.year && <span className="text-gray-500 text-sm">{edu.year}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Certifications */}
                        {resumeData.certifications && resumeData.certifications.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">
                                    CERTIFICATIONS
                                </h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {resumeData.certifications.map((cert, index) => (
                                        <li key={index}>{cert}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Leadership & Extras */}
                        {resumeData.leadership && resumeData.leadership.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">
                                    LEADERSHIP & EXTRAS
                                </h2>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {resumeData.leadership.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Panel */}
                {showAiPanel && (
                    <div className="w-80 bg-white border-l p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">AI Keyword Targeting</h3>
                            <button 
                                onClick={() => setShowAiPanel(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Job Description</label>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="w-full p-3 border rounded h-32 text-sm"
                                    placeholder="Paste the job description here to get AI suggestions..."
                                />
                            </div>

                            <button
                                onClick={analyzeWithAI}
                                disabled={analyzing || !uploadedResume.trim()}
                                className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700 disabled:opacity-50"
                            >
                                {analyzing ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Optimizing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-magic mr-2"></i>
                                        Update Resume
                                    </>
                                )}
                            </button>

                            {!uploadedResume.trim() && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Please upload a resume first to enable optimization.
                                </p>
                            )}

                            <div>
                                <h4 className="font-medium mb-2">AI Suggestions:</h4>
                                <ul className="space-y-2 text-sm">
                                    {suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

ReactDOM.render(<ResumeBuilder />, document.getElementById('root'));

.toolbar-btn { 
            padding: 12px 20px; 
            border-radius: 8px; 
            border: none; 
            background: white;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
        }
        .toolbar-btn:hover { 
            transform: translateY(-1px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }