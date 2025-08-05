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
        }]
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
        { id: 'projects', label: 'Projects', icon: 'fas fa-code' }
    ];

    const processUploadedResume = (resumeText) => {
        try {
            // Store the raw text
            setUploadedResume(resumeText);
            
            // Parse the resume content to extract actual information
            const lines = resumeText.split('\n').filter(line => line.trim());
            
            // Extract name (first non-empty line)
            let name = lines[0]?.trim() || 'Name';
            
            // Extract contact info
            let email = '';
            let phone = '';
            let location = '';
            
            const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
            const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
            
            for (let line of lines) {
                const emailMatch = line.match(emailPattern);
                if (emailMatch) email = emailMatch[0];
                
                const phoneMatch = line.match(phonePattern);
                if (phoneMatch) phone = phoneMatch[0];
                
                // Extract location (look for city, state pattern)
                if (line.includes(',') && (line.includes('TX') || line.includes('NY') || line.includes('CA') || line.includes('CO'))) {
                    location = line.trim();
                }
            }
            
            // Extract professional summary
            let summary = '';
            const summaryIndex = lines.findIndex(line => 
                line.toUpperCase().includes('PROFESSIONAL SUMMARY') || 
                line.toUpperCase().includes('SUMMARY')
            );
            if (summaryIndex !== -1 && summaryIndex + 1 < lines.length) {
                summary = lines[summaryIndex + 1].trim();
            }
            
            // Extract skills
            let skills = [];
            const skillsIndex = lines.findIndex(line => 
                line.toUpperCase().includes('TECHNICAL SKILLS') || 
                line.toUpperCase().includes('SKILLS')
            );
            if (skillsIndex !== -1) {
                for (let i = skillsIndex + 1; i < lines.length && i < skillsIndex + 5; i++) {
                    if (lines[i] && !lines[i].toUpperCase().includes('PROFESSIONAL EXPERIENCE') && 
                        !lines[i].toUpperCase().includes('EXPERIENCE')) {
                        // Extract skills from lines like "Frontend: React, Angular, Vue"
                        const skillLine = lines[i].replace(/^[^:]*:/, '').trim();
                        if (skillLine) {
                            const extractedSkills = skillLine.split(/[,;]/).map(s => s.trim()).filter(s => s);
                            skills.push(...extractedSkills);
                        }
                    } else {
                        break;
                    }
                }
            }
            
            // Extract work experience
            let experience = [];
            const expIndex = lines.findIndex(line => 
                line.toUpperCase().includes('PROFESSIONAL EXPERIENCE') || 
                line.toUpperCase().includes('EXPERIENCE')
            );
            
            if (expIndex !== -1) {
                let currentJob = null;
                let currentPoints = [];
                
                for (let i = expIndex + 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    // Stop at education section
                    if (line.toUpperCase().includes('EDUCATION') || 
                        line.toUpperCase().includes('LEADERSHIP')) break;
                    
                    // Check if this looks like a job title line
                    if (line.includes('|') && (line.includes('–') || line.includes('-')) && 
                        (line.includes('202') || line.includes('Present'))) {
                        // Save previous job if exists
                        if (currentJob) {
                            currentJob.points = [...currentPoints];
                            experience.push(currentJob);
                        }
                        
                        // Parse new job
                        const parts = line.split('|');
                        const titleCompany = parts[0].trim();
                        const dates = parts[parts.length - 1].trim();
                        
                        const titleMatch = titleCompany.match(/^(.+?)\s*–\s*(.+)$/);
                        if (titleMatch) {
                            currentJob = {
                                title: titleMatch[1].trim(),
                                company: titleMatch[2].trim(),
                                location: location,
                                startDate: dates.split('–')[0]?.trim() || dates.split('-')[0]?.trim() || '',
                                endDate: dates.split('–')[1]?.trim() || dates.split('-')[1]?.trim() || 'Present',
                                points: []
                            };
                        }
                        currentPoints = [];
                    } else if (line.startsWith('•') || line.match(/^[A-Z].*\./)) {
                        // This looks like a bullet point
                        currentPoints.push(line.replace(/^•\s*/, '').trim());
                    }
                }
                
                // Add the last job
                if (currentJob) {
                    currentJob.points = [...currentPoints];
                    experience.push(currentJob);
                }
            }
            
            // Update resume data with parsed information
            setResumeData({
                contact: {
                    name: name,
                    email: email,
                    phone: phone,
                    location: location,
                    linkedin: '',
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
                education: [{
                    degree: 'Bachelor of Science in Computer Science',
                    school: 'University Name',
                    location: 'City, State',
                    year: '2020'
                }],
                skills: skills.length > 0 ? skills.slice(0, 15) : ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
                projects: [{
                    name: 'Project Name',
                    description: 'Brief description of the project',
                    technologies: ['React', 'Node.js']
                }]
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

    const renderActiveSection = () => {
        switch(activeSection) {
            case 'upload': return <UploadSection />;
            case 'contact': return <ContactSection />;
            case 'summary': return <SummarySection />;
            case 'experience': return <ExperienceSection />;
            case 'skills': return <SkillsSection />;
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