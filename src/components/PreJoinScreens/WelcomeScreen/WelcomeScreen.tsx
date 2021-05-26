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
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';
import { useWindowScroll } from 'react-use';

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
    [theme.breakpoints.down('sm')]: {},
    width: '10em',
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

  useEffect(() => {
    if (isUserLoggedIn()) {
      getUserMeetings();
    }
  }, []);

  function gotoMeeting(meeting: firestore.DocumentData) {
    const min = meeting.startDateTimeAsDate.toMillis() - 5 * 60 * 1000;
    const max = meeting.startDateTimeAsDate.toMillis() + 40 * 60 * 1000;
    const nowInMil = Date.now();

    if (nowInMil >= min && nowInMil <= max) {
      window.open(meeting.guestMeetingUrl, '_self');
    } else {
      setError(true);
    }
  }

  function getUserMeetings() {
    var temp = Array<firestore.DocumentData>();
    const db = firebase.firestore();
    const docRef = db.collection('userMeetings').doc(firebase.auth().currentUser?.uid);

    docRef
      .collection('meetings')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const d = doc.data()['startDateTimeAsDate'];

          if (d.toMillis() > Date.now()) {
            const temp2 = doc.data();
            console.log(temp2);

            if (!temp2['guestPhoto']) {
              temp2.guestPhoto = '';
            } else {
              console.log(temp2.guestPhoto);
            }

            //if (temp2.status === 'Accepted') {
            temp.push(temp2);
            //}
          }
        });
        setUserMeetings(temp);
      });
  }

  function getDisplayName(meeting: firestore.DocumentData) {
    if (meeting.guestUid == firebase.auth().currentUser?.uid) {
      return meeting.hostDisplayName;
    } else {
      return meeting.guestDisplayName;
    }
  }

  function getPhoto(meeting: firestore.DocumentData) {
    if (meeting.guestUid == firebase.auth().currentUser?.uid) {
      return meeting.hostPhoto;
    } else {
      return meeting.guestPhoto;
    }
  }

  function isUserLoggedIn() {
    var user = firebase.auth().currentUser;

    if (user != null) {
      return true;
    } else {
      return false;
    }
  }

  const classes = useStyles();
  const { user } = useAppState();

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;
  const items = [];
  var count = 0;

  return (
    <>
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

      {isUserLoggedIn() && userMeetings.length === 0 && (
        <div>
          <Typography variant="h5" className={classes.displayText}>
            <div className={classes.content}>No coffeeBreaks scheduled.</div>
            <div className={classes.content}>Go to the app to schedule one</div>
          </Typography>
        </div>
      )}

      {userMeetings.length > 0 && (
        <div>
          <List
            subheader={
              <ListSubHeader className={classes.listSubHeader} component="div" id="nested-list-subheader">
                Upcoming coffeeBreaks
              </ListSubHeader>
            }
            className={classes.root}
          >
            <div className={classes.spacer}></div>
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
        </div>
      )}

      {!isUserLoggedIn() && (
        <IntroContainer>
          <Typography variant="h5" className={classes.displayText}>
            <div className={classes.content}>
              Welcome to coffeeBreak
              <div>More stuff here...</div>
            </div>
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

            <div className={classes.spacer}>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                onClick={() => {
                  window.open('/login', '_self');
                }}
                className={classes.continueButton}
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
