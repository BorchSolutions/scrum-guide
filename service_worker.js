const CACHE_NAME = 'scrum-guide-v1';
const urlsToCache = [
    '/',
    'index.html',
    'manifest.json',
    'assets/css/variables.css',
    'assets/css/main.css',
    'assets/css/components.css',
    'assets/css/responsive.css',
    'assets/js/main.js',
    'assets/js/utils.js',
    'assets/js/tabs.js',
    'assets/js/charts.js',
    'assets/js/animations.js',
    'assets/js/component_manager.js',
    'assets/js/content-loader.js',
    'assets/js/navigation.js',
    'assets/js/sprint_board.js',
    'assets/data/sections.js',
    'sections/scrum-foundations.html',
    'sections/estimacion-agil.html',
    'sections/medicion-metricas.html',
    'sections/aplicacion-practica.html',
    'sections/recursos-herramientas.html',
    'components/navigation.html',
    'components/footer.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
