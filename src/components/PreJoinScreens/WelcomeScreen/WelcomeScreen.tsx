import React, { ChangeEvent, useState, FormEvent, useEffect } from 'react';
import IntroContainer from '../../IntroContainer/IntroContainer';
import { Typography, makeStyles, TextField, Grid, Button, InputLabel, Theme } from '@material-ui/core';
import { useAppState } from '../../../state';
import firebase, { firestore } from 'firebase/app';
import 'firebase/firestore';
import List from '@material-ui/core/List';
import ListSubHeader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { app } from 'firebase-admin';
import { useLocation, useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    maxHeight: '350px',
    overflow: 'auto',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  spacer: {
    margin: '100px',
    textAlign: 'center',
  },
  list: {
    maxHeight: '100px',
  },
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
  displayText: {},
  textFieldContainer: {
    width: '100%',
  },
  continueButton: {
    marginTop: '2em',
    width: '150px',
  },
  logo: {
    textAlign: 'center',
  },
  anchor: {
    textDecoration: 'none',
  },
  content: {
    margin: '1em',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  listSubHeader: {
    margin: '.5em',
    textAlign: 'center',
    fontSize: '1.5em',
  },
  imgDiv: {
    marginTop: '1em',
    textAlign: 'center',
  },
  listSubheader: {
    marginTop: '1em',
    fontSize: '2em',
    textAlign: 'center',
  },
  listItem: {
    width: '90%',
    marginLeft: '1em',
    fontSize: '2em',
  },
  submitButton: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

export default function WelcomeScreen() {
  const [userMeetings, setUserMeetings] = useState(Array<firestore.DocumentData>());
  const [error, setError] = React.useState(false);
  const [readyToShow, setReadyToShow] = React.useState(false);
  const { firebaseUser } = useAppState();

  var temp = Array<firestore.DocumentData>();

  console.log('About to call DB');
  if (firebaseUser && firebase.auth().currentUser?.uid) {
    const db = firebase.firestore();
    const docRef = db.collection('userMeetings').doc(firebase.auth().currentUser?.uid);

    docRef
      .collection('meetings')
      .get()
      .then(querySnapshot => {
        setReadyToShow(true);
        querySnapshot.forEach(doc => {
          const d = doc.data()['startDateTimeAsDate'];

          const min = d.toMillis() - 5 * 60 * 1000;
          const max = d.toMillis() + 15 * 60 * 1000;
          const nowInMil = Date.now();

          if (nowInMil >= min && nowInMil <= max) {
            const temp2 = doc.data();
            console.log(temp2);

            if (!temp2['guestPhoto']) {
              temp2.guestPhoto = '';
            } else {
              console.log(temp2.guestPhoto);
            }
            temp.push(temp2);
          }
        });

        if (temp.length > 0) {
          setUserMeetings(temp);
        }
      });
  }

  function gotoMeeting(meeting: firestore.DocumentData) {
    const min = meeting.startDateTimeAsDate.toMillis() - 5 * 60 * 1000;
    const max = meeting.startDateTimeAsDate.toMillis() + 15 * 60 * 1000;
    const nowInMil = Date.now();

    if (nowInMil >= min && nowInMil <= max) {
      if (firebase.auth().currentUser?.uid) {
        if (meeting.guestUid == firebase.auth().currentUser?.uid) {
          window.open(meeting.guestMeetingUrl, '_self');
        } else {
          window.open(meeting.hostMeetingUrl, '_self');
        }
      }
    } else {
      setError(true);
    }
  }

  const classes = useStyles();
  const { user } = useAppState();
  const history = useHistory();

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;
  const items = [];
  var count = 0;

  return (
    <>
      {firebaseUser && userMeetings.length > 0 && readyToShow && (
        <IntroContainer>
          <div>
            {' '}
            {error && (
              <Alert
                severity="info"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setError(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                It's too early to join. Please come back within 5 minutes of meeting start time.
              </Alert>
            )}
          </div>
          <List
            subheader={
              <ListSubHeader className={classes.listSubHeader} component="span" id="nested-list-subheader">
                Upcoming coffeeBreaks
              </ListSubHeader>
            }
            className={classes.root}
          >
            {userMeetings.map(meeting => {
              return (
                <ListItem button onClick={() => gotoMeeting(meeting)} key={count++} className={classes.listItem}>
                  <ListItemAvatar>
                    <Avatar alt={getDisplayName(meeting)} src={getPhoto(meeting)}></Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={getDisplayName(meeting)} secondary={meeting.startDateTime} />
                </ListItem>
              );
            })}
          </List>
        </IntroContainer>
      )}

      {firebaseUser && userMeetings.length === 0 && readyToShow && (
        <IntroContainer>
          <Typography variant="h5" className={classes.displayText}>
            <div className={classes.content}>
              No coffeeBreaks scheduled.
              <br />
              Go to the <a href="https://coffeebreaks.page.link/TG78">app</a> to schedule one!
            </div>
          </Typography>
        </IntroContainer>
      )}

      {!firebaseUser && userMeetings.length === 0 && (
        <IntroContainer>
          <Typography variant="h5" className={classes.displayText}>
            <div className={classes.content}>Welcome to coffeeBreak</div>
            <div className={classes.content}></div>
          </Typography>

          <Typography variant="h6" className={classes.displayText}>
            <div className={classes.content}>
              Download the app to join
              <div className={classes.imgDiv}>
                <a href="https://joincoffeebreak.com" className={classes.anchor}>
                  <img width="125px" src="../../../appStore.png"></img>
                </a>
              </div>
            </div>

            <div className={classes.content}>
              <Button
                className={classes.continueButton}
                variant="contained"
                type="submit"
                color="primary"
                onClick={() => {
                  history.replace('/login');
                }}
              >
                Login
              </Button>
            </div>
          </Typography>
        </IntroContainer>
      )}
    </>
  );
}
