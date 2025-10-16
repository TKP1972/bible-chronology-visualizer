

import { createElement } from 'react';
import htm from 'htm';
import { lifeSpanData } from './lifeSpanData.js';
import { CollapsibleSection } from './CollapsibleSection.js';
import { ExportButtons } from './ExportButtons.js';
import { handleExport, formatLifeSpanForExport } from './exportUtils.js';

const html = htm.bind(createElement);

export const LifeSpanTable = () => {
  const onExport = (format) => {
    handleExport(
      format,
      'Life_Span_Data',
      lifeSpanData,
      formatLifeSpanForExport
    );
  };
  
  const headerContent = html`<${ExportButtons} onExport=${onExport} />`;

  return (
    html`
    <${CollapsibleSection} title="Life Span" headerContent=${headerContent} fullscreenOnOpen>
        ${({ isFullScreen }) => html`
            <div className=${`flex flex-col ${isFullScreen ? 'h-full' : ''}`}>
                <p className="text-slate-400 mb-4 text-sm flex-shrink-0">
                    Individuals whose age at death is recorded in the chronology.
                </p>
                <div className=${`overflow-y-auto rounded-lg border border-slate-800 ${isFullScreen ? 'flex-grow min-h-0' : 'max-h-80'}`}>
                    <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-teal-300 uppercase bg-slate-800/80 backdrop-blur-sm sticky top-0">
                        <tr>
                        <th scope="col" className="px-4 py-3">Name</th>
                        <th scope="col" className="px-4 py-3">Age at Death</th>
                        <th scope="col" className="px-4 py-3">Scripture</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900/50">
                        ${lifeSpanData.map((person) => html`
                        <tr key=${person.name} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">${person.name}</th>
                            <td className="px-4 py-3">${person.ageAtDeath}</td>
                            <td className="px-4 py-3">${person.scripture}</td>
                        </tr>
                        `)}
                    </tbody>
                    </table>
                </div>
            </div>
        `}
    </${CollapsibleSection}>
    `
  );
};