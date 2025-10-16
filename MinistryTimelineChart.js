import { useState, useMemo, createElement } from 'react';
import htm from 'htm';
import { ministryEventsData } from './ministryEventsData.js';

const html = htm.bind(createElement);

const CATEGORY_DETAILS = {
    john_ministry: { label: "John's Ministry", color: "bg-amber-500/80", border: "border-amber-400" },
    early_ministry: { label: "Early Ministry", color: "bg-sky-500/80", border: "border-sky-400" },
    galilean_ministry: { label: "Galilean Ministry", color: "bg-teal-500/80", border: "border-teal-400" },
    later_ministry: { label: "Later Ministry", color: "bg-indigo-500/80", border: "border-indigo-400" },
    passion_week: { label: "Last Week of Jesus' Ministry", color: "bg-red-500/80", border: "border-red-400" },
    post_resurrection: { label: "Post-Resurrection", color: "bg-purple-500/80", border: "border-purple-400" },
};

const TimelineCard = ({ event, index }) => {
    const isLeft = index % 2 === 0;
    const categoryDetail = CATEGORY_DETAILS[event.category];
    const dateString = `${event.year} ${event.era}, ${event.month}` + (event.day ? `, ${event.day}` : '');

    return (
        html`
        <div className=${`mb-8 flex items-center w-full ${isLeft ? 'flex-row-reverse' : ''}`}>
            <div className="order-1 flex-1"></div>
            <div className=${`z-20 flex items-center order-1 ${categoryDetail.color} shadow-xl w-8 h-8 rounded-full flex-shrink-0 mx-2`}>
                <div className=${`mx-auto w-2 h-2 rounded-full bg-white`}></div>
            </div>
            <div className=${`order-1 ${categoryDetail.color} rounded-lg shadow-xl flex-1 px-4 py-3 timeline-item-animate`}>
                <h3 className="font-bold text-white text-sm">${event.description}</h3>
                <p className="text-xs text-slate-200 mt-1">${dateString}</p>
                <p className="text-xs font-semibold text-slate-300 italic mt-1">${event.location}</p>
            </div>
        </div>
        `
    );
};

export const MinistryTimelineChart = () => {
    const [activeFilters, setActiveFilters] = useState(new Set(Object.keys(CATEGORY_DETAILS)));

    const toggleFilter = (category) => {
        setActiveFilters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const filteredEvents = useMemo(() => {
        if (activeFilters.size === Object.keys(CATEGORY_DETAILS).length) return ministryEventsData;
        return ministryEventsData.filter(event => activeFilters.has(event.category));
    }, [activeFilters]);

    return (
        html`
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="mb-6 flex flex-wrap justify-center gap-2">
                ${Object.entries(CATEGORY_DETAILS).map(([key, { label, border }]) => (
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
                    ${filteredEvents.map((event, index) => (
                        html`<${TimelineCard} key=${`${event.year}-${event.description}`} event=${event} index=${index} />`
                    ))}
                </div>
                 ${filteredEvents.length === 0 && (
                    html`<div className="text-center py-10 text-slate-400">
                        <p>No events to display. Please select a filter above to see results.</p>
                    </div>`
                )}
            </div>
        </div>
        `
    );
};