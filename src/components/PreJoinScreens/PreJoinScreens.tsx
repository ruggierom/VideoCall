import React, { useState, useEffect, FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import MediaErrorSnackbar from './MediaErrorSnackbar/MediaErrorSnackbar';
import WelcomeScreen from './WelcomeScreen/WelcomeScreen';
import { useAppState } from '../../state';
import { useParams } from 'react-router-dom';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import Video from 'twilio-video';
import InvitePage from '../InvitePage/InvitePage';
import { AlertPage } from 'twilio/lib/rest/monitor/v1/alert';
import UserPostMeetingPage from '../PostMeeting/PostMeeting';
import { Typography, makeStyles, TextField, Grid, Button, InputLabel, Theme } from '@material-ui/core';
import firebase, { firestore } from 'firebase/app';
import 'firebase/firestore';
import RoomNameScreen from './RoomNameScreen/RoomNameScreen';
import { PermIdentity } from '@material-ui/icons';

export enum Steps {
    roomNameStep,
    deviceSelectionStep,
    sendInviteStep,
}

export default function PreJoinScreens() {
    let history = useHistory();
    const { user } = useAppState();
    const { getAudioAndVideoTracks } = useVideoContext();
    const showEnd = true;

    var { URLIdentity } = useParams();
    var { URLMeetingId } = useParams();
    const [step, setStep] = useState(Steps.roomNameStep);
    const [test, setTest] = useState(true);
    const [name, setName] = useState<string>(user?.displayName || '');
    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [roomName, setRoomName] = useState<string>('');
    const [mediaError, setMediaError] = useState<Error>();

    const useStyles = makeStyles((theme: Theme) => ({
        fadeOut: {
            visibility: 'hidden',
            opacity: 0,
            transition: 'visibility 0s 2s, opacity 2s linear',
        },
        fadeIn: {
            visibility: 'visible',
            opacity: 1,
            transition: 'opacity 2s linear',
        },
    }));

    const classes = useStyles();

    useEffect(() => {
        if (!user) {
            if (!URLIdentity) {
                URLIdentity = window.sessionStorage.getItem('URLIdentity');
            } else {
                window.sessionStorage.setItem('URLIdentity', URLIdentity);
            }

            if (!URLMeetingId) {
                URLMeetingId = window.sessionStorage.getItem('URLMeetingId');
            } else {
                window.sessionStorage.setItem('URLMeetingId', URLMeetingId);
            }
        }

        if (URLIdentity) {
            var meetingDisplayName = '';
            var names: string[];

            if (user?.displayName) {
                names = user.displayName?.split(' ');

                if (names != null && names?.length > 1) {
                    meetingDisplayName = names[0] + ' ' + names[1].substring(0, 1) + '.';
                } else {
                    meetingDisplayName = user?.displayName;
                }
            } else {
                names = URLIdentity?.split(' ');
                if (names != null && names?.length > 1) {
                    meetingDisplayName = names[0] + ' ' + names[1].substring(0, 1) + '.';
                } else {
                    meetingDisplayName = URLIdentity;
                }
            }

            setUserName(meetingDisplayName);
            if (URLMeetingId) {
                setRoomName(URLMeetingId);
            }

            if (user != null) {
                setStep(Steps.deviceSelectionStep);
                gotoMeeting();
            } else {
                //if (window.location.pathname.indexOf('/invite') > -1) {
                setStep(Steps.sendInviteStep);
                gotoMeeting();
                //} else {
                //  setStep(Steps.deviceSelectionStep);
                // }
            }
        }
    }, [user, URLMeetingId, URLIdentity]);

    useEffect(() => {
        if (step === Steps.deviceSelectionStep && !mediaError) {
            getAudioAndVideoTracks().catch(error => {
                console.log('Error acquiring local media:');
                console.dir(error);
                setMediaError(error);
            });
        }
    }, [getAudioAndVideoTracks, step, mediaError]);

    function gotoMeeting() {
        if (step !== Steps.sendInviteStep) {
            // If this app is deployed as a twilio function, don't change the URL because routing isn't supported.
            if (!window.location.origin.includes('twil.io')) {
                console.log(window.encodeURI(`/meetingId/${roomName}/identity/${userName}`));
                //window.history.replaceState(null, '', window.encodeURI(`/meetingId/${roomName}/identity/${userName}`));
            }
            setStep(Steps.deviceSelectionStep);
        }
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        gotoMeeting();
    };

    if (step === Steps.sendInviteStep) {
        return (
            <IntroContainer>
                <InvitePage
                    userName={userName}
                    userEmail={userEmail}
                    roomName={roomName}
                    setUserName={setUserName}
                    setUserEmail={setUserEmail}
                    setRoomName={setRoomName}
                    handleSubmit={handleSubmit}
                />
            </IntroContainer>
        );
    } else {
        const status = window.sessionStorage.getItem('meetingStatus');
        console.log('status: ', '|', status, '|');

        if (status === 'Complete') {
            return <UserPostMeetingPage></UserPostMeetingPage>;
        }

        return (
            <IntroContainer>
                <MediaErrorSnackbar error={mediaError} />
                {step === Steps.roomNameStep && (
                    <WelcomeScreen
                        userName={userName}
                        roomName={roomName}
                        setName={setName}
                        setRoomName={setRoomName}
                        handleSubmit={handleSubmit}
                    />
                )}

                {step === Steps.deviceSelectionStep && (
                    <DeviceSelectionScreen userName={userName} roomName={roomName} setStep={setStep} />
                )}
            </IntroContainer>
        );
    }
}
