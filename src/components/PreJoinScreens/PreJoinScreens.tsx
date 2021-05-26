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
import AnonUserPostMeetingPage from '../PostMeeting/PostMeeting';

export enum Steps {
  roomNameStep,
  deviceSelectionStep,
  sendInviteStep,
}

export default function PreJoinScreens() {
  let history = useHistory();
  const { user } = useAppState();
  const { getAudioAndVideoTracks } = useVideoContext();

  const { URLIdentity } = useParams();
  const { URLMeetingId } = useParams();
  const [step, setStep] = useState(Steps.roomNameStep);
  const [name, setName] = useState<string>(user?.displayName || '');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');

  const [mediaError, setMediaError] = useState<Error>();

  useEffect(() => {
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

      if (window.location.pathname.indexOf('/invite') > -1) {
        setStep(Steps.sendInviteStep);
      } else {
        setStep(Steps.deviceSelectionStep);
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step !== Steps.sendInviteStep) {
      // If this app is deployed as a twilio function, don't change the URL because routing isn't supported.
      if (!window.location.origin.includes('twil.io')) {
        window.history.replaceState(null, '', window.encodeURI(`/room/${roomName}${window.location.search || ''}`));
      }
      setStep(Steps.deviceSelectionStep);
    }
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
      window.sessionStorage.setItem('meetingStatus', '');
      return <AnonUserPostMeetingPage />;
    }

    return (
      <IntroContainer>
        <MediaErrorSnackbar error={mediaError} />
        {step === Steps.roomNameStep && (
          <WelcomeScreen
            name={name}
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
