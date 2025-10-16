import { useMemo, useState, useRef, createElement, Fragment, useEffect } from 'react';
import htm from 'htm';
import { reignsAndProphetsVisData } from './reignsAndProphetsVisData.js';

const html = htm.bind(createElement);

const COLORS = {
    'King of Judah': 'bg-blue-500/80',
    'King of Israel': 'bg-red-500/80',
    'United Kingdom of Israel': 'bg-sky-500/80',
    'David over Judah': 'bg-green-500/80',
    'Prophet': 'bg-teal-500/80',
};

const getNiceInterval = (yearRange) => {
    if (yearRange <= 0) return 1;
    let targetTicks = 10;
     if (yearRange < 20) targetTicks = Math.max(1, Math.floor(yearRange));
    else if (yearRange < 50) targetTicks = 10;
    
    const rawInterval = yearRange / targetTicks;
    const intervals = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];

    for (const interval of intervals) {
        if (interval >= rawInterval) {
            return interval;
        }
    }
    return intervals[intervals.length - 1];
};

export const ReignsAndProphetsChart = ({ significantEvents }) => {
    const [tooltip, setTooltip] = useState(null);
    const chartRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(1400);
    const initialRange = useMemo(() => ({ start: 1120, end: 420 }), []);
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

        const filteredData = reignsAndProphetsVisData.filter(d => 
             d.startYearBCE >= viewEnd && d.endYearBCE <= viewStart && d.startYearBCE >= d.endYearBCE
        );

        const groups = {};
        for (const person of filteredData) {
            if (!groups[person.name]) {
                groups[person.name] = [];
            }
            groups[person.name].push(person);
        }

        const sortedGroupNames = Object.keys(groups).sort((a, b) => {
            const firstA = Math.max(...groups[a].map(p => p.startYearBCE));
            const firstB = Math.max(...groups[b].map(p => p.startYearBCE));
            return firstB - firstA;
        });
        
        return {
            timelineStart: viewStart,
            timelineEnd: viewEnd,
            yearRange: viewStart - viewEnd,
            data: sortedGroupNames.map(name => groups[name]),
        };
    }, [currentRange]);

    const filteredEvents = useMemo(() => significantEvents.filter(event => event.year >= currentRange.end && event.year <= currentRange.start), [significantEvents, currentRange]);

    const processedEvents = useMemo(() => {
        if (!chartWidth || yearRange <= 0) return []; // Guard against division by zero
        const sortedEvents = [...filteredEvents].sort((a, b) => b.year - a.year);
        const labelLayout = [];
        const levelEnds = []; 
        
        const avgCharHeightInYears = (yearRange / chartWidth) * 7;
        const yearPadding = yearRange * 0.01;

        for (const event of sortedEvents) {
            let placed = false;
            let level = 0;
            const labelHeightInYears = (event.description.length + 7) * avgCharHeightInYears;
            while (!placed) {
                if (levelEnds[level] === undefined || event.year < levelEnds[level] - yearPadding) {
                    labelLayout.push({ event, level });
                    levelEnds[level] = event.year - labelHeightInYears;
                    placed = true;
                } else {
                    level++;
                }
            }
        }
        return labelLayout;
    }, [filteredEvents, yearRange, chartWidth]);


    const isZoomed = currentRange.start !== initialRange.start || currentRange.end !== initialRange.end;

    const showTooltip = (event, content) => {
        setTooltip({ content, x: event.clientX, y: event.clientY });
    };
    const hideTooltip = () => setTooltip(null);
    
    const handleResetZoom = () => {
        setCurrentRange(initialRange);
    };

    const pixelToYear = (pixelX) => {
        if (!chartWidth) return 0;
        const year = timelineStart - (pixelX / chartWidth) * yearRange;
        return Math.round(year);
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
            const year1 = pixelToYear(selection.start);
            const year2 = pixelToYear(selection.end);
            const newStart = Math.max(year1, year2);
            const newEnd = Math.min(year1, year2);
            if (newStart > newEnd) {
                setCurrentRange({ start: newStart, end: newEnd });
            }
        }
        setSelection({ start: null, end: null });
    };
  
    const yearMarkers = useMemo(() => {
        if (yearRange <= 0) return [];
        const markers = [];
        const interval = getNiceInterval(yearRange);
        const startMarker = Math.ceil(currentRange.start / interval) * interval;

        for (let year = startMarker; year >= currentRange.end; year -= interval) {
            markers.push(year);
        }
        return markers;
    }, [currentRange, yearRange]);

    const YearMarkersComponent = ({ position }) => (
        html`
        <div className=${`relative h-6 ${position === 'top' ? 'mb-2' : 'mt-2'}`}>
            ${yearMarkers.map(year => {
                const percent = ((timelineStart - year) / yearRange) * 100;
                if (percent < 0 || percent > 100) return null;
                return (
                    html`
                    <div key=${`${position}-${year}`} className="absolute top-0 h-full" style=${{ left: `${percent}%` }}>
                        <span className=${`absolute -translate-x-1/2 text-xs text-slate-500 ${position === 'top' ? 'top-0' : 'bottom-0'}`}>${year}</span>
                    </div>
                    `
                );
            })}
        </div>
        `
    );
    
    const tooltipContent = (person) => {
        let displayType = person.type;
        if (person.name === "David" && person.type === "King of Judah") {
            displayType = "King of Judah (only)";
        }
        return (
            html`
            <>
                <div className="font-bold text-teal-300">${person.name}</div>
                <div>${displayType}</div>
                <div>Active: ${person.startYearBCE} - ${person.endYearBCE} BCE</div>
            </>
            `
        )
    };
    
    const getBarColor = (person) => {
        if (person.name === "David" && person.type === "King of Judah") return COLORS['David over Judah'];
        return COLORS[person.type] || COLORS['Prophet'];
    }

    const renderedGroups = useMemo(() => {
        if (!chartWidth || yearRange <= 0) return []; // Guard against division by zero
        return data.map((group) => {
            const name = group[0].name;

            const firstStart = Math.max(...group.map(p => p.startYearBCE));
            const lastEnd = Math.min(...group.map(p => p.endYearBCE));
            
            const totalLeftPercent = ((timelineStart - firstStart) / yearRange) * 100;
            const totalRightPercent = ((timelineStart - lastEnd) / yearRange) * 100;
            const totalWidthPercent = totalRightPercent - totalLeftPercent;
            const totalWidthPx = (totalWidthPercent / 100) * chartWidth;

            const avgCharWidth = 8.5; 
            const requiredPadding = 24;
            const requiredWidth = name.length * avgCharWidth + requiredPadding;
            const isTooShortForText = totalWidthPx < requiredWidth;

            const nameLabelStyle = {
                position: 'absolute',
                lineHeight: '24px', 
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 1,
            };

            if (isTooShortForText) {
                nameLabelStyle.left = `calc(${totalRightPercent}% + 5px)`;
                nameLabelStyle.color = '#cbd5e1'; 
            } else {
                nameLabelStyle.left = `${totalLeftPercent}%`;
                nameLabelStyle.paddingLeft = '6px';
                nameLabelStyle.maxWidth = `${Math.max(0, totalWidthPx - 12)}px`;
                nameLabelStyle.overflow = 'hidden';
                nameLabelStyle.textOverflow = 'ellipsis';
                nameLabelStyle.color = 'white';
            }

            return {
                name,
                group,
                nameLabelStyle,
            };
        });
    }, [data, timelineStart, yearRange, chartWidth]);

    return (
        html`
        <div className="relative w-full overflow-x-auto bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
            ${isZoomed && html`
                <button
                onClick=${handleResetZoom}
                className="absolute top-2 right-2 z-30 bg-slate-700 hover:bg-slate-600 text-teal-300 text-xs font-semibold py-1 px-3 rounded-full"
                >
                Reset Zoom
                </button>
            `}
            <div 
                ref=${chartRef}
                className=${`relative cursor-crosshair ${isDragging ? 'select-none' : ''}`}
                style=${{ width: `1400px`, minWidth: '100%' }}
                onMouseDown=${handleMouseDown}
                onMouseMove=${handleMouseMove}
                onMouseUp=${handleMouseUp}
                onMouseLeave=${() => { if (isDragging) handleMouseUp(); }}
            >
                <${YearMarkersComponent} position="top" />
                
                <div className="absolute top-6 left-0 w-full h-[calc(100%-48px)] pointer-events-none z-0">
                ${yearMarkers.map(year => {
                    const percent = ((timelineStart - year) / yearRange) * 100;
                     if (percent < 0 || percent > 100) return null;
                    return (
                    html`
                    <div key=${`line-${year}`} className="absolute h-full" style=${{ left: `${percent}%` }}>
                        <div className="h-full w-px bg-slate-800"></div>
                    </div>
                    `
                    );
                })}
                </div>

                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                    ${processedEvents.map(({ event, level }) => {
                        const percent = ((timelineStart - event.year) / yearRange) * 100;
                        if (percent < 0 || percent > 100) return null;
                        const topOffset = 8 + level * 18;
                        return (
                            html`
                            <div key=${event.description} className="absolute top-0 h-full" style=${{ left: `${percent}%`}}>
                                <div className="absolute w-px h-full border-l-2 border-red-500/70 border-dashed"></div>
                                <div 
                                    className="absolute text-white text-xs font-semibold"
                                    style=${{
                                        transform: `translateX(-100%) translateY(${topOffset}px) rotate(-90deg)`,
                                        transformOrigin: 'bottom right', whiteSpace: 'nowrap', paddingRight: '5px'
                                    }}
                                >
                                    ${`${event.description} (${event.year})`}
                                </div>
                            </div>
                            `
                        );
                    })}
                </div>
                
                <div className="relative space-y-1.5 z-10 py-1">
                ${renderedGroups.map(({ name, group, nameLabelStyle }) => (
                        html`
                        <div
                            key=${name}
                            className="h-6 relative flex items-center group"
                        >
                            ${group.map((person) => {
                                const barColor = getBarColor(person);
                                const leftPercent = ((timelineStart - person.startYearBCE) / yearRange) * 100;
                                const rightPercent = ((timelineStart - person.endYearBCE) / yearRange) * 100;
                                const widthPercent = Math.max(0.1, rightPercent - leftPercent);

                                return (
                                    html`
                                    <${Fragment} key=${`${person.type}-${person.startYearBCE}`}>
                                        <div
                                            className=${`absolute h-full rounded-sm ${barColor}`}
                                            style=${{
                                                left: `${leftPercent}%`,
                                                width: `${widthPercent}%`,
                                            }}
                                            onMouseMove=${(e) => { if (!isDragging) showTooltip(e, tooltipContent(person)) }}
                                            onMouseLeave=${hideTooltip}
                                        />
                                        ${person.embeddedProphets?.map((prophetName, index, arr) => {
                                            const positionPercent = (100 / (arr.length + 1)) * (index + 1);
                                            const diamondLeft = `calc(${leftPercent}% + ${(widthPercent * positionPercent) / 100}%)`;
                                            return (
                                                html`
                                                <div 
                                                    key=${prophetName}
                                                    className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2"
                                                    style=${{ left: diamondLeft }}
                                                    onMouseMove=${(e) => {
                                                        e.stopPropagation();
                                                        if (!isDragging) showTooltip(e, html`<div class="font-bold text-yellow-300">${prophetName}</div>`);
                                                    }}
                                                    onMouseLeave=${hideTooltip}
                                                >
                                                    <div className="h-full w-full bg-yellow-400 rotate-45 flex items-center justify-center">
                                                         <span className="text-black text-[10px] font-bold -rotate-45">${prophetName[0]}</span>
                                                    </div>
                                                </div>
                                                `
                                            );
                                        })}
                                    </${Fragment}>
                                    `
                                );
                            })}
                             <div style=${nameLabelStyle}>${name}</div>
                        </div>
                        `
                    ))}
                </div>

                <${YearMarkersComponent} position="bottom" />
                
                ${isDragging && selection.start !== null && selection.end !== null && html`
                <div className="absolute top-0 h-full bg-teal-500/20 border-2 border-teal-400 pointer-events-none" style=${{
                    left: Math.min(selection.start, selection.end),
                    width: Math.abs(selection.end - selection.start),
                }} />
                `}

            </div>
            
            ${tooltip && html`
                <div
                className="fixed z-50 p-2 text-xs text-white bg-slate-800 border border-slate-600 rounded-md shadow-lg pointer-events-none"
                style=${{ 
                    left: tooltip.x, top: tooltip.y, transform: 'translate(15px, 15px)'
                }}
                >
                ${tooltip.content}
                </div>
            `}
        </div>
        `
    );
};