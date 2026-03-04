import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "moontracker-b7a5f.firebaseapp.com",
    projectId: "moontracker-b7a5f",
    storageBucket: "moontracker-b7a5f.firebasestorage.app",
    messagingSenderId: "326369453475",
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

/**
 * Get the FCM messaging instance (only works in browsers that support it).
 */
export function getFirebaseMessaging(): Messaging | null {
    if (messaging) return messaging;
    try {
        if (typeof window !== "undefined" && "Notification" in window) {
            messaging = getMessaging(app);
        }
    } catch {
        console.warn("[FCM] Messaging not supported in this browser.");
    }
    return messaging;
}

/**
 * Request notification permission and retrieve the FCM token.
 * Returns null if the user denies permission or the browser doesn't support it.
 */
export async function requestNotificationPermission(): Promise<string | null> {
    const m = getFirebaseMessaging();
    if (!m) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        console.log("[FCM] Notification permission denied.");
        return null;
    }

    try {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        const token = await getToken(m, {
            vapidKey,
            serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js"),
        });
        console.log("[FCM] Token:", token);
        return token;
    } catch (err) {
        console.error("[FCM] Failed to get token:", err);
        return null;
    }
}

/**
 * Listen for foreground messages. Call this once to set up the listener.
 */
export function onForegroundMessage(callback: (payload: any) => void): () => void {
    const m = getFirebaseMessaging();
    if (!m) return () => { };
    return onMessage(m, callback);
}
