"use strict";
/*import { Request, Response } from "express";

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const MAX_ALLOWED_SESSION_DURATION = 14400;
const twilioAccountSid = 'AC48971261e37cd90ce1bb554af65efac2';
const twilioApiKeySID = 'SK5427e8719bad205c94c833fdbdfe21e2';
const twilioApiKeySecret = 'z731qFsLvYaL2GLOKEnjyZBBgVHd7pnX';

app.use(express.static(path.join(__dirname, 'build')));

app.get('/token', (req: { query: { identity: any; roomName: any; }; }, res: { send: (arg0: any) => void; }) => {
    const { identity, roomName } = req.query;
    const token = new AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
        ttl: MAX_ALLOWED_SESSION_DURATION,
    });
    token.identity = identity;
    const videoGrant = new VideoGrant({ room: roomName });
    token.addGrant(videoGrant);
    res.send(token.toJwt());
    //console.log(issued token for ${ identity } in room ${ roomName });
});

app.get('*', (_: any, res: Response) => res.sendFile(path.join(__dirname, 'build/index.html')));

app.listen(8081, () => console.log('token server running on 8081'));

exports.app = functions.https.onRequest(app);
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const express = require("express");
const path = __importStar(require("path"));
const admin = require("firebase-admin");
const cors = require('cors')({ origin: true });
const AccessToken = require('twilio').jwt.AccessToken;
var app = express();
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
app.get('/token', (req, res) => {
    const { identity, meetingId } = req.query;
    var retVal = false;
    const db = admin.firestore();
    const docRef = db.collection('meetings').doc(meetingId.toString());
    var roomName = "";
    docRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
                retVal = false;
            }
            else {
                roomName = doc === null || doc === void 0 ? void 0 : doc.data().roomName;
                console.log(roomName);
                retVal = true;

                if (retVal) {
                    const token = new AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
                        ttl: MAX_ALLOWED_SESSION_DURATION,
                    });
                    token.identity = identity;
                    const videoGrant = new VideoGrant({ room: roomName });
                    token.addGrant(videoGrant);
                    res.set('Cache-Control', 'no-cache');
                    res.set('Content-Type', 'application/json');
                    res.send(token.toJwt());
                    //console.log(issued token for ${ identity } in room ${ roomName });
                }
                else {
                    res.send("");
                    console.log('unable to create token 1');
                }
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
});
console.log(path.join(__dirname, 'build/index.html'));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'build/index.html')));
app.listen(8081, () => console.log('token server running on 8081'));
exports.app = functions.https.onRequest(app);
