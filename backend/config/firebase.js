const admin = require("firebase-admin");

if (process.env.FB_SERVICE_KEY) {
    try {
        const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(decoded);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error.message);
    }
} else {
    console.warn("Warning: FB_SERVICE_KEY environment variable is not defined. Firebase Admin SDK is running uninitialized.");
}

module.exports = admin;

