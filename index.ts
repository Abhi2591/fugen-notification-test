import * as admin from 'firebase-admin';
import express, {Request, Response} from 'express';
import path from 'path';

const app = express();
app.use(express.json());
const PORT = 3000;

// const serviceAccountPath = path.resolve(__dirname, 'noty-e846b-firebase-adminsdk-0uws7-0c4e667af9.json');
admin.initializeApp({
  credential: admin.credential.cert(require('./noty-e846b-firebase-adminsdk-0uws7-47854f3f49.json')),
});

const fcmTokens: string[] = [];

app.post('/register', (req : Request , res : Response) => {
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

app.post('/send-notification', async (req : Request, res : Response) => {
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
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).send({ error: 'Failed to send notifications.' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
