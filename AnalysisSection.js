

import { createElement } from 'react';
import htm from 'htm';
import { Spinner } from './Spinner.js';
import { MarkdownRenderer } from './MarkdownRenderer.js';
import { CollapsibleSection } from './CollapsibleSection.js';
import { ExportButtons } from './ExportButtons.js';
import { handleExport, formatAnalysisForExport } from './exportUtils.js';

const html = htm.bind(createElement);

export const AnalysisSection = ({ onAnalyze, analysis, isLoading, error }) => {
  const onExport = (format) => {
    handleExport(
      format,
      'AI_Analysis',
      analysis,
      formatAnalysisForExport
    );
  };

  const headerContent = (
    html`
    <div className="flex items-center space-x-4">
      <${ExportButtons} onExport=${onExport} disabled=${!analysis || isLoading} />
      <button
        onClick=${onAnalyze}
        disabled=${isLoading}
        aria-label=${isLoading ? 'Generating AI Analysis' : 'Get AI Analysis'}
        className="bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:bg-slate-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold py-1.5 px-4 rounded-md transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 text-sm"
      >
        ${isLoading ? 'Generating...' : 'Get Analysis'}
      </button>
    </div>
    `
  );

  return (
    html`
    <${CollapsibleSection} title="AI Analysis" headerContent=${headerContent} fullscreenOnOpen>
      ${({ isFullScreen }) => html`
        <div className=${`flex flex-col ${isFullScreen ? 'h-full' : ''}`}>
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            ${isLoading && 'Generating AI analysis, please wait.'}
            ${error && `An error occurred: ${error}`}
            ${!isLoading && analysis && 'AI analysis has been successfully generated.'}
          </div>

          <p className="text-slate-400 mb-4 text-sm flex-shrink-0">
            Generate a summary of the timeline, highlighting key periods, figures, and narrative arcs.
          </p>

          ${isLoading && html`<div className="flex justify-center py-4"><${Spinner} /></div>`}
          
          ${error && html`
            <div role="alert" className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">
              <p className="font-bold">An Error Occurred</p>
              <p>${error}</p>
            </div>
          `}

          ${analysis && html`
            <div className=${`mt-4 max-w-none ${isFullScreen ? 'flex-grow min-h-0' : ''}`}>
              <div className=${`prose-styles p-3 bg-slate-900/50 rounded-lg ${isFullScreen ? 'h-full overflow-y-auto' : 'max-h-96 overflow-y-auto'}`}>
                <${MarkdownRenderer} content=${analysis} />
              </div>
            </div>
          `}
        </div>
      `}
    </${CollapsibleSection}>
    `
  );
};