import { createElement } from 'react';
import htm from 'htm';
import { beliefsClarifiedData } from './beliefsClarifiedData.js';

const html = htm.bind(createElement);

const TimelineCard = ({ entry, index }) => {
    const isLeft = index % 2 === 0;

    return (
        html`
        <div className=${`mb-8 flex items-center w-full ${isLeft ? 'flex-row-reverse' : ''}`}>
            <div className="order-1 flex-1"></div>
            <div className=${`z-20 flex items-center order-1 bg-amber-600/80 shadow-xl w-8 h-8 rounded-full flex-shrink-0 mx-2`}>
                <div className=${`mx-auto w-2 h-2 rounded-full bg-white`}></div>
            </div>
            <div className=${`order-1 bg-amber-800/80 rounded-lg shadow-xl flex-1 px-4 py-3 timeline-item-animate`}>
                <h3 className="font-bold text-white text-lg">${entry.year}</h3>
                <ul className="list-disc list-inside mt-2 space-y-1.5">
                    ${entry.events.map((eventText, i) => (
                        html`<li key=${i} className="text-xs text-slate-200 leading-snug">${eventText}</li>`
                    ))}
                </ul>
            </div>
        </div>
        `
    );
};

export const BeliefsClarifiedTimelineChart = () => {
    return (
        html`
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="relative w-full overflow-x-auto">
                <div className="relative p-2 h-full" style=${{ minWidth: '600px' }}>
                    <div className="border-2-2 absolute border-opacity-20 border-slate-600 h-full border" style=${{ left: '50%' }}></div>
                    ${beliefsClarifiedData.map((entry, index) => (
                        html`<${TimelineCard} key=${`${entry.year}-${index}`} entry=${entry} index=${index} />`
                    ))}
                </div>
            </div>
        </div>
        `
    );
};