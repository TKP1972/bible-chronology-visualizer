

import { useState, createElement } from 'react';
import htm from 'htm';
import { qaData } from './qaData.js';
import { CollapsibleSection } from './CollapsibleSection.js';

const html = htm.bind(createElement);

const QAItem = ({ question, answer, isOpen, onClick }) => {
  return (
    html`
    <div className="border-b border-slate-800">
      <h3>
        <button
          type="button"
          className="flex justify-between items-center w-full py-4 px-2 text-left font-semibold text-sm text-slate-200 hover:bg-slate-800/50 rounded-md"
          onClick=${onClick}
          aria-expanded=${isOpen}
        >
          <span>${question}</span>
          <svg
            className=${`w-4 h-4 shrink-0 transition-transform duration-300 text-slate-500 ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </h3>
      <div
        className=${`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-1 pb-4 px-2 text-slate-300 text-sm">
            <p className="border-l-2 border-teal-500/50 pl-4">${answer}</p>
          </div>
        </div>
      </div>
    </div>
    `
  );
};

const EraQAGroup = ({ era, questions }) => {
    const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

    const handleToggle = (index) => {
        setOpenQuestionIndex(openQuestionIndex === index ? null : index);
    };

    return (
        html`
        <${CollapsibleSection} title=${era}>
            <div className="space-y-1">
                ${questions.map((item, index) => (
                    html`<${QAItem}
                        key=${index}
                        question=${item.question}
                        answer=${item.answer}
                        isOpen=${openQuestionIndex === index}
                        onClick=${() => handleToggle(index)}
                    />`
                ))}
            </div>
        </${CollapsibleSection}>
        `
    )
}

export const QASection = () => {
  return (
    html`
    <div className="space-y-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-teal-300">Frequently Asked Questions</h2>
            <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
                Quick answers to key questions based on the chronological data, organized by historical era.
            </p>
        </div>
        <div className="space-y-4 max-w-4xl mx-auto">
            ${qaData.map((eraData) => (
                html`<${EraQAGroup}
                    key=${eraData.era}
                    era=${eraData.era}
                    questions=${eraData.questions}
                />`
            ))}
        </div>
    </div>
    `
  );
};