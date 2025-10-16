

import { useState, useRef, useEffect, createElement } from 'react';
import htm from 'htm';
import { ChatMessage } from './ChatMessage.js';
import { Spinner } from './Spinner.js';
import { CollapsibleSection } from './CollapsibleSection.js';
import { ExportButtons } from './ExportButtons.js';
import { handleExport, formatConversationForExport } from './exportUtils.js';

const html = htm.bind(createElement);

export const QuerySection = ({ conversation, onQuerySubmit, isLoading, error }) => {
  const [query, setQuery] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onQuerySubmit(query);
      setQuery('');
    }
  };

  const onExport = (format) => {
    handleExport(
      format,
      'AI_Query_History',
      conversation,
      formatConversationForExport
    );
  };
  
  const headerContent = (
      html`<${ExportButtons} onExport=${onExport} disabled=${conversation.length === 0} />`
  );

  return (
    html`
    <${CollapsibleSection} title="AI Query" headerContent=${headerContent} fullscreenOnOpen>
      ${({ isFullScreen }) => html`
        <div className=${`flex flex-col ${isFullScreen ? 'h-full' : ''}`}>
          <p className="text-slate-400 mb-4 text-sm flex-shrink-0">
            Ask a question based on the NWT of the Holy Scriptures (2013 Ed.). For dates and ages, the AI will prioritize the app's data.
          </p>

          <div className=${`bg-slate-900/50 rounded-lg p-2 flex flex-col border border-slate-800 ${isFullScreen ? 'flex-grow min-h-0' : 'h-80'}`}>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 p-2">
              ${conversation.map(msg => html`
                <${ChatMessage} key=${msg.id} message=${msg} />
              `)}
              ${isLoading && html`
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth=${1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
                    </svg>
                  </div>
                  <div className="bg-slate-700/80 p-3 rounded-lg flex items-center mt-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200 mx-1.5"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-400"></div>
                  </div>
                </div>
              `}
              <div ref=${chatEndRef}></div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/50 flex-shrink-0">
                <form onSubmit=${handleSubmit} className="flex items-center space-x-2">
                <label htmlFor="chat-query" className="sr-only">Your Question</label>
                <input
                    id="chat-query"
                    type="text"
                    value=${query}
                    onChange=${(e) => setQuery(e.target.value)}
                    placeholder="e.g., When was David born?"
                    disabled=${isLoading}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled=${isLoading || !query.trim()}
                    aria-label="Send question"
                    className="bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold p-2 rounded-md transition-colors duration-300 shadow-md"
                >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth=${1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                </button>
                </form>
                 ${error && html`
                    <p role="alert" className="text-sm text-red-400 mt-2">${error}</p>
                `}
            </div>
          </div>
        </div>
      `}
    </${CollapsibleSection}>
    `
  );
};