

import { useState, useMemo, createElement } from 'react';
import htm from 'htm';
import { bibleBooksData } from './bibleBooksData.js';
import { CollapsibleSection } from './CollapsibleSection.js';
import { ExportButtons } from './ExportButtons.js';
import { handleExport, formatBibleBooksForExport } from './exportUtils.js';

const html = htm.bind(createElement);

export const BibleBooksTable = () => {
  const [sortOrder, setSortOrder] = useState('canonical');
  const [scriptureFilter, setScriptureFilter] = useState('all');

  const processedData = useMemo(() => {
    let data = [...bibleBooksData];

    if (scriptureFilter === 'hebrew') {
        data = data.filter(book => book.canonicalOrder <= 39);
    } else if (scriptureFilter === 'greek') {
        data = data.filter(book => book.canonicalOrder > 39);
    }

    if (sortOrder === 'canonical') {
      return data.sort((a, b) => a.canonicalOrder - b.canonicalOrder);
    }
    
    return data.sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
  }, [sortOrder, scriptureFilter]);

  const onExport = (format) => {
    handleExport(
      format,
      `Bible_Books_(${sortOrder}_${scriptureFilter})`,
      processedData,
      formatBibleBooksForExport
    );
  };

  const headerContent = (
    html`
    <div className="flex items-center space-x-4 flex-wrap gap-2">
      <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-md">
        <button
          onClick=${() => setScriptureFilter('all')}
          className=${`px-2 py-0.5 text-xs rounded ${scriptureFilter === 'all' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          All
        </button>
        <button
          onClick=${() => setScriptureFilter('hebrew')}
          className=${`px-2 py-0.5 text-xs rounded ${scriptureFilter === 'hebrew' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          Hebrew
        </button>
        <button
          onClick=${() => setScriptureFilter('greek')}
          className=${`px-2 py-0.5 text-xs rounded ${scriptureFilter === 'greek' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          Greek
        </button>
      </div>
      <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-md">
        <button
          onClick=${() => setSortOrder('canonical')}
          className=${`px-2 py-0.5 text-xs rounded ${sortOrder === 'canonical' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          Canonical
        </button>
        <button
          onClick=${() => setSortOrder('chronological')}
          className=${`px-2 py-0.5 text-xs rounded ${sortOrder === 'chronological' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          Chronological
        </button>
      </div>
      <${ExportButtons} onExport=${onExport} disabled=${processedData.length === 0} />
    </div>
    `
  );

  return (
    html`
    <${CollapsibleSection} title="Books of the Bible" headerContent=${headerContent} initiallyOpen fullscreenOnOpen>
      ${({ isFullScreen }) => html`
        <div className=${`flex flex-col ${isFullScreen ? 'h-full' : ''}`}>
            <p className="text-slate-400 mb-4 text-sm flex-shrink-0">
                Details about each book of the Bible. Filter by scripture and toggle between canonical and chronological order.
            </p>
            <div className=${`overflow-y-auto rounded-lg border border-slate-800 ${isFullScreen ? 'flex-grow min-h-0' : 'max-h-96'}`}>
                <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-teal-300 uppercase bg-slate-800/80 backdrop-blur-sm sticky top-0">
                    <tr>
                    <th scope="col" className="px-4 py-3">Book Name</th>
                    <th scope="col" className="px-4 py-3">Writer</th>
                    <th scope="col" className="px-4 py-3">Completed</th>
                    <th scope="col" className="px-4 py-3">Time Covered</th>
                    </tr>
                </thead>
                <tbody className="bg-slate-900/50">
                    ${processedData.map((book) => (
                    html`<tr key=${book.name} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">${book.name}</th>
                        <td className="px-4 py-3">${book.writer}</td>
                        <td className="px-4 py-3 whitespace-nowrap">${book.writingCompleted}</td>
                        <td className="px-4 py-3">${book.timeCovered}</td>
                    </tr>`
                    ))}
                    ${processedData.length === 0 && (
                        html`<tr>
                            <td colSpan=${4} className="text-center py-6 text-slate-400">No books match the current filter.</td>
                        </tr>`
                    )}
                </tbody>
                </table>
            </div>
        </div>
      `}
    </${CollapsibleSection}>
    `
  );
};