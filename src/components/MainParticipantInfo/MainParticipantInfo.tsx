import React from 'react';
import clsx from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { LocalAudioTrack, LocalVideoTrack, Participant, RemoteAudioTrack, RemoteVideoTrack, Room } from 'twilio-video';
import AvatarIcon from '../../icons/AvatarIcon';
import Typography from '@material-ui/core/Typography';

import useIsTrackSwitchedOff from '../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff';
import usePublications from '../../hooks/usePublications/usePublications';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useTrack from '../../hooks/useTrack/useTrack';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useParticipantIsReconnecting from '../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';
import AudioLevelIndicator from '../AudioLevelIndicator/AudioLevelIndicator';
import Countdown, { zeroPad, CountdownRenderProps } from 'react-countdown';
import ControlledCountdown from '../ControlledCountdown/ControlledCountdown';
import CountdownApi from '../ControlledCountdown/CountdownApi';
import { now } from 'd3-timer';
import { connected, disconnect } from 'process';
import { start } from 'repl';

const Text = require('react-text');
const meetingDuration = 900000;
// Random component
const Completionist = () => <span>Disconnecting</span>;
const TwoMinWarning = () => <span>Only 2 minutes left!</span>;
const MeetingNotStarted = () => <span>Meeting not yet started</span>;
var meetingStarted = false;

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  identity: {
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: '0.1em 1em .1em 0',
    fontSize: '1.2em',
    display: 'inline-flex',
    '& svg': {
      marginLeft: '0.3em',
    },
  },
  infoContainer: {
    position: 'absolute',
    zIndex: 2,
    height: '100%',
    width: '100%',
  },
  reconnectingContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(40, 42, 43, 0.75)',
    zIndex: 1,
  },
  fullWidth: {
    gridArea: '1 / 1 / 2 / 3',
    [theme.breakpoints.down('sm')]: {
      gridArea: '1 / 1 / 3 / 3',
    },
  },
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'black',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    '& svg': {
      transform: 'scale(2)',
    },
  },
}));

interface MainParticipantInfoProps {
  participant: Participant;
  children: React.ReactNode;
}

export default function MainParticipantInfo({ participant, children }: MainParticipantInfoProps) {
  const countDown = React.createRef();
  const classes = useStyles();
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;

  var startTime = Number(window.localStorage.getItem('startTime'));
  setStartTime();

  if (room?.participants.size === 1 && room.localParticipant) {
    meetingStarted = true;
  }
  const isLocal = localParticipant === participant;

  const screenShareParticipant = useScreenShareParticipant();
  const isRemoteParticipantScreenSharing = screenShareParticipant && screenShareParticipant !== localParticipant;

  const publications = usePublications(participant);
  const videoPublication = publications.find(p => p.trackName.includes('camera'));

  const screenSharePublication = publications.find(p => p.trackName.includes('screen'));

  const videoTrack = useTrack(screenSharePublication || videoPublication);
  const isVideoEnabled = Boolean(videoTrack);

  const audioPublication = publications.find(p => p.kind === 'audio');
  const audioTrack = useTrack(audioPublication) as LocalAudioTrack | RemoteAudioTrack | undefined;

  const isVideoSwitchedOff = useIsTrackSwitchedOff(videoTrack as LocalVideoTrack | RemoteVideoTrack);
  const isParticipantReconnecting = useParticipantIsReconnecting(participant);

  function setStartTime() {
    if (startTime === 0) {
      if (room?.participants.size === 1 && room.localParticipant) {
        startTime = Date.now();
        window.localStorage.setItem('startTime', String(startTime));
        meetingStarted = true;
      } else {
        startTime = 0;
        window.localStorage.setItem('startTime', '');
        meetingStarted = false;
      }
    }

    //meeting should be over by now so blank out start time
    //30 min
    //Posssible startTime did not get reset
    if (Date.now() > startTime + meetingDuration) {
      //startTime = 0;
    }
  }

  // Renderer callback with condition
  const renderer = ({ api, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    if (!meetingStarted) {
      setStartTime();
    }

    if (startTime === 0) {
      return <MeetingNotStarted />;
    }

    if (meetingStarted && !completed) {
      if (!api.isStarted) {
        api.start();
      }
      // Render a countdown
      return (
        <span>
          {hours}:{minutes}:{seconds}
        </span>
      );
    }

    if (meetingStarted && !completed && minutes <= 1) {
      return (
        <span>
          {hours}:{minutes}:{seconds}
          <p></p>
          <TwoMinWarning />
        </span>
      );
    }

    if (meetingStarted && completed) {
      if (startTime + meetingDuration < Date.now()) {
        room?.disconnect();
        window.localStorage.setItem('startTime', '');
        console.log('bye bye');
        return <Completionist />;
      }
    }

    return <MeetingNotStarted />;
  };

  return (
    <div
      data-cy-main-participant
      data-cy-participant={participant.identity}
      className={clsx(classes.container, {
        [classes.fullWidth]: !isRemoteParticipantScreenSharing,
      })}
    >
      <div className={classes.infoContainer}>
        <div className={classes.identity}>
          <img width="50px" height="50px" src="../../coffeeBreak.png"></img>
          <AudioLevelIndicator audioTrack={audioTrack} />
          <Typography variant="body1" color="inherit">
            {participant.identity}

            {isLocal && '(You)'}
            <pre style={{ fontFamily: 'inherit', marginTop: '.25em', marginBottom: '.75em' }}>
              Remaining time: <Countdown autoStart={false} date={startTime + meetingDuration} renderer={renderer} />
            </pre>
          </Typography>
        </div>
      </div>
      {(!isVideoEnabled || isVideoSwitchedOff) && (
        <div className={classes.avatarContainer}>
          <AvatarIcon />
        </div>
      )}

      {isParticipantReconnecting && (
        <div className={classes.reconnectingContainer}>
          <Typography variant="body1" style={{ color: 'white' }}>
            Reconnecting...
          </Typography>
        </div>
      )}
      {children}
    </div>
  );
}
