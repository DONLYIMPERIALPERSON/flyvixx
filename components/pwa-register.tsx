'use client';

import { useEffect } from 'react';

export default function PWARegister() {
    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);

                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        // New content is available, notify user
                                        console.log('New content is available and will be used when all tabs for this page are closed.');
                                        // You could show a notification to the user here
                                    }
                                });
                            }
                        });
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // Handle PWA install prompt
        let deferredPrompt: any;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            deferredPrompt = e;

            // Show install button or prompt
            console.log('PWA install prompt available');
            // You can dispatch a custom event or use state management to show install UI
            window.dispatchEvent(new CustomEvent('pwa-install-available', { detail: deferredPrompt }));
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            deferredPrompt = null;
            window.dispatchEvent(new CustomEvent('pwa-installed'));
        });

        // Handle online/offline status
        const handleOnline = () => {
            console.log('App is online');
            window.dispatchEvent(new CustomEvent('app-online'));
        };

        const handleOffline = () => {
            console.log('App is offline');
            window.dispatchEvent(new CustomEvent('app-offline'));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return null; // This component doesn't render anything
}