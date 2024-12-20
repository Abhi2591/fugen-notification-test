"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = 3000;
const serviceAccountPath = path_1.default.resolve(__dirname, 'noty-e846b-firebase-adminsdk-0uws7-0c4e667af9.json');
admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
});
const fcmTokens = [];
app.post('/register', (req, res) => {
    console.log("/register");
    const { token } = req.body;
    if (!token) {
        res.status(400).send({ error: 'Token is required.' });
    }
    if (!fcmTokens.includes(token)) {
        fcmTokens.push(token);
    }
    res.status(200).send({ message: 'Token registered successfully.' });
});
app.post('/send-notification', async (req, res) => {
    console.log("/send-notification");
    const { senderToken } = req.body;
    if (!senderToken) {
        res.status(400).send({ error: 'Sender token is required.' });
    }
    const recipientTokens = fcmTokens.filter((token) => token !== senderToken);
    if (recipientTokens.length === 0) {
        res.status(200).send({ message: 'No other devices to notify.' });
    }
    const message = {
        notification: {
            title: 'Test Notification',
            body: 'This is a test notification sent to all devices except the sender.',
        },
        tokens: recipientTokens,
    };
    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        res.status(200).send({
            message: 'Notifications sent successfully.',
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses,
        });
    }
    catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).send({ error: 'Failed to send notifications.' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
