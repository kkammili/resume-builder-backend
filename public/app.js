
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
        { id: 'contact', label: 'Contact', icon: 'fas fa-user' },
        { id: 'summary', label: 'Summary', icon: 'fas fa-file-text' },
        { id: 'experience', label: 'Experience', icon: 'fas fa-briefcase' },
        { id: 'education', label: 'Education', icon: 'fas fa-graduation-cap' },
        { id: 'skills', label: 'Skills', icon: 'fas fa-cogs' },
        { id: 'projects', label: 'Projects', icon: 'fas fa-code' }
    ];

    const analyzeWithAI = async () => {
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
                    resume: JSON.stringify(resumeData),
                    jd: jobDescription
                })
            });

            const data = await response.json();
            if (data.success) {
                // Update resume with AI suggestions
                setResumeData(data.updatedResume);
                setAiScore(Math.floor(Math.random() * 20) + 80); // Simulate score
                setSuggestions(data.finalProfessionalSummary?.suggestions || suggestions);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
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
            {resumeData.experience.map((exp, index) => (
                <div key={index} className="border p-4 rounded">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => {
                                const newExp = [...resumeData.experience];
                                newExp[index].title = e.target.value;
                                setResumeData({...resumeData, experience: newExp});
                            }}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => {
                                const newExp = [...resumeData.experience];
                                newExp[index].company = e.target.value;
                                setResumeData({...resumeData, experience: newExp});
                            }}
                            className="p-2 border rounded"
                        />
                    </div>
                    <div className="space-y-2">
                        {exp.points.map((point, pointIndex) => (
                            <input
                                key={pointIndex}
                                type="text"
                                placeholder="Achievement bullet point"
                                value={point}
                                onChange={(e) => {
                                    const newExp = [...resumeData.experience];
                                    newExp[index].points[pointIndex] = e.target.value;
                                    setResumeData({...resumeData, experience: newExp});
                                }}
                                className="w-full p-2 border rounded"
                            />
                        ))}
                    </div>
                </div>
            ))}
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
            case 'contact': return <ContactSection />;
            case 'summary': return <SummarySection />;
            case 'experience': return <ExperienceSection />;
            case 'skills': return <SkillsSection />;
            default: return <ContactSection />;
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
                        className="toolbar-btn bg-purple-600 text-white hover:bg-purple-700"
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
                            {resumeData.experience.map((exp, index) => (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{exp.title}</h3>
                                            <p className="text-gray-600">{exp.company} • {exp.location}</p>
                                        </div>
                                        <span className="text-gray-500 text-sm">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        {exp.points.map((point, pointIndex) => (
                                            <li key={pointIndex}>{point}</li>
                                        ))}
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
                                {resumeData.skills.map((skill, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
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
                                disabled={analyzing}
                                className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700 disabled:opacity-50"
                            >
                                {analyzing ? (
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
