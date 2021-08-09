import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useAppState } from '../../state';
import IntroContainer from '../IntroContainer/IntroContainer';
import { Typography, makeStyles, TextField, Grid, Button, InputLabel, Theme } from '@material-ui/core';
import { AlertPage } from 'twilio/lib/rest/monitor/v1/alert';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { Comment } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { useSetState } from 'react-use';

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

export default function UserPostMeetingPage() {
    const [userNameAvaialbe, setUserNameAvaialbe] = useState(true);
    const [userHandle, setUserHandle] = useState('');
    const [helperText, sethelperText] = useState('');
    const [showButton, setShowButton] = useState(false);
    const { firebaseUser } = useAppState();

    const classes = useStyles();

    const imageClick = () => {
        alert('Email invite@joincoffeebreak.com to get early access to the app!');
    };

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        var patt = /^[0-9a-zA-Z][\b]+$/;
        var temp = event.target.value;
        const isValid = /^[0-9a-zA-Z]+$/.test(temp);

        if (isValid || temp === '') {
            setUserHandle(temp);
            handleUserNameSearch(temp);
        }
    };

    const handleUserNameSearch = (val: String) => {
        if (val.length == 0) {
            setUserNameAvaialbe(true);
            sethelperText('');
            setShowButton(false);

            return;
        }

        checkIfUsernameAvailable(val);
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

    function checkIfUsernameAvailable(val: String) {
        try {
            console.log('checking: ', '@' + val.toLocaleLowerCase());
            const docRef = firebase
                .firestore()
                .collection('userNames')
                .doc('@' + val.toLocaleLowerCase());

            docRef.get().then(doc => {
                if (doc.exists) {
                    setUserNameAvaialbe(false);
                    sethelperText('Username is not available!');
                    setShowButton(false);
                } else {
                    setUserHandle(val);
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
            <IntroContainer>
                <Typography variant="h5" className={classes.content}>
                    Congratulations on your coffeeBreak!
                </Typography>
                <p></p>
                <Typography variant="h6" className={classes.content}>
                    <div className={classes.content}>
                        Download the app to join
                        <div className={classes.imgDiv}>
                            <img onClick={() => imageClick()} width="125px" src="../../../../appStore.png"></img>
                        </div>
                    </div>
                    <p></p>
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
                                onChange={handleInput}
                                variant="outlined"
                                value={userHandle}
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
        );
    }

    function renderUserForm() {
        console.log('userNameAvaialbe: ', userNameAvaialbe);

        return (
            <IntroContainer>
                <div>
                    <Typography variant="h5" className={classes.content}>
                        Congratulations on a successful coffeeBreak!
                    </Typography>
                </div>
            </IntroContainer>
        );
    }
}
