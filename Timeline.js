

import { createElement, useMemo } from 'react';
import htm from 'htm';
import { TimelineItem } from './TimelineItem.js';
import { EraFilter } from './EraFilter.js';
import { ExportButtons } from './ExportButtons.js';
import { handleExport, formatTimelineForExport } from './exportUtils.js';
import { ERAS_DATA } from './erasData.js';


const html = htm.bind(createElement);

export const Timeline = ({
  groupedEvents,
  searchTerm,
  onSearchChange,
  selectedEras,
  onEraToggle,
  onSelectAll,
  onClearAll,
}) => {

  const lowercasedTerm = searchTerm.toLowerCase();

  const matchingEraIds = useMemo(() => {
    if (!searchTerm) {
      return new Set();
    }
    const matchingIds = new Set();
    if (!groupedEvents) return matchingIds;
    for (const eraId in groupedEvents) {
      const eventsInEra = groupedEvents[eraId];
      const hasMatch = eventsInEra.some(event => 
        event.description.toLowerCase().includes(lowercasedTerm) ||
        event.fullText.toLowerCase().includes(lowercasedTerm)
      );
      if (hasMatch) {
        matchingIds.add(eraId);
      }
    }
    return matchingIds;
  }, [groupedEvents, lowercasedTerm, searchTerm]);

  const erasToRender = useMemo(() => {
    // Sort selected eras based on the canonical order in ERAS_DATA
    return ERAS_DATA.filter(era => selectedEras.has(era.title));
  }, [selectedEras]);

  const itemsToRender = useMemo(() => {
    const items = [];
    if (!groupedEvents || Object.keys(groupedEvents).length === 0) return items;

    let eventCounter = 0;
    erasToRender.forEach(era => {
      const eventsInEra = groupedEvents[era.title] || [];
      const filteredEvents = !searchTerm
        ? eventsInEra
        : eventsInEra.filter(e => 
            e.description.toLowerCase().includes(lowercasedTerm) || 
            e.fullText.toLowerCase().includes(lowercasedTerm)
          );

      if (filteredEvents.length > 0) {
        items.push({ type: 'era_header', title: era.title });
        filteredEvents.forEach(event => {
            items.push({
                type: 'event',
                event: event,
                animationIndex: eventCounter++,
            });
        });
      }
    });
    return items;
  }, [erasToRender, groupedEvents, searchTerm, lowercasedTerm]);
  
  const eventsToExport = useMemo(() => {
    return itemsToRender.map(item => {
      if (item.type === 'era_header') {
        return item; // Keep header as is
      }
      return item.event; // Extract the event object
    });
  }, [itemsToRender]);

  const onExport = (format) => {
    handleExport(
      format, 
      'Biblical_Chronology_Timeline', 
      eventsToExport, 
      formatTimelineForExport
    );
  };

  const hasVisibleEvents = itemsToRender.some(item => item.type === 'event');

  return (
    html`
    <div className="relative bg-slate-900/70 p-4 sm:p-6 rounded-xl shadow-2xl border border-slate-800">
      <div className="bg-slate-900 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-4 rounded-t-xl mb-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between sm:items-center">
            <h2 className="text-2xl font-bold text-teal-300">Browse Chronology</h2>
            <${ExportButtons} onExport=${onExport} disabled=${eventsToExport.length === 0} />
        </div>
        <div className="relative mt-4">
            <label htmlFor="timeline-search" className="sr-only">Search Events</label>
            <input
                id="timeline-search"
                type="text"
                placeholder="Search events (e.g., David, Temple, Exodus)"
                value=${searchTerm}
                onChange=${e => onSearchChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
         <${EraFilter} 
            eras=${ERAS_DATA}
            selectedEras=${selectedEras}
            matchingEraIds=${matchingEraIds}
            onEraToggle=${onEraToggle}
            onSelectAll=${onSelectAll}
            onClearAll=${onClearAll}
        />
      </div>
      
      ${Object.keys(groupedEvents).length === 0 && !searchTerm && html`
        <div className="text-center py-10 text-slate-400">Loading timeline data...</div>
      `}
      
      <div className="relative mt-4">
        ${itemsToRender.map((item, index) => {
            if (item.type === 'era_header') {
                 return html`
                    <h3 key=${item.title} className="sticky top-[76px] z-10 bg-slate-800/80 backdrop-blur-md text-teal-300 font-bold text-center text-sm md:text-base px-6 py-3 rounded-lg shadow-lg flex items-center w-full max-w-xl justify-center mx-auto my-6 border border-slate-700">
                        ${item.title}
                    </h3>
                 `;
            }
            const { event, animationIndex } = item;
            return html`<${TimelineItem}
                  key=${`${event.year}-${event.era}-${event.description.slice(0, 10)}-${index}`}
                  event=${event}
                  index=${animationIndex}
                />`;
        })}
      </div>
      
      ${Object.keys(groupedEvents).length > 0 && itemsToRender.length === 0 && selectedEras.size === 0 && !searchTerm && html`
        <div className="text-center py-10 text-slate-400">
          <p>No eras selected. Use the filters above to display timeline events.</p>
        </div>
      `}
       ${Object.keys(groupedEvents).length > 0 && !hasVisibleEvents && searchTerm && html`
        <div className="text-center py-10 text-slate-400">
          <p>No events found for "${searchTerm}" in the selected eras.</p>
        </div>
      `}
    </div>
    `
  );
};