import { Redirect } from 'react-router-dom';
import firebase from 'firebase';
import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { useAppState } from '../../state';

import './LoginPage.scss';

export default function LoginPage() {
    const { user, isAuthReady } = useAppState();

    if (user) {
        return <Redirect to="/welcome"></Redirect>;
    }

    if (!isAuthReady) {
        return null;
    }

    const uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function() {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                var user = firebase.auth().currentUser;
                var name, email, photoUrl, uid, emailVerified;

                if (user != null) {
                    name = user.displayName;
                    email = user.email;
                    photoUrl = user.photoURL;
                    emailVerified = user.emailVerified;
                    uid = user.uid; // The user's ID, unique to the Firebase project. Do NOT use
                    // this value to authenticate with your backend server, if
                    // you have one. Use User.getToken() instead.

                    //get toom name and display name from db
                    console.log(name);
                }

                return true;
            },
        },
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
        signInSuccessUrl: '/',
        // We will display Google and Facebook as auth providers.
        signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID, firebase.auth.EmailAuthProvider.PROVIDER_ID],
    };

    return (
        <div className="login-page">
            <div className="modal">
                <div className="modal-brand"></div>
                <div className="modal-content">
                    <h5>Sign in or Create account</h5>
                    <div>
                        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                    </div>
                </div>
            </div>
        </div>
    );
}
