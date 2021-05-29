import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAppState } from '../../state';
import { Typography, makeStyles, TextField, Grid, Button, InputLabel, Theme } from '@material-ui/core';
import IntroContainer from '../IntroContainer/IntroContainer';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  gutterBottom: {
    marginBottom: '1em',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '1.5em 0 3.5em',
    '& div:not(:last-child)': {
      marginRight: '1em',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '1.5em 0 2em',
    },
  },
  textFieldContainer: {
    width: '100%',
  },
  continueButton: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

const queryString = require('query-string');
const parsed = queryString.parse(window.location.search);

console.log('hostId: ', parsed.hostId);

export default function InvitePage({}) {
  const classes = useStyles();
  const { user } = useAppState();

  var { URLIdentity } = useParams();
  var { URLMeetingId } = useParams();

  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');

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
    }
  }, [user, URLMeetingId, URLIdentity]);

  console.log('userName: ', userName);
  console.log('userEmail: ', userEmail);
  console.log('roomName: ', roomName);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserEmail(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const url =
      'https://us-central1-coffebreak-a15f1.cloudfunctions.net/updateMeetingInfo' +
      '?meetingId=' +
      roomName +
      '&guestDisplayName=' +
      userName +
      '&guestEmail=' +
      userEmail +
      '&currentUid=' +
      parsed.currentUid;

    console.log('url: ', url);

    fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    alert('Invite Sent');
    window.location = 'https://joincoffeebreak.com';
  };

  function ValidateEmail(mail: string) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
      return true;
    }
    return false;
  }

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;
  return (
    <IntroContainer>
      <Typography variant="h5" className={classes.gutterBottom}>
        You have been invited to a coffeeBreak.
      </Typography>
      <Typography variant="h5" className={classes.gutterBottom}>
        Meeting time: {parsed.meetingTime}
      </Typography>
      <Typography variant="body1">
        {hasUsername
          ? "Enter the name of a room you'd like to join."
          : 'Enter your name and email so we can send you the invite'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <div className={classes.inputContainer}>
          {!hasUsername && (
            <div className={classes.textFieldContainer}>
              <InputLabel shrink htmlFor="input-user-name">
                Your Name
              </InputLabel>
              <TextField
                id="input-user-name"
                variant="outlined"
                fullWidth
                size="small"
                value={userName}
                onChange={handleNameChange}
              />
            </div>
          )}
          <div className={classes.textFieldContainer}>
            <InputLabel shrink htmlFor="input-user-email">
              Email
            </InputLabel>
            <TextField
              autoCapitalize="false"
              id="input-user-email"
              variant="outlined"
              value={userEmail}
              fullWidth
              size="small"
              onChange={handleEmailChange}
            />
          </div>
        </div>
        <Grid container justify="flex-end">
          <Button
            variant="contained"
            type="submit"
            color="primary"
            disabled={!userName || !ValidateEmail(userEmail)}
            className={classes.continueButton}
          >
            Continue
          </Button>
        </Grid>
      </form>
    </IntroContainer>
  );
}
