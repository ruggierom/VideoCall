import React, { useState, ChangeEvent, FormEvent } from 'react';
import IntroContainer from '../IntroContainer/IntroContainer';
import { Typography, makeStyles, TextField, Grid, Button, InputLabel, Theme } from '@material-ui/core';
import { AlertPage } from 'twilio/lib/rest/monitor/v1/alert';
import firebase from 'firebase/app';
import 'firebase/firestore';

var hostUserName = 'Test';
var userLookupAlias = '';

const useStyles = makeStyles((theme: Theme) => ({
  logo: {
    textAlign: 'center',
  },
  textFieldContainer: {
    width: '100%',
  },
  continueButton: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      margin: '1em',
    },
  },
  anchor: {
    textDecoration: 'none',
  },
  content: {
    margin: '1em',
    textAlign: 'center',
  },
  imgDiv: {
    marginTop: '1em',
    textAlign: 'center',
  },
  submitButton: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

function onlyAlphabet(inputVal) {
  var patt = /^[a-zA-Z]+$/;
  if (patt.test(inputVal)) {
    return inputVal;
  } else {
    var txt = inputVal.slice(0, -1);
    return txt;
  }
}

export default function AnonUserPostMeetingPage() {
  const [userNameAvaialbe, setUserNameAvaialbe] = useState(true);
  const [helperText, sethelperText] = useState('');
  const [showButton, setShowButton] = useState(false);

  const classes = useStyles();

  const handleUserNameSearch = (event: ChangeEvent<HTMLInputElement>) => {
    var temp = onlyAlphabet(event.target.value);
    event.target.value = temp;
    userLookupAlias = temp;

    if (event.target.value.length == 0) {
      setUserNameAvaialbe(true);
      sethelperText('');
      setShowButton(false);
      return;
    }

    checkIfUsernameAvailable(userLookupAlias);
  };

  function checkIfUsernameAvailable(usernameToCheck: string) {
    try {
      const docRef = firebase
        .firestore()
        .collection('userNames')
        .doc(usernameToCheck.toLowerCase());

      docRef.get().then(doc => {
        if (doc.exists) {
          setUserNameAvaialbe(false);
          sethelperText('Username is not available!');
          setShowButton(false);
        } else {
          setUserNameAvaialbe(true);
          sethelperText('Username is available!');
          setShowButton(true);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  function renderForm() {
    console.log('userNameAvaialbe: ', userNameAvaialbe);

    return (
      <IntroContainer>
        <Typography variant="h5" className={classes.content}>
          <div className={classes.imgDiv}>
            Congratulations on your 1st coffeeBreak with {hostUserName}.{' '}
            <a className={classes.anchor} href="https://joincoffeebreak.com">
              (@testuser)
            </a>
          </div>
        </Typography>
        <Typography variant="h6" className={classes.content}>
          <div className={classes.content}>
            Download the app to join coffeeBreak
            <div className={classes.imgDiv}>
              <a href="https://joincoffeebreak.com" className={classes.anchor}>
                <img width="125px" src="../../../appStore.png"></img>
              </a>
            </div>
          </div>
          <div className={classes.content}>
            <div className={classes.imgDiv}>
              <div className={classes.textFieldContainer}>
                <div className={classes.content}>Check if username is available</div>
                <TextField
                  fullWidth
                  size="medium"
                  error={!userNameAvaialbe}
                  id="outlined-error-helper-text"
                  placeholder="You preferred username"
                  helperText={helperText}
                  onChange={handleUserNameSearch}
                  variant="outlined"
                />
              </div>

              {showButton && (
                <Button
                  variant="contained"
                  type="submit"
                  onClick={() => {
                    window.open('/login', '_self');
                  }}
                  color="primary"
                  className={classes.continueButton}
                >
                  Create account
                </Button>
              )}
            </div>
          </div>
        </Typography>
      </IntroContainer>
    );
  }
  return renderForm();
}
