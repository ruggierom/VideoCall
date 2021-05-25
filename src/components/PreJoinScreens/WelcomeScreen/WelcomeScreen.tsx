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

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    maxHeight: '100%',
    overflow: 'auto',
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
  textFieldContainer: {
    width: '100%',
  },
  spacer: {
    marginTop: '8em',
    textAlign: 'center',
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
    textAlign: 'center',
  },
  listSubHeader: {
    margin: '1em',
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

  useEffect(() => {
    getUserMeetings();
  }, []);

  function getUserMeetings() {
    var temp = Array<firestore.DocumentData>();
    const db = firebase.firestore();
    const docRef = db.collection('userMeetings').doc(firebase.auth().currentUser?.uid);

    docRef
      .collection('meetings')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const temp2 = doc.data();

          if (!temp2['guestPhoto']) {
            temp2.guestPhoto = '';
          } else {
            console.log('ddd');
            console.log(temp2.guestPhoto);
          }

          temp.push(temp2);
        });
        setUserMeetings(temp);
      });
  }

  useEffect(() => {
    getUserMeetings();
  }, []);

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

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;
  const items = [];
  var count = 0;

  return (
    <>
      {isUserLoggedIn() && (
        <IntroContainer>
          <List
            subheader={
              <ListSubHeader className={classes.listSubHeader} component="div" id="nested-list-subheader">
                My coffeeBreaks
              </ListSubHeader>
            }
            className={classes.root}
          >
            {userMeetings.map(meeting => {
              return (
                <ListItem key={count++} className={classes.listItem}>
                  <ListItemAvatar>
                    <Avatar alt={meeting.guestDisplayName} src={meeting.guestPhoto}></Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={meeting.guestDisplayName} secondary={meeting.startDateTime} />
                </ListItem>
              );
            })}
          </List>
        </IntroContainer>
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
