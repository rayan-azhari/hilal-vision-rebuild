import * as admin from "firebase-admin";
import path from "path";
import { getDb } from "../db.js";
import { pushTokens } from "../../drizzle/schema.js";

// Load service account key
const SERVICE_ACCOUNT_PATH = path.resolve(
    __dirname,
    "../../moontracker-b7a5f-firebase-adminsdk-fbsvc-61ce975044.json"
);

export async function initFirebaseAdmin() {
    if (admin.apps.length > 0) return;

    try {
        const serviceAccount = require(SERVICE_ACCOUNT_PATH);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: "moontracker-b7a5f",
        });
        console.log("[Firebase Admin] Initialized successfully.");
    } catch (error) {
        console.error("[Firebase Admin] Failed to initialize:", error);
    }
}

/**
 * Send a push notification to all subscribed devices.
 */
export async function broadcastNotification(title: string, body: string, url: string = "/") {
    await initFirebaseAdmin();
    const db = await getDb();
    if (!db) {
        console.error("[Push] Database not available.");
        return { success: false, error: "No DB" };
    }

    // Fetch all tokens from the database
    const subscriptions = await db.select().from(pushTokens);
    const tokens = subscriptions.map((s) => s.token);

    if (tokens.length === 0) {
        console.log("[Push] No subscribed devices found.");
        return { success: true, count: 0 };
    }

    const message: admin.messaging.MulticastMessage = {
        notification: {
            title,
            body,
        },
        data: {
            url,
        },
        tokens, // Send to all tokens
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`[Push] Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`);

        // Optional: Cleanup expired tokens from response.responses where error.code === 'messaging/invalid-registration-token'

        return { success: true, count: response.successCount };
    } catch (error) {
        console.error("[Push] Error sending broadcast:", error);
        return { success: false, error };
    }
}

// If run directly from CLI
if (require.main === module) {
    const title = process.argv[2] || "Crescent Sighted!";
    const body = process.argv[3] || "A new authentic moon sighting report has been verified.";
    const url = process.argv[4] || "/";

    console.log(`Sending broadcast: "${title}" - "${body}"`);
    broadcastNotification(title, body, url)
        .then((res) => {
            console.log(res);
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
