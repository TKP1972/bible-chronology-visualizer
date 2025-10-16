const CACHE_NAME = 'biblical-chronology-v32';
const urlsToCache = [
  './',
  './index.html',
  './index.js',
  './metadata.json',
  './App.js',
  './manifest.json',
  './icon.svg',
  './ApiKeyManager.js',
  './AnalysisSection.js',
  './ApostolicPeriodChart.js',
  './BeliefsClarifiedTimelineChart.js',
  './BibleBooksTable.js',
  './ChatMessage.js',
  './ChronologyMethodology.js',
  './CollapsibleSection.js',
  './EraFilter.js',
  './ExportButtons.js',
  './Header.js',
  './KingdomEraTimelineChart.js',
  './LifeSpanTable.js',
  './LifespanOverlapChart.js',
  './MarkdownRenderer.js',
  './MinistryTimelineChart.js',
  './ModernTimelineChart.js',
  './ProcreationTable.js',
  './PropheticTimelineChart.js',
  './QASection.js',
  './QuerySection.js',
  './QRCodeFooter.js',
  './ReignsAndProphetsChart.js',
  './Spinner.js',
  './Tabs.js',
  './Timeline.js',
  './TimelineItem.js',
  './VisualizationSelector.js',
  './apostolicEventsData.js',
  './beliefsClarifiedData.js',
  './bibleBooksData.js',
  './chronology.js',
  './erasData.js',
  './kingdomEraEventsData.js',
  './lifeSpanData.js',
  './lifespanOverlapData.js',
  './ministryEventsData.js',
  './modernEventsData.js',
  './procreationData.js',
  './propheticEventsData.js',
  './qaData.js',
  './reignsAndProphetsVisData.js',
  './significantEventsData.js',
  './sourceCalendarIt1.js',
  './sourceChronologyIt1.js',
  './sourceDatesRs.js',
  './sourceStudyNumber3.js',
  './sourceWatchtower20111101.js',
  './sourceYearIt2.js',
  './geminiService.js',
  './exportUtils.js',
  './parser.js',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600&display=swap',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/htm@3.1.1',
  'https://esm.sh/@google/genai',
  'https://esm.sh/qrcode@1.5.3'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // <-- Tell the new service worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        const promises = urlsToCache.map(url => {
            return cache.add(url).catch(err => {
                // For opaque resources (like no-cors CDN requests), we must fetch and put manually
                if (url.startsWith('http')) {
                    const request = new Request(url, { mode: 'no-cors' });
                    return fetch(request).then(response => cache.put(request, response));
                }
                console.warn(`Failed to cache ${url}: ${err}`);
            });
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Cache hit
        }
        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'opaque')) {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    }).then(() => self.clients.claim()) // <-- Take control of all open pages
  );
});