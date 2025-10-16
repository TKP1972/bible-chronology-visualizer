

import { createElement } from 'react';
import htm from 'htm';
import { procreationData } from './procreationData.js';
import { CollapsibleSection } from './CollapsibleSection.js';
import { ExportButtons } from './ExportButtons.js';
import { handleExport, formatProcreationForExport } from './exportUtils.js';

const html = htm.bind(createElement);

export const ProcreationTable = () => {
  const onExport = (format) => {
    handleExport(
      format,
      'Procreation_Data',
      procreationData,
      formatProcreationForExport
    );
  };
  
  const headerContent = html`<${ExportButtons} onExport=${onExport} />`;

  return (
    html`
    <${CollapsibleSection} title="Procreation" headerContent=${headerContent} fullscreenOnOpen>
       ${({ isFullScreen }) => html`
            <div className=${`flex flex-col ${isFullScreen ? 'h-full' : ''}`}>
                <p className="text-slate-400 mb-4 text-sm flex-shrink-0">
                    When key individuals fathered sons, based on the chronology.
                </p>
                <div className=${`overflow-y-auto rounded-lg border border-slate-800 ${isFullScreen ? 'flex-grow min-h-0' : 'max-h-80'}`}>
                    <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-teal-300 uppercase bg-slate-800/80 backdrop-blur-sm sticky top-0">
                        <tr>
                        <th scope="col" className="px-4 py-3">Father</th>
                        <th scope="col" className="px-4 py-3">Son</th>
                        <th scope="col" className="px-4 py-3">Father's Age</th>
                        <th scope="col" className="px-4 py-3">Scripture</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900/50">
                        ${procreationData.map((entry) => html`
                        <tr key=${`${entry.father}-${entry.son}`} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">${entry.father}</th>
                            <td className="px-4 py-3">${entry.son}</td>
                            <td className="px-4 py-3">${entry.fatherAgeAtBirth}</td>
                            <td className="px-4 py-3">${entry.scripture}</td>
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