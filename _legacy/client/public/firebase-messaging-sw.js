// Firebase Cloud Messaging Service Worker
// This runs in the background and handles push notifications when the app is closed or in background.

importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "__VITE_FIREBASE_API_KEY__",
    authDomain: "moontracker-b7a5f.firebaseapp.com",
    projectId: "moontracker-b7a5f",
    storageBucket: "moontracker-b7a5f.firebasestorage.app",
    messagingSenderId: "326369453475",
    appId: "__VITE_FIREBASE_APP_ID__",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("[FCM SW] Background message:", payload);

    const title = payload.notification?.title || "Hilal Vision";
    const options = {
        body: payload.notification?.body || "New crescent moon visibility update!",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-72.png",
        data: payload.data,
        tag: "hilal-notification",
        actions: [
            { action: "open", title: "Open App" },
            { action: "dismiss", title: "Dismiss" },
        ],
    };

    self.registration.showNotification(title, options);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
            // Focus existing window if available
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            // Open new window
            return clients.openWindow(url);
        })
    );
});
