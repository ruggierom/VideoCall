import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useAppState } from '../../state';
import IntroContainer from '../IntroContainer/IntroContainer';
import { Typography, makeStyles, TextField, Grid, Button, InputLabel, Theme } from '@material-ui/core';
import { AlertPage } from 'twilio/lib/rest/monitor/v1/alert';
import firebase from 'firebase/app';
import 'firebase/firestore';

var otherUserName = 'Test';
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
            margin: '.5em',
        },
    },
    anchor: {
        textDecoration: 'none',
    },
    content: {
        textAlign: 'center',
    },
    imgDiv: {
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

export default function UserPostMeetingPage() {
    const [userNameAvaialbe, setUserNameAvaialbe] = useState(true);
    const [helperText, sethelperText] = useState('');
    const [showButton, setShowButton] = useState(false);
    const { firebaseUser } = useAppState();

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

    window.onbeforeunload = event => {
        window.sessionStorage.setItem('meetingStatus', '');
        window.sessionStorage.setItem('URLIdentity', '');
        window.sessionStorage.setItem('URLMeetingId', '');
        // Cancel the event
        e.preventDefault();
        if (e) {
            e.returnValue = ''; // Legacy method for cross browser support
        }
        return ''; // Legacy method for cross browser support
    };

    function getMeetingInfo() {
        const db = firebase.firestore();
        const docRef = db.collection('meetings').doc(firebase.auth().currentUser?.uid);

        console.log('About to call DB');
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

                        //if (temp2.status === 'Accepted') {
                        temp.push(temp2);
                    }
                    //}
                });
                setUserMeetings(temp);
            });
    }

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

    if (firebaseUser) {
        return renderUserForm();
    } else {
        return renderAnonForm();
    }

    function renderAnonForm() {
        console.log('userNameAvaialbe: ', userNameAvaialbe);

        return (
            <div className={classes.fadeIn}>
                <IntroContainer>
                    <Typography variant="h5" className={classes.content}>
                        Congratulations on your 1st coffeeBreak with {otherUserName}.{' '}
                        <a className={classes.anchor} href="https://joincoffeebreak.com">
                            (@testuser)
                        </a>
                    </Typography>
                    <Typography variant="h6" className={classes.content}>
                        Download the app to join coffeeBreak
                        <div className={classes.imgDiv}>
                            <a href="https://joincoffeebreak.com" className={classes.anchor}>
                                <img width="125px" src="../../../appStore.png"></img>
                            </a>
                        </div>
                        <div className={classes.content}>
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
                    </Typography>
                </IntroContainer>
            </div>
        );
    }

    function renderUserForm() {
        console.log('userNameAvaialbe: ', userNameAvaialbe);

        return (
            <IntroContainer>
                <div>
                    <div className={classes.imgDiv}>
                        Congratulations on another coffeeBreak with {otherUserName}.{' '}
                        <a className={classes.anchor} href="https://joincoffeebreak.com">
                            (@testuser)
                        </a>
                    </div>
                </div>
            </IntroContainer>
        );
    }
}
