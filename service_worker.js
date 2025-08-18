/**
 * SCRUM Pro Guide - Service Worker
 * PWA functionality with caching strategy
 */

const CACHE_NAME = 'scrum-guide-v1.0.0';
const STATIC_CACHE = 'scrum-guide-static-v1';
const DYNAMIC_CACHE = 'scrum-guide-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/main.css',
    '/assets/css/components.css',
    '/assets/css/responsive.css',
    '/assets/js/main.js',
    '/assets/js/utils.js',
    '/assets/js/content-loader.js',
    '/assets/js/tabs.js',
    '/assets/js/charts.js',
    '/assets/js/animations.js',
    '/components/navigation.html',
    '/components/footer.html'
];

// Content sections for dynamic caching
const CONTENT_SECTIONS = [
    '/sections/scrum-foundations.html',
    '/sections/estimacion-agil.html',
    '/sections/medicion-metricas.html',
    '/sections/aplicacion-practica.html',
    '/sections/recursos-herramientas.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('SW: Installing service worker');
    
    event.waitUntil(
        Promise.all([
            // Cache static files
            caches.open(STATIC_CACHE).then(cache => {
                console.log('SW: Caching static files');
                return cache.addAll(STATIC_FILES);
            }),
            // Preload critical content sections
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('SW: Preloading critical content');
                // Only cache the first two sections initially
                return cache.addAll(CONTENT_SECTIONS.slice(0, 2));
            })
        ])
    );
    
    // Force activation
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('SW: Activating service worker');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old versions
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all pages
    self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(
        handleRequest(request)
    );
});

/**
 * Request handling strategy
 */
async function handleRequest(request) {
    const url = new URL(request.url);
    
    // Strategy for different types of resources
    if (isStaticAsset(url.pathname)) {
        return handleStaticAsset(request);
    } else if (isContentSection(url.pathname)) {
        return handleContentSection(request);
    } else if (url.pathname === '/' || url.pathname.endsWith('.html')) {
        return handlePageRequest(request);
    } else {
        return handleGenericRequest(request);
    }
}

/**
 * Handle static assets (CSS, JS, images)
 * Strategy: Cache First
 */
async function handleStaticAsset(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.warn('SW: Failed to fetch static asset:', request.url);
        return new Response('Asset not available offline', { status: 404 });
    }
}

/**
 * Handle content sections
 * Strategy: Stale While Revalidate
 */
async function handleContentSection(request) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        // Fetch in background to update cache
        const networkPromise = fetch(request).then(networkResponse => {
            if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        }).catch(() => null);
        
        // Return cached version immediately if available
        if (cachedResponse) {
            networkPromise; // Background update
            return cachedResponse;
        }
        
        // Otherwise wait for network
        const networkResponse = await networkPromise;
        if (networkResponse) {
            return networkResponse;
        }
        
        throw new Error('Content not available');
    } catch (error) {
        console.warn('SW: Content section not available:', request.url);
        return createOfflineFallback(request.url);
    }
}

/**
 * Handle page requests
 * Strategy: Network First with Cache Fallback
 */
async function handlePageRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful page responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        return createOfflinePage();
    }
}

/**
 * Handle generic requests
 * Strategy: Network Only with error handling
 */
async function handleGenericRequest(request) {
    try {
        return await fetch(request);
    } catch (error) {
        return new Response('Resource not available offline', { 
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
    return pathname.startsWith('/assets/') || 
           pathname.endsWith('.css') || 
           pathname.endsWith('.js') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.svg') ||
           pathname.endsWith('.ico');
}

/**
 * Check if URL is a content section
 */
function isContentSection(pathname) {
    return pathname.startsWith('/sections/') || 
           pathname.startsWith('/components/');
}

/**
 * Create offline fallback for content sections
 */
function createOfflineFallback(url) {
    const sectionName = url.split('/').pop().replace('.html', '');
    
    const offlineContent = `
        <section class="section">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Contenido No Disponible</h2>
                    <p class="section-subtitle">Esta sección no está disponible sin conexión</p>
                </div>
                <div style="text-align: center; padding: 3rem; color: var(--gray);">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📱</div>
                    <h3>Sin Conexión</h3>
                    <p>La sección "${sectionName}" se cargará cuando tengas conexión a internet.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--gradient-primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            </div>
        </section>
    `;
    
    return new Response(offlineContent, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

/**
 * Create offline page
 */
function createOfflinePage() {
    const offlinePage = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SCRUM Guide - Sin Conexión</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #020617; 
                    color: #F8FAFC; 
                    text-align: center; 
                    padding: 2rem;
                }
                .container { max-width: 600px; margin: 0 auto; }
                .icon { font-size: 5rem; margin-bottom: 1rem; }
                h1 { color: #6366F1; margin-bottom: 1rem; }
                button { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; 
                    border: none; 
                    padding: 1rem 2rem; 
                    border-radius: 10px; 
                    font-size: 1rem; 
                    cursor: pointer;
                    margin-top: 1rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">📱</div>
                <h1>SCRUM Pro Guide</h1>
                <h2>Sin Conexión</h2>
                <p>No tienes conexión a internet en este momento.</p>
                <p>La aplicación funciona parcialmente sin conexión con el contenido previamente cargado.</p>
                <button onclick="location.reload()">Reintentar Conexión</button>
            </div>
        </body>
        </html>
    `;
    
    return new Response(offlinePage, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

// Background sync for analytics and data
self.addEventListener('sync', (event) => {
    if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    // Sync any queued analytics data when back online
    console.log('SW: Syncing analytics data');
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Nueva actualización disponible en SCRUM Guide',
            icon: '/assets/images/icon-192x192.png',
            badge: '/assets/images/icon-72x72.png',
            data: data.url || '/',
            actions: [
                {
                    action: 'view',
                    title: 'Ver Actualización'
                },
                {
                    action: 'dismiss',
                    title: 'Cerrar'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(
                data.title || 'SCRUM Pro Guide',
                options
            )
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data || '/')
        );
    }
});

console.log('🔧 SCRUM Guide Service Worker loaded successfully!');