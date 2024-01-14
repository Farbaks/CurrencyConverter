self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('your-app-cache').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles/index.css',
                '/styles/header.css',
                '/styles/widget.css',
                '/scripts/index.js',
                '/assets/favicon/android-chrome-512x512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
