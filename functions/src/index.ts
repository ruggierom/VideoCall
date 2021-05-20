import * as functions from 'firebase-functions';
import { Request, Response, Application } from 'express';
//import express = require('express');
import * as path from 'path';
import admin = require('firebase-admin');
import express = require('express');

const Twilio = require('twilio');

const cors = require('cors')({ origin: true });
const AccessToken = Twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const ChatGrant = AccessToken.ChatGrant;

var app: Application = express();
app.use(cors);

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const MAX_ALLOWED_SESSION_DURATION = 180; //30 min

const twilioAccountSid = 'AC48971261e37cd90ce1bb554af65efac2';
const twilioApiKeySID = 'SK5427e8719bad205c94c833fdbdfe21e2';
const twilioApiKeySecret = 'z731qFsLvYaL2GLOKEnjyZBBgVHd7pnX';
const twilioConversationsServiceSid = 'IS77c9edd3c0a44e60a328b3fac4c2da08';

const client = Twilio(twilioApiKeySID, twilioApiKeySecret, {
    accountSid: twilioAccountSid,
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('/token', (req: Request, res: Response) => {
    const { identity, meetingId } = req.query;
    var retVal = false;

    const db = admin.firestore();
    const docRef = db.collection('meetings').doc(meetingId!.toString());
    var roomName = meetingId!.toString();

    docRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                retVal = false;
            } else {
                roomName = doc?.data()!.roomName.toString();
                retVal = true;
                let room;

                try {
                    // See if a room already exists
                    room = client.video.rooms(roomName).fetch();
                    console.log(room);
                } catch (e) {
                    try {
                        // If room doesn't exist, create it
                        room = client.video.rooms.create({
                            uniqueName: roomName//, type: 'go'
                        });

                    } catch (e) {
                        console.log(e);
                        res.statusCode = 500;
                        res.send({
                            error: {
                                message: 'error creating room',
                                explanation: 'Something went wrong when creating a room.',
                            },
                        });
                    }
                }

                console.log('getting conversation client');
                const conversationsClient = client.conversations.services(twilioConversationsServiceSid);
                try {
                    // See if conversation already exists
                    conversationsClient.conversations(roomName).fetch();
                    console.log('checking if conversation already exists');
                } catch (e) {
                    try {
                        // If conversation doesn't exist, create it.
                        conversationsClient.conversations.create({ uniqueName: roomName, 'timers.closed': 'P1D' });
                        console.log('Creating conversation');
                    } catch (e) {
                        console.log(e);
                        res.statusCode = 500;
                        res.send({
                            error: {
                                message: 'error creating conversation',
                                explanation: 'Something went wrong when creating a conversation.',
                            },
                        });
                    }
                }

                try {
                    // Add participant to conversation
                    conversationsClient.conversations(roomName).participants.create({ identity: identity });
                    console.log('Add participant to conversation: ', roomName);
                } catch (e) {
                    console.log(e);
                    // Ignore "Participant already exists" error (50433)
                    if (e.code !== 50433) {
                        res.statusCode = 500;
                        res.send({
                            error: {
                                message: 'error creating conversation participant',
                                explanation: 'Something went wrong when creating a conversation participant.',
                            },
                        });
                    }
                }
            }

            if (retVal) {
                const token = new AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
                    ttl: MAX_ALLOWED_SESSION_DURATION,
                });

                token.identity = identity;
                //token.roomType = 'go';
                token.roomName = roomName;
                const videoGrant = new VideoGrant({ room: roomName });
                token.addGrant(videoGrant);

                const chatGrant = new ChatGrant({ serviceSid: twilioConversationsServiceSid });
                token.addGrant(chatGrant);
                res.set('Cache-Control', 'no-cache');
                //res.set('Content-Type', 'application/json');
                res.send(token.toJwt());
                console.log('Issued token for: ' + { identity } + ' in room: ' + { roomName });
            } else {
                res.send("");
                console.log('unable to create token');
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
});

app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'build/index.html')));
app.listen(8081, () => console.log('token server running on 8081'));
exports.app = functions.https.onRequest(app);