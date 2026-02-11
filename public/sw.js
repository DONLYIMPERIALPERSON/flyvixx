// Service Worker for FLYVIXX PWA
const CACHE_NAME = 'flyvixx-v1.0.1';
const STATIC_CACHE = 'flyvixx-static-v1.0.1';
const DYNAMIC_CACHE = 'flyvixx-dynamic-v1.0.1';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/fly',
    '/manifest.json',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/logo.svg',
    '/logo-mark.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                // Cache assets individually to handle failures gracefully
                return Promise.allSettled(
                    STATIC_ASSETS.map(url =>
                        cache.add(url).catch(error => {
                            console.warn(`Service Worker: Failed to cache ${url}:`, error);
                            // Don't fail the entire installation for one asset
                            return Promise.resolve();
                        })
                    )
                );
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (!url.origin.includes(self.location.origin)) return;

    // Handle API requests differently - don't cache authenticated requests
    if (url.pathname.startsWith('/api/')) {
        // Skip caching for authenticated requests or sensitive endpoints
        const shouldSkipCache = request.headers.get('authorization') ||
                                url.pathname.includes('/user/') ||
                                url.pathname.includes('/admin/') ||
                                url.pathname.includes('/auth/');

        if (shouldSkipCache) {
            // Just fetch without caching
            event.respondWith(fetch(request));
            return;
        }

        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful API responses for public endpoints
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => cache.put(request, responseClone))
                            .catch((error) => {
                                console.warn('Service Worker: Failed to cache API response:', error);
                            });
                    }
                    return response;
                })
                .catch((error) => {
                    console.warn('Service Worker: API request failed:', error);
                    // Return cached API response if available
                    return caches.match(request);
                })
        );
        return;
    }

    // Handle static assets and pages
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cache the response
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => cache.put(request, responseClone));

                        return response;
                    })
                    .catch(() => {
                        // Return offline fallback for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/');
                        }
                    });
            })
    );
});

// Background sync for game data (if needed in the future)
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    if (event.tag === 'game-data-sync') {
        event.waitUntil(syncGameData());
    }
});

// Push notifications (for future features)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/android-chrome-192x192.png',
            badge: '/favicon-32x32.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/fly')
    );
});

// Helper function for background sync
async function syncGameData() {
    try {
        // Implement game data synchronization logic here
        console.log('Service Worker: Syncing game data...');
        // This could sync flight history, user preferences, etc.
    } catch (error) {
        console.error('Service Worker: Sync failed:', error);
    }
}