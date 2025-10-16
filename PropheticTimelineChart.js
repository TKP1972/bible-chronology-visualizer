import { useState, useMemo, createElement } from 'react';
import htm from 'htm';
import { propheticEventsData } from './propheticEventsData.js';

const html = htm.bind(createElement);

const PROPHECY_DETAILS = {
    "400-Year Affliction": { label: "400-Year Affliction", color: "bg-gray-500/80", border: "border-gray-400" },
    "Ezekiel's Siege": { label: "Ezekiel's Siege", color: "bg-amber-500/80", border: "border-amber-400" },
    "Seven Times": { label: "The 'Seven Times'", color: "bg-red-500/80", border: "border-red-400" },
    "70 Weeks": { label: "'70 Weeks'", color: "bg-sky-500/80", border: "border-sky-400" },
    "Revelation Time Periods": { label: "Revelation's Periods", color: "bg-purple-500/80", border: "border-purple-400" },
    "Daniel's Time Periods": { label: "Daniel's Later Periods", color: "bg-indigo-500/80", border: "border-indigo-400" },
};

const TimelineCard = ({ event, index }) => {
    const isLeft = index % 2 === 0;
    const prophecyDetail = PROPHECY_DETAILS[event.prophecy];
    const dateString = event.endYear 
        ? `${event.startYear} - ${event.endYear} ${event.era}`
        : `${event.startYear} ${event.era}`;

    return (
        html`
        <div className=${`mb-8 flex items-center w-full ${isLeft ? 'flex-row-reverse' : ''}`}>
            <div className="order-1 flex-1"></div>
            <div className=${`z-20 flex items-center justify-center order-1 ${prophecyDetail.color} shadow-xl w-8 h-8 rounded-full flex-shrink-0 mx-2`}>
                <div className="text-xs font-bold text-white">${event.prophecy.split(' ')[0][0]}</div>
            </div>
            <div className=${`order-1 ${prophecyDetail.color} rounded-lg shadow-xl flex-1 px-4 py-3 timeline-item-animate`}>
                <h3 className="font-bold text-white text-sm">${dateString}</h3>
                <p className="text-xs text-slate-200 mt-1">${event.description}</p>
                <p className="text-xs font-semibold text-slate-300 italic mt-1">${event.scriptures}</p>
            </div>
        </div>
        `
    );
};

export const PropheticTimelineChart = () => {
    const [activeFilters, setActiveFilters] = useState(new Set(Object.keys(PROPHECY_DETAILS)));

    const toggleFilter = (category) => {
        setActiveFilters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) newSet.delete(category);
            else newSet.add(category);
            return newSet;
        });
    };

    const sortedAndFilteredEvents = useMemo(() => {
        return propheticEventsData
            .filter(event => activeFilters.has(event.prophecy))
            .sort((a, b) => {
                const yearA = a.era === 'BCE' ? -a.startYear : a.startYear;
                const yearB = b.era === 'BCE' ? -b.startYear : b.startYear;
                return yearA - yearB;
            });
    }, [activeFilters]);

    return (
        html`
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="mb-6 flex flex-wrap justify-center gap-2">
                ${Object.entries(PROPHECY_DETAILS).map(([key, { label, border }]) => (
                    html`<button
                        key=${key}
                        onClick=${() => toggleFilter(key)}
                        className=${`text-xs font-semibold py-1 px-3 rounded-full border-2 transition-all duration-200 ${
                            activeFilters.has(key)
                                ? `${border.replace('border-', 'bg-').replace('/80', '/30')} ${border} text-white`
                                : `border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300`
                        }`}
                    >
                        ${label}
                    </button>`
                ))}
            </div>
            <div className="relative w-full overflow-x-auto">
                <div className="relative p-2 h-full" style=${{ minWidth: '600px' }}>
                    <div className="border-2-2 absolute border-opacity-20 border-slate-600 h-full border" style=${{ left: '50%' }}></div>
                    ${sortedAndFilteredEvents.map((event, index) => (
                        html`<${TimelineCard} key=${`${event.startYear}-${event.scriptures}`} event=${event} index=${index} />`
                    ))}
                </div>
                 ${sortedAndFilteredEvents.length === 0 && (
                    html`<div className="text-center py-10 text-slate-400">
                        <p>No prophetic events to display. Please select a filter above to see results.</p>
                    </div>`
                )}
            </div>
        </div>
        `
    );
};