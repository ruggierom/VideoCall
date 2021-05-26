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
app.options('*', cors);
app.use(cors);

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const MAX_ALLOWED_SESSION_DURATION = 180; //30 min
const twilioAccountSid = 'AC48971261e37cd90ce1bb554af65efac2';
const twilioApiKeySID = 'SK5427e8719bad205c94c833fdbdfe21e2';
const twilioApiKeySecret = 'z731qFsLvYaL2GLOKEnjyZBBgVHd7pnX';
const twilioConversationsServiceSid = 'IS77c9edd3c0a44e60a328b3fac4c2da08';
const testMeetingRoom = 'test99';

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
    let room = client.video.rooms(roomName).fetch();

    docRef.get()
        .then(async doc => {
            if (!doc.exists && meetingId != testMeetingRoom) {
                console.log('No such document!');
                retVal = false;
            } else {
                if (meetingId == testMeetingRoom) {
                    roomName = testMeetingRoom;
                } else {
                    roomName = doc?.data()!.roomName.toString();
                }

                console.log("roomName: ", roomName);
                retVal = true;

                try {
                    // See if a room already exists
                    room = await client.video.rooms(roomName).fetch();
                    console.log("See if a room already exists");
                    console.log("room.sid: ", room.sid);
                    console.log("room.name: ", room.name);
                } catch (e) {
                    try {
                        // If room doesn't exist, create it
                        console.log("room doesn't exist, create it");
                        room = await client.video.rooms.create({ uniqueName: roomName, type: 'group-small' });
                        console.log("room.sid: ", room.sid);
                        console.log("room.name: ", room.name);
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
                    await conversationsClient.conversations(room.sid).fetch();
                    console.log('checking if conversation already exists');
                } catch (e) {
                    console.log(e);
                    try {
                        // If conversation doesn't exist, create it.
                        conversationsClient.conversations.create({ uniqueName: room.sid, 'timers.closed': 'P1D' });
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
                    conversationsClient.conversations(room.sid).participants.create({ identity: identity });
                    console.log('Add participant to conversation: ', room.sid);
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
                token.roomType = 'group-small';
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
console.log("FILE PATH: ", path.join(__dirname, '/build/index.html'));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '/build/index.html')));
app.listen(8081, () => console.log('token server XXXX running on 8081'));
exports.app = functions.https.onRequest(app);