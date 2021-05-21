import { useCallback, useEffect, useState } from 'react';
import 'firebase/auth';
import firebase, { auth } from 'firebase/app';
import { Console } from 'node:console';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export default function useFirebaseAuth() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const getToken = useCallback(
    async (identity: string, meetingId: string) => {
      const headers = new window.Headers();
      var endpoint = process.env.REACT_APP_TOKEN_ENDPOINT || '/token';

      if (user == null) {
        console.log('anonymous user');
        endpoint += '?meetingId=' + meetingId + '&identity=' + identity;
      } else {
        const idToken = await user!.getIdToken();
        headers.set('Authorization', idToken);
        headers.set('accept', 'application/json');
        headers.set('Access-Control-Allow-Origin', '*');

        var meetingDisplayName = '';
        var names = user.displayName?.split(' ');

        if (names != null && names?.length > 1) {
          meetingDisplayName = names[0] + ' ' + names[1].substring(0, 1) + '.';
        } else {
          meetingDisplayName = identity;
        }
        endpoint += '?meetingId=' + meetingId + '&identity=' + encodeURIComponent(meetingDisplayName);
      }

      return fetch(endpoint, {
        //mode: 'no-cors',
        method: 'GET',
        headers,
      }).then(res => res.text());
    },
    [user]
  );

  useEffect(() => {
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged(newUser => {
      setUser(newUser);
      setIsAuthReady(true);
    });
  }, []);

  const googleSignIn = useCallback(() => {
    const provider = new firebase.auth.GoogleAuthProvider();

    provider.addScope('https://www.googleapis.com/auth/plus.login');

    return firebase
      .auth()
      .signInWithPopup(provider)
      .then(newUser => {
        setUser(newUser.user);
      });
  }, []);

  const emailSignIn = useCallback(() => {
    const provider = new firebase.auth.EmailAuthProvider();

    return firebase
      .auth()
      .signInWithPopup(provider)
      .then(newUser => {
        setUser(newUser.user);
      });
  }, []);
  const signOut = useCallback(() => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(null);
      });
  }, []);

  return { user, signIn: emailSignIn, googleSignIn, signOut, isAuthReady, getToken };
}
