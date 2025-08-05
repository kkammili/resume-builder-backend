
const { useState, useEffect } = React;

// ResumeUploader Component
const ResumeUploader = ({ onResumeUpload }) => {
    const [resume, setResume] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (resume.trim()) {
            onResumeUpload(resume);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Your Resume</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paste your resume text here..."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                >
                    Upload Resume
                </button>
            </form>
        </div>
    );
};

// JDUploader Component
const JDUploader = ({ onJDUpload }) => {
    const [jobDescription, setJobDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (jobDescription.trim()) {
            onJDUpload(jobDescription);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Job Description</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                >
                    Upload Job Description
                </button>
            </form>
        </div>
    );
};

// SkillGapViewer Component
const SkillGapViewer = ({ skillGaps, onUpdateResume, loading }) => {
    if (!skillGaps) return null;

    const { finalUpdatedSkills, jobDescDetails } = skillGaps;
    const missingSkills = finalUpdatedSkills?.missingSkills || [];

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Skill Gap Analysis</h2>
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-red-600">Missing Skills ({missingSkills.length})</h3>
                <div className="flex flex-wrap gap-2">
                    {missingSkills.map((skill, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-blue-600">Target Company</h3>
                <p className="text-gray-700">{jobDescDetails?.company_name || 'Not specified'}</p>
            </div>

            <button
                onClick={onUpdateResume}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-bold text-white transition duration-200 ${
                    loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
                {loading ? 'Updating Resume...' : 'Update Resume with AI'}
            </button>
        </div>
    );
};

// ResumeDiffEditor Component
const ResumeDiffEditor = ({ originalResume, updatedResume, diff, onSave }) => {
    const [editedResume, setEditedResume] = useState('');

    useEffect(() => {
        if (updatedResume) {
            setEditedResume(JSON.stringify(updatedResume, null, 2));
        }
    }, [updatedResume]);

    if (!updatedResume) return null;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Updated Resume with AI Highlights</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Diff View</h3>
                    <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
                        {diff && diff.map((part, index) => (
                            <div
                                key={index}
                                className={`p-2 mb-1 rounded ${
                                    part.added 
                                        ? 'diff-added' 
                                        : part.removed 
                                            ? 'diff-removed' 
                                            : 'diff-unchanged'
                                }`}
                            >
                                <pre className="whitespace-pre-wrap text-sm">{part.value}</pre>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Editable Resume</h3>
                    <textarea
                        className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        value={editedResume}
                        onChange={(e) => setEditedResume(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
                <button
                    onClick={() => onSave(editedResume)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                >
                    Save Final Resume
                </button>
                <button
                    onClick={() => {
                        const blob = new Blob([editedResume], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'updated-resume.json';
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                >
                    Export JSON
                </button>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [resume, setResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [savedResume, setSavedResume] = useState('');

    const handleResumeUpload = (resumeText) => {
        setResume(resumeText);
        if (jobDescription) {
            setStep(2);
        }
    };

    const handleJDUpload = (jdText) => {
        setJobDescription(jdText);
        if (resume) {
            setStep(2);
        }
    };

    const analyzeSkills = async () => {
        if (!resume || !jobDescription) return;

        setLoading(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resume: resume,
                    jd: jobDescription
                })
            });

            const data = await response.json();
            if (data.success) {
                setAnalysisResult(data);
                setStep(3);
            } else {
                alert('Error analyzing resume: ' + data.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateResume = () => {
        if (analysisResult) {
            setStep(4);
        }
    };

    const handleSaveResume = (editedResume) => {
        setSavedResume(editedResume);
        alert('Resume saved successfully!');
    };

    useEffect(() => {
        if (resume && jobDescription && step === 2) {
            analyzeSkills();
        }
    }, [step]);

    return (
        <div className="min-h-screen gradient-bg">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        🤖 AI Resume Updater
                    </h1>
                    <p className="text-xl text-gray-100">
                        Upload your resume and job description to get AI-powered improvements
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3, 4].map((stepNum) => (
                            <div key={stepNum} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    step >= stepNum ? 'bg-white text-purple-600' : 'bg-purple-300 text-white'
                                }`}>
                                    {stepNum}
                                </div>
                                {stepNum < 4 && (
                                    <div className={`w-12 h-1 ${
                                        step > stepNum ? 'bg-white' : 'bg-purple-300'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 1: Upload Resume and Job Description */}
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ResumeUploader onResumeUpload={handleResumeUpload} />
                        <JDUploader onJDUpload={handleJDUpload} />
                    </div>
                )}

                {/* Step 2: Loading Analysis */}
                {step === 2 && (
                    <div className="text-center">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Resume</h2>
                            <p className="text-gray-600">AI is comparing your skills with the job requirements...</p>
                        </div>
                    </div>
                )}

                {/* Step 3: Show Skill Gaps */}
                {step === 3 && analysisResult && (
                    <SkillGapViewer 
                        skillGaps={analysisResult} 
                        onUpdateResume={handleUpdateResume}
                        loading={loading}
                    />
                )}

                {/* Step 4: Show Updated Resume with Diff */}
                {step === 4 && analysisResult && (
                    <ResumeDiffEditor
                        originalResume={analysisResult.originalResume}
                        updatedResume={analysisResult.updatedResume}
                        diff={analysisResult.diff}
                        onSave={handleSaveResume}
                    />
                )}

                {/* Reset Button */}
                {step > 1 && (
                    <div className="text-center mt-8">
                        <button
                            onClick={() => {
                                setStep(1);
                                setResume('');
                                setJobDescription('');
                                setAnalysisResult(null);
                                setSavedResume('');
                            }}
                            className="bg-white hover:bg-gray-100 text-purple-600 font-bold py-2 px-6 rounded-lg transition duration-200"
                        >
                            Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
