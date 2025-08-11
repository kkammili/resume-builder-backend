import React from 'react';

const JsonEditor = ({ jsonInput, setJsonInput, validateJson, isValidating, validationErrors }) => (
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

export default JsonEditor;
