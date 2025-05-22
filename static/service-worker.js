"use strict";
// Cache Name
const CACHE_NAME = "anotherpp-v1.8.1";
// Cache Files
const FILES_TO_CACHE = ["/offline.html"];

// install
self.addEventListener("install", (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Active PWA Cache and clear out anything older
self.addEventListener("activate", (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// listen for fetch events in page navigation and return anything that has been cached
self.addEventListener("fetch", (evt) => {
    // when not a navigation event return
    if (evt.request.mode !== "navigate") {
        return;
    }
    evt.respondWith(
        fetch(evt.request).catch(() => {
            return caches.open(CACHE_NAME).then((cache) => {
                return cache.match("offline.html");
            });
        })
    );
});