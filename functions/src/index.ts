import * as functions from 'firebase-functions';
import { Request, Response, Application } from 'express';
import express = require('express');
import * as path from 'path';
import admin = require('firebase-admin');

const cors = require('cors')({ origin: true });
const AccessToken = require('twilio').jwt.AccessToken;

var app: Application = express();
app.use(cors);

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const VideoGrant = AccessToken.VideoGrant;
const MAX_ALLOWED_SESSION_DURATION = 180; //30 min
const twilioAccountSid = 'AC48971261e37cd90ce1bb554af65efac2';
const twilioApiKeySID = 'SK5427e8719bad205c94c833fdbdfe21e2';
const twilioApiKeySecret = 'z731qFsLvYaL2GLOKEnjyZBBgVHd7pnX';

app.use(express.static(path.join(__dirname, 'build')));

app.get('/token', (req: Request, res: Response) => {
    const { identity, meetingId } = req.query;
    var retVal = false;

    const db = admin.firestore();
    const docRef = db.collection('meetings').doc(meetingId!.toString());
    var roomName = "";

    docRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                retVal = false;
            } else {
                roomName = doc?.data()!.roomName.toString();
                retVal = true;

                if (retVal) {
                    const token = new AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
                        ttl: MAX_ALLOWED_SESSION_DURATION,
                    });
                    token.identity = identity;
                    const videoGrant = new VideoGrant({ room: roomName });
                    token.addGrant(videoGrant);
                    res.set('Cache-Control', 'no-cache');
                    //res.set('Content-Type', 'application/json');
                    res.send(token.toJwt());
                    console.log('Issued token for: ' + { identity } + ' in room: ' + { roomName });
                } else {
                    res.send("");
                    console.log('unable to create token');
                }
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
});

app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'build/index.html')));
app.listen(8081, () => console.log('token server running on 8081'));
exports.app = functions.https.onRequest(app);