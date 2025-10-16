


import { useState, useEffect, useCallback, useMemo, createElement } from 'react';
import htm from 'htm';
import { Header } from './components/Header.js';
import { Timeline } from './components/Timeline.js';
import { AnalysisSection } from './components/AnalysisSection.js';
import { QuerySection } from './components/QuerySection.js';
import { Tabs } from './components/Tabs.js';
import { LifespanOverlapChart } from './components/LifespanOverlapChart.js';
import { ReignsAndProphetsChart } from './components/ReignsAndProphetsChart.js';
import { MinistryTimelineChart } from './components/MinistryTimelineChart.js';
import { ApostolicPeriodChart } from './components/ApostolicPeriodChart.js';
import { PropheticTimelineChart } from './components/PropheticTimelineChart.js';
import { ModernTimelineChart } from './components/ModernTimelineChart.js';
import { KingdomEraTimelineChart } from './components/KingdomEraTimelineChart.js';
import { BeliefsClarifiedTimelineChart } from './components/BeliefsClarifiedTimelineChart.js';
import { LifeSpanTable } from './components/LifeSpanTable.js';
import { ProcreationTable } from './components/ProcreationTable.js';
import { QASection } from './components/QASection.js';
import { BibleBooksTable } from './components/BibleBooksTable.js';
import { ChronologyMethodology } from './components/ChronologyMethodology.js';
import { QRCodeFooter } from './components/QRCodeFooter.js';
import { VisualizationSelector } from './components/VisualizationSelector.js';
import { ApiKeyManager } from './components/ApiKeyManager.js';

import { rawChronologyData } from './data/chronology.js';
import { modernEventsData } from './data/modernEventsData.js';
import { kingdomEraEventsData } from './data/kingdomEraEventsData.js';
import { beliefsClarifiedData } from './data/beliefsClarifiedData.js';
import { ERAS_DATA, ALL_ERA_IDS } from './data/erasData.js';
import { parseBibleChronology } from './utils/parser.js';
import { generateAnalysis, generateQueryResponse } from './services/geminiService.js';
import { lifespanOverlapData } from './data/lifespanOverlapData.js';
import { significantEventsData } from './data/significantEventsData.js';
import { sourceStudyNumber3 } from './data/sourceStudyNumber3.js';
import { sourceChronologyIt1 } from './data/sourceChronologyIt1.js';
import { sourceDatesRs } from './data/sourceDatesRs.js';
import { sourceYearIt2 } from './data/sourceYearIt2.js';
import { sourceCalendarIt1 } from './data/sourceCalendarIt1.js';
import { sourceWatchtower20111101 } from './data/sourceWatchtower20111101.js';

const html = htm.bind(createElement);

const App = () => {
  const [groupedEvents, setGroupedEvents] = useState({});
  const [analysis, setAnalysis] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEras, setSelectedEras] = useState(new Set());
  const [conversation, setConversation] = useState([]);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState(null);
  const [activeTab, setActiveTab] = useState('Historical Timeline');
  const [activeVisualization, setActiveVisualization] = useState(null);

  const VISUALIZATIONS = useMemo(() => [
    { 
      title: "Pre-Flood Lifespan Overlap (4026-2370 BCE)", 
      component: LifespanOverlapChart, 
      props: { data: lifespanOverlapData.filter(d => d.birthYearBCE > 2370), significantEvents: significantEventsData, initialRange: { start: 4050, end: 2350 } }, 
      description: "Visualize the overlapping lifespans of patriarchs from Adam to Noah. Significant events like births and the Flood are marked. Use your mouse to click and drag to zoom into a specific period." 
    },
    { 
      title: "Post-Flood Patriarchs Lifespan Overlap (2370-1513 BCE)", 
      component: LifespanOverlapChart, 
      props: { data: lifespanOverlapData.filter(d => d.deathYearBCE < 2370 && d.deathYearBCE > 1513), significantEvents: significantEventsData, initialRange: { start: 2500, end: 1500 } }, 
      description: "See how the lives of figures like Noah, Shem, Abraham, and Joseph overlapped after the Flood, leading up to the Exodus. Use your mouse to click and drag to zoom." 
    },
    { 
      title: "Kings & Prophets of Israel and Judah (1117-420 BCE)", 
      component: ReignsAndProphetsChart, 
      props: { significantEvents: significantEventsData }, 
      description: "This chart illustrates the reigns of the kings of the united and divided kingdoms of Israel and Judah, alongside the ministries of contemporary prophets. Click and drag to zoom." 
    },
    { 
      title: "The Ministry of Jesus (29-33 CE)", 
      component: MinistryTimelineChart, 
      props: {}, 
      description: "A detailed, chronological view of the key events during the ministries of John the Baptizer and Jesus Christ, presented in a vertical timeline. Use the filters to focus on specific periods." 
    },
    { 
      title: "The Apostolic Period (33-100 CE)", 
      component: ApostolicPeriodChart, 
      props: {}, 
      description: "A swimlane chart showing parallel events in the early Christian congregation, including missionary journeys, biblical writings, and key Roman/Jewish historical context. Click and drag to zoom." 
    },
    { 
      title: "Timeline of Prophetic Periods", 
      component: PropheticTimelineChart, 
      props: {}, 
      description: "A vertical timeline visualizing key prophetic periods and their fulfillments as understood from the provided chronology. Use the filters to focus on specific prophecies." 
    },
    { 
      title: "Bible Societies & Rediscovery of Bible Truth (1789-1919)", 
      component: ModernTimelineChart, 
      props: {}, 
      description: "A vertical timeline showing pivotal events from the late 18th century through the early 20th century, focusing on Bible translation, the formation of Bible societies, and the rediscovery of key scriptural truths." 
    },
    { 
      title: "The Kingdom is in Place (1914-Present)", 
      component: KingdomEraTimelineChart, 
      props: {}, 
      description: "A vertical timeline covering key events from 1914 onward, including organizational developments, key publications, and the adoption of modern technology in the ministry." 
    },
    { 
      title: "Timeline of Beliefs Clarified (1870-Present)", 
      component: BeliefsClarifiedTimelineChart, 
      props: {}, 
      description: "A vertical timeline charting the progressive clarification of various Bible-based beliefs from 1870 to the present." 
    },
  ], []);

  useEffect(() => {
    const ancientEvents = parseBibleChronology(rawChronologyData);
    const modernEvents = modernEventsData.map(e => ({ type: 'event', year: e.year, era: 'CE', description: e.description, fullText: e.fullText }));
    const kingdomEvents = kingdomEraEventsData.map(e => ({ type: 'event', year: e.year, era: 'CE', description: e.description, fullText: e.fullText }));
    const allEvents = [...ancientEvents, ...modernEvents, ...kingdomEvents];

    const sortedEras = [...ERAS_DATA].sort((a, b) => {
      const yearA = a.era === 'BCE' ? -a.year : a.year;
      const yearB = b.era === 'BCE' ? -b.year : b.year;
      return yearA - yearB;
    });

    const groups = ERAS_DATA.reduce((acc, era) => {
      acc[era.title] = [];
      return acc;
    }, {});

    allEvents.forEach(event => {
      const eventYear = event.era === 'BCE' ? -event.year : event.year;
      let assignedEra = null;
      for (let i = sortedEras.length - 1; i >= 0; i--) {
        const eraDef = sortedEras[i];
        const eraStartYear = eraDef.era === 'BCE' ? -eraDef.year : eraDef.year;
        if (eventYear >= eraStartYear) {
          assignedEra = eraDef.title;
          break;
        }
      }
      if (assignedEra) {
        groups[assignedEra].push(event);
      }
    });

    for (const eraTitle in groups) {
      groups[eraTitle].sort((a, b) => {
        const yearA = a.era === 'BCE' ? -a.year : a.year;
        const yearB = b.era === 'BCE' ? -b.year : b.year;
        if(yearA !== yearB) return yearA - yearB;
        return rawChronologyData.indexOf(a.fullText) - rawChronologyData.indexOf(b.fullText);
      });
    }

    setGroupedEvents(groups);
    
    if (VISUALIZATIONS.length > 0 && !activeVisualization) {
      setActiveVisualization(VISUALIZATIONS[0].title);
    }
  }, [VISUALIZATIONS, activeVisualization]);
  
  const fullChronologyText = useMemo(() => {
    const modernEventsText = modernEventsData.map(e => e.fullText).join('\n');
    const kingdomEraEventsText = kingdomEraEventsData.map(e => e.fullText).join('\n');
    
    const beliefsClarifiedText = beliefsClarifiedData.map(entry => {
      const firstLine = `${entry.year}, ${entry.events[0]}`;
      const subsequentLines = entry.events.slice(1).join('\n');
      if (subsequentLines) {
        return `${firstLine}\n${subsequentLines}`;
      }
      return firstLine;
    }).join('\n');

    const modernHeader = "\n\n--- Bible Societies & Rediscovery of Bible Truth (1789-1919) ---\n";
    const kingdomHeader = "\n\n--- The Kingdom is in Place (1914-Present) ---\n";
    const beliefsHeader = "\n\n--- Beliefs Clarified (1870-Present) ---\n";
    
    const studyNumber3Header = "\n\n--- SOURCE: Study Number 3—Measuring Events in the Stream of Time ---\n";
    const chronologyIt1Header = "\n\n--- SOURCE: Insight on the Scriptures, Vol. 1 'Chronology' ---\n";
    const datesRsHeader = "\n\n--- SOURCE: Reasoning From the Scriptures 'Dates' ---\n";
    const yearIt2Header = "\n\n--- SOURCE: Insight on the Scriptures, Vol. 2 'Year' ---\n";
    const calendarIt1Header = "\n\n--- SOURCE: Insight on the Scriptures, Vol. 1 'Calendar' ---\n";
    const watchtower20111101Header = "\n\n--- SOURCE: The Watchtower, November 1, 2011 ---\n";

    return `${rawChronologyData}\n${modernHeader}\n${modernEventsText}\n${kingdomHeader}\n${kingdomEraEventsText}\n${beliefsHeader}\n${beliefsClarifiedText}\n${studyNumber3Header}\n${sourceStudyNumber3}\n${chronologyIt1Header}\n${sourceChronologyIt1}\n${datesRsHeader}\n${sourceDatesRs}\n${yearIt2Header}\n${sourceYearIt2}\n${calendarIt1Header}\n${sourceCalendarIt1}\n${watchtower20111101Header}\n${sourceWatchtower20111101}`;
  }, []);


  const handleEraToggle = useCallback((eraId) => {
    setSelectedEras(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eraId)) newSet.delete(eraId);
      else newSet.add(eraId);
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedEras(new Set(ALL_ERA_IDS));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedEras(new Set());
  }, []);


  const handleSearchChange = (newTerm) => {
    if (searchTerm && newTerm === '') {
      handleClearAll();
    }
    setSearchTerm(newTerm);
  };

  const handleAnalysis = useCallback(async () => {
    setIsAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis('');
    try {
      const result = await generateAnalysis(fullChronologyText);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setAnalysisError(errorMessage);
    } finally {
      setIsAnalysisLoading(false);
    }
  }, [fullChronologyText]);

  const handleQuery = useCallback(async (query) => {
    setQueryError(null);
    setIsQueryLoading(true);
    const userMessage = { id: `user-${Date.now()}`, sender: 'user', text: query };
    setConversation(prev => [...prev, userMessage]);
    try {
      const result = await generateQueryResponse(query, fullChronologyText);
      const aiMessage = { id: `ai-${Date.now()}`, sender: 'ai', text: result };
      setConversation(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setQueryError(errorMessage);
    } finally {
      setIsQueryLoading(false);
    }
  }, [fullChronologyText]);
  
  return (
    html`
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <${Header} />
      <main className="container mx-auto px-4 py-8">
        <${Tabs}
          tabs=${['Historical Timeline', 'Visualizations', 'Reference & AI', 'Q&A']}
          activeTab=${activeTab}
          setActiveTab=${setActiveTab}
        />
        <div className="mt-8">
          ${activeTab === 'Historical Timeline' && html`
            <${Timeline}
              groupedEvents=${groupedEvents}
              searchTerm=${searchTerm}
              onSearchChange=${handleSearchChange}
              selectedEras=${selectedEras}
              onEraToggle=${handleEraToggle}
              onSelectAll=${handleSelectAll}
              onClearAll=${handleClearAll}
            />
          `}

          ${activeTab === 'Visualizations' && html`
            <div>
              <${VisualizationSelector}
                visualizations=${VISUALIZATIONS}
                activeVisualization=${activeVisualization}
                onSelect=${setActiveVisualization}
              />

              ${(() => {
                const vis = VISUALIZATIONS.find(v => v.title === activeVisualization);
                if (!vis) {
                  return html`<div className="text-center p-8 bg-slate-900/70 rounded-xl border border-slate-800"><p className="text-slate-400">Select a visualization from the list above to view it.</p></div>`;
                }
                
                const ChartComponent = vis.component;

                return html`
                  <div className="bg-slate-900/70 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-800">
                    <h3 className="text-xl font-bold text-teal-300 mb-2">${vis.title}</h3>
                    <p className="text-slate-400 mb-4 text-sm">${vis.description}</p>
                    <div className="mt-4">
                      <${ChartComponent} key=${vis.title} ...${vis.props} />
                    </div>
                  </div>
                `;
              })()}
            </div>
          `}

          ${activeTab === 'Reference & AI' && html`
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <${ApiKeyManager} fullscreenOnOpen />
                    <${QuerySection}
                        conversation=${conversation}
                        onQuerySubmit=${handleQuery}
                        isLoading=${isQueryLoading}
                        error=${queryError}
                    />
                    <${AnalysisSection}
                        onAnalyze=${handleAnalysis}
                        analysis=${analysis}
                        isLoading=${isAnalysisLoading}
                        error=${analysisError}
                    />
                </div>
                <div className="space-y-8">
                    <${BibleBooksTable} fullscreenOnOpen />
                    <${LifeSpanTable} fullscreenOnOpen />
                    <${ProcreationTable} fullscreenOnOpen />
                    <${ChronologyMethodology} fullscreenOnOpen />
                </div>
            </div>
          `}

          ${activeTab === 'Q&A' && html`
            <${QASection} />
          `}
        </div>
      </main>
      <${QRCodeFooter} />
    </div>
  `
  );
};

export default App;