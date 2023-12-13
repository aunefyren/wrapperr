console.log("Service-worker loaded.");

// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
const OFFLINE_VERSION = 1;
const CACHE_NAME = 'wrapperr-cache';
// Customize this with a different URL if needed.
const urlsToCache = [
    '/',
    './manifest.json',
    './assets/img/favicons/favicon.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // Setting {cache: 'reload'} in the new request will ensure that the response
        // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
        for(var i = 0; i < urlsToCache.length; i++) {
            await cache.add(new Request(urlsToCache[i], {cache: 'reload'}));
        }
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        // Enable navigation preload if it's supported.
        // See https://developers.google.com/web/updates/2017/02/navigation-preload
        if ('navigationPreload' in self.registration) {
            await self.registration.navigationPreload.enable();
        }
    })());

    // Tell the active service worker to take control of the page immediately.
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                // First, try to use the navigation preload response if it's supported.
                const preloadResponse = await event.preloadResponse;
                if (preloadResponse) {
                    return preloadResponse;
                }

                const networkResponse = await fetch(event.request);
                return networkResponse;
            } catch (error) {
                // catch is only triggered if an exception is thrown, which is likely
                // due to a network error.
                // If fetch() returns a valid HTTP response with a response code in
                // the 4xx or 5xx range, the catch() will NOT be called.
                console.log('Fetch failed; returning offline page instead.', error);

                const cache = await caches.open(CACHE_NAME);
                const cachedResponse = await cache.match(OFFLINE_URL);
                return cachedResponse;
            }
          })());
    }

    // If our if() condition is false, then this fetch handler won't intercept the
    // request. If there are any other fetch handlers registered, they will get a
    // chance to call event.respondWith(). If no fetch handlers call
    // event.respondWith(), the request will be handled by the browser as if there
    // were no service worker involvement.
});

self.addEventListener('notificationclose', event => {

    try {

        const notification = event.notification;
        const primaryKey = notification.data.primaryKey;

        console.log('Closed notification: ' + primaryKey);

    } catch(e) {
        console.log("Failed to click notfication. Error: " + e)
    }
});

self.addEventListener('notificationclick', event => {

    try {
        
        const notification = event.notification;
        const primaryKey = notification.data.primaryKey;
        const url = notification.data.url;
        const action = event.action;

        if (action === 'close') {
            notification.close();
        } else {
            event.waitUntil(clients.openWindow(self.location.origin + url));
            notification.close();
        }

        console.log('Clicked notification: ' + primaryKey);
    
    } catch(e) {
        console.log("Failed to click notfication. Error: " + e)
    }

    // TODO 5.3 - close all notifications when one is clicked

});

self.addEventListener('push', function(event) {

    if (!(self.Notification && self.Notification.permission === "granted")) {
        console.log("Notification permission not given.")
        return;
    }

    console.log("Pushing notification.")

    try {

        let jsonData = event.data?.json() ?? {
            category: "general",
            title: "Error",
            body: "An error occured"
        };

        console.log("JSON: " + JSON.stringify(jsonData));

        let url;
        let action;

        if(jsonData.category == "achievement") {
            url = "/achievements"
            action = "Check out"
        } else if(jsonData.category == "news") {
            url = "/news"
            action = "Read"
        } else {
            url = "/"
            action = "Visit"
        }

        const options = {
            body: jsonData.body,
            icon: '/assets/logos/logo-384x384.png',
            badge: '/assets/logos/logo-mono-96x96.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1,
                url: url
            },
            actions: [
                {action: 'explore', title: action,
                    icon: '/assets/check.svg'
                },
                {action: 'close', title: 'Close',
                    icon: '/assets/x.svg'
                },
            ],
            tag: 'Message'
        };

        event.waitUntil(
            self.registration.showNotification(jsonData.title, options)
        );

    } catch(e) {
        console.log("Failed to push notfication. Error: " + e)
    }

});