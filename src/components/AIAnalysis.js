import React from 'react';

const AIAnalysis = ({ analyzeWithAI, isAnalyzing, jobDescription, setJobDescription, resumeScore, suggestions }) => (
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

export default AIAnalysis;
