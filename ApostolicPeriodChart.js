

import { useMemo, useState, useRef, createElement, useEffect } from 'react';
import htm from 'htm';
import { apostolicEventsData } from './apostolicEventsData.js';

const html = htm.bind(createElement);

const CATEGORIES = [ 'Congregation Milestones', 'Missionary Journeys', 'Writings', 'Roman & Jewish Events' ];
const COLORS = { 'Congregation Milestones': 'bg-purple-500/80', 'Missionary Journeys': 'bg-sky-500/80', 'Writings': 'bg-teal-500/80', 'Roman & Jewish Events': 'bg-amber-500/80' };
const getNiceInterval = (range) => { if (range <= 10) return 1; if (range <= 20) return 2; if (range <= 50) return 5; return 10; };

const layoutEvents = (events) => {
    const sortedEvents = [...events].sort((a, b) => a.startYearCE - b.startYearCE);
    const layout = [];
    const levelEnds = [];

    for (const event of sortedEvents) {
        let placed = false;
        let level = 0;
        while (!placed) {
            if (levelEnds[level] === undefined || event.startYearCE >= levelEnds[level]) {
                layout.push({ event, level });
                levelEnds[level] = event.endYearCE + 1;
                placed = true;
            } else {
                level++;
            }
        }
    }
    return layout;
}

export const ApostolicPeriodChart = () => {
    const [tooltip, setTooltip] = useState(null);
    const chartRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(1000);
    const initialRange = useMemo(() => ({ start: 33, end: 100 }), []);
    const [currentRange, setCurrentRange] = useState(initialRange);
    const [selection, setSelection] = useState({ start: null, end: null });
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (chartRef.current) {
            setChartWidth(chartRef.current.offsetWidth);
        }
        const handleResize = () => {
            if (chartRef.current) {
                setChartWidth(chartRef.current.offsetWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { timelineStart, timelineEnd, yearRange, data } = useMemo(() => {
        const viewStart = currentRange.start;
        const viewEnd = currentRange.end;
        return {
            timelineStart: viewStart,
            timelineEnd: viewEnd,
            yearRange: viewEnd - viewStart,
            data: apostolicEventsData.filter(d => d.endYearCE >= viewStart && d.startYearCE <= viewEnd),
        };
    }, [currentRange]);

    const categorizedAndLaidOutData = useMemo(() => {
        const result = {};
        for(const category of CATEGORIES) {
            const categoryEvents = data.filter(d => d.category === category);
            result[category] = layoutEvents(categoryEvents);
        }
        return result;
    }, [data]);

    const isZoomed = currentRange.start !== initialRange.start || currentRange.end !== initialRange.end;
    const showTooltip = (e, content) => setTooltip({ content, x: e.clientX, y: e.clientY });
    const hideTooltip = () => setTooltip(null);
    const handleResetZoom = () => setCurrentRange(initialRange);

    const pixelToYear = (pixelX) => {
        if (!chartWidth || yearRange === 0) return timelineStart;
        return timelineStart + (pixelX / chartWidth) * yearRange;
    };

    const handleMouseDown = (e) => {
        if (!chartRef.current) return;
        const rect = chartRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setIsDragging(true);
        setSelection({ start: x, end: x });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !chartRef.current) return;
        const rect = chartRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setSelection(prev => ({ ...prev, end: x }));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (selection.start !== null && selection.end !== null && Math.abs(selection.start - selection.end) > 10) {
            const y1 = Math.round(pixelToYear(selection.start));
            const y2 = Math.round(pixelToYear(selection.end));
            const newStart = Math.min(y1, y2);
            const newEnd = Math.max(y1, y2);
            if (newEnd > newStart) { // Prevent zooming to a zero-width range
                setCurrentRange({ start: newStart, end: newEnd });
            }
        }
        setSelection({ start: null, end: null });
    };

    const yearMarkers = useMemo(() => {
        const markers = [];
        if (yearRange <= 0) return markers;
        const interval = getNiceInterval(yearRange);
        const startMarker = Math.ceil(timelineStart / interval) * interval;
        for (let year = startMarker; year <= timelineEnd; year += interval) {
            markers.push(year);
        }
        return markers;
    }, [timelineStart, timelineEnd, yearRange]);

    return (
        html`
        <div className="relative w-full overflow-x-auto bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            ${isZoomed && html`<button onClick=${handleResetZoom} className="absolute top-2 right-2 z-30 bg-slate-700 hover:bg-slate-600 text-teal-300 text-xs py-1 px-3 rounded-full">Reset Zoom</button>`}
            <div className="flex">
                <div className="w-40 flex-shrink-0 text-right pr-4 text-xs font-bold text-slate-400 pt-[52px]">
                    ${CATEGORIES.map(cat => html`<div key=${cat} className="h-20 flex items-center justify-end">${cat}</div>`)}
                </div>
                <div 
                    ref=${chartRef} 
                    className=${`flex-grow relative cursor-crosshair ${isDragging ? 'select-none' : ''}`}
                    style=${{ minWidth: '1000px' }}
                    onMouseDown=${handleMouseDown}
                    onMouseMove=${handleMouseMove}
                    onMouseUp=${handleMouseUp}
                    onMouseLeave=${() => isDragging && handleMouseUp()}
                >
                    <div className="relative h-6 mb-2">
                        ${yearMarkers.map(year => {
                            if (yearRange <= 0) return null;
                            const percent = ((year - timelineStart) / yearRange) * 100;
                            return (percent >= 0 && percent <= 100) && (
                                html`<div key=${year} className="absolute h-full top-0" style=${{ left: `${percent}%` }}>
                                    <span className="absolute -translate-x-1/2 text-xs text-slate-500">${year} CE</span>
                                    <div className="absolute top-5 h-2 w-px bg-slate-700/50"></div>
                                </div>`
                            );
                        })}
                    </div>
                    
                    <div className="relative">
                        ${yearRange > 0 && yearMarkers.map(year => {
                            const percent = ((year - timelineStart) / yearRange) * 100;
                             return (percent >= 0 && percent <= 100) && (
                                html`<div key=${`line-${year}`} className="absolute h-full top-0" style=${{ left: `${percent}%`}}>
                                    <div className="h-full w-px bg-slate-800"></div>
                                </div>`
                             );
                        })}

                        ${yearRange > 0 && CATEGORIES.map((category) => (
                            html`<div key=${category} className="h-20 relative border-t border-slate-800">
                                ${categorizedAndLaidOutData[category].map(({ event, level }) => {
                                    const leftPercent = ((event.startYearCE - timelineStart) / yearRange) * 100;
                                    const end = Math.max(event.startYearCE + 0.5, event.endYearCE);
                                    const widthPercent = Math.max(0.2, ((end - event.startYearCE) / yearRange) * 100);
                                    
                                    const yOffset = level * 12;
                                    if (leftPercent > 100 || (leftPercent + widthPercent) < 0) return null;

                                    return (
                                        html`<div
                                            key=${`${event.category}-${event.startYearCE}-${event.description}`}
                                            className=${`absolute h-5 rounded-sm ${COLORS[event.category]} flex items-center justify-start px-2 cursor-pointer hover:scale-[1.03] transition-transform origin-left`}
                                            style=${{
                                                left: `${leftPercent}%`,
                                                width: `${widthPercent}%`,
                                                top: `${10 + yOffset}px`,
                                            }}
                                            onMouseMove=${(e) => {
                                                if (isDragging) return;
                                                showTooltip(e, html`
                                                <>
                                                    <div className="font-bold text-teal-300">${event.description}</div>
                                                    <div>${event.startYearCE !== event.endYearCE ? `${event.startYearCE}-${event.endYearCE}` : event.startYearCE} CE</div>
                                                </>
                                            `);
                                            }}
                                            onMouseLeave=${hideTooltip}
                                        >
                                            <span className="text-white text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">${event.description}</span>
                                        </div>`
                                    );
                                })}
                            </div>`
                        ))}
                    </div>

                    ${isDragging && selection.start !== null && selection.end !== null && (
                        html`<div className="absolute top-0 h-full bg-teal-500/20 border-2 border-teal-400 pointer-events-none z-20" style=${{
                            left: Math.min(selection.start, selection.end),
                            width: Math.abs(selection.end - selection.start),
                        }} />`
                    )}
                </div>
            </div>
             ${tooltip && (
                html`<div
                className="fixed z-50 p-2 text-xs text-white bg-slate-800 border border-slate-600 rounded-md shadow-lg pointer-events-none"
                style=${{ 
                    left: tooltip.x, top: tooltip.y, transform: 'translate(15px, 15px)'
                }}
                >
                ${tooltip.content}
                </div>`
            )}
        </div>
        `
    );
};