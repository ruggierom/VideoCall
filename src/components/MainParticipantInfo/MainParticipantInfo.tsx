import React from 'react';
import clsx from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { LocalAudioTrack, LocalVideoTrack, Participant, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';
import AvatarIcon from '../../icons/AvatarIcon';
import Typography from '@material-ui/core/Typography';
import { useWindowSize } from 'react-use';
import useIsTrackSwitchedOff from '../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff';
import usePublications from '../../hooks/usePublications/usePublications';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useTrack from '../../hooks/useTrack/useTrack';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useParticipantIsReconnecting from '../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';
import AudioLevelIndicator from '../AudioLevelIndicator/AudioLevelIndicator';
import Countdown, { CountdownRenderProps } from 'react-countdown';
import Confetti from 'react-confetti';

const meetingDuration = 90000; //15 min
const MeetingNotStarted = () => <div>Waiting for other person to join</div>;
const TwoMinWarn = () => <div className={clsx(useStyles().twoMinWarning)}>{'Less than two minutes remaining!'}</div>;
var showRemainingTime: Boolean = true;
var showTwoMinWarning: Boolean = false;
var showWaiting: Boolean = true;

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes blinker': {
    '50%': {
      opacity: 0,
    },
  },
  debug: {
    marginTop: '60px',
    color: 'white',
  },
  twoMinWarning: {
    fontFamily: 'inherit',
    animation: '$blinker 2s linear infinite',
    color: 'white',
    fontStyle: 'bold',
    position: 'absolute',
    bottom: '10px',
    width: '100%',
    textAlign: 'center',
    fontSize: '2.0em',
  },
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
    display: 'flex',
    width: '19em',
    height: '5em',
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
  const { width, height } = useWindowSize();
  const classes = useStyles();
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;
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
  var startTime = 0;

  function shutDown() {
    const handle = setTimeout(() => {
      try {
        room?.disconnect();
      } catch (e) {}
      clearStartTime();
    }, 8000);
  }

  function startIfBothConnected() {
    console.log('roomname: ' + room?.name);
    console.log('localParticipant: ' + room?.localParticipant);
    try {
      if (room?.participants.entries().next().value != undefined) {
        if (
          room?.participants.entries().next().value[1].state === 'connected' &&
          localParticipant.state === 'connected'
        ) {
          //if (room?.participants && localParticipant.state === 'connected') {
          setStartTime();
          showWaiting = false;
        } else {
          showWaiting = true;
          console.log('remote: ', room?.participants.entries().next().value[1].state);
          console.log('local: ', localParticipant.state);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  startIfBothConnected();

  function setStartTime() {
    const temp = window.localStorage.getItem(localParticipant.identity + room?.name);
    if (temp != null) {
      startTime = Number(temp);
      console.log('got time from local storage');
    } else {
      startTime = Date.now();
      console.log('reset time');
      window.localStorage.setItem(localParticipant.identity + room?.name, startTime.toString());
    }
  }

  function clearStartTime() {
    window.localStorage.clear();
  }

  function formatTime(minutes: number, seconds: number) {
    var strMin = '';
    var strSec = '';

    if (minutes < 10) {
      strMin = '0' + minutes.toString();
    } else {
      strMin = minutes.toString();
    }

    if (seconds < 10) {
      strSec = '0' + seconds.toString();
    } else {
      strSec = seconds.toString();
    }

    return strMin + ':' + strSec;
  }

  const renderer = ({ api, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    if (minutes <= 1 && minutes > 0 && seconds > 0) {
      showTwoMinWarning = true;
      console.log('2 min warn');
      return (
        <span>
          Remaining time: {formatTime(minutes, seconds)}{' '}
          <span>
            <TwoMinWarn />
          </span>{' '}
        </span>
      );
    }

    if (startTime > 0 && minutes > 0 && seconds > 0) {
      return <span>Remaining time: {formatTime(minutes, seconds)}</span>;
    }

    if (minutes === 0 && seconds === 0 && completed) {
      showRemainingTime = false;
      return (
        <span>
          Another successful coffeeBreak!
          <Confetti
            width={width}
            height={height}
            numberOfPieces={800}
            opacity={0.5}
            initialVelocityX={8}
            initialVelocityY={20}
          />
          {shutDown()}
        </span>
      );
    }
    return <span>Remaining time: {formatTime(minutes, seconds)}</span>;
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
          <img width="50px" height="50px" src="../../../coffeeBreak.png"></img>
          <AudioLevelIndicator audioTrack={audioTrack} />

          <Typography component={'span'} variant="body1" color="inherit">
            {participant.identity}
            <div>{isLocal && '(You)'}</div>

            {showWaiting && <MeetingNotStarted />}

            {showRemainingTime && startTime > 0 && (
              <div style={{ fontFamily: 'inherit', marginTop: '.25em', marginBottom: '.75em' }}>
                <Countdown date={startTime + meetingDuration} renderer={renderer} />
              </div>
            )}
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
          <Typography component={'span'} variant="body1" style={{ color: 'white' }}>
            Reconnecting...
          </Typography>
        </div>
      )}
      {children}
    </div>
  );
}
