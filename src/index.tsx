import React from 'react';
import ReactDOM from 'react-dom';

import { CssBaseline } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';

import App from './App';
import AppStateProvider, { useAppState } from './state';
import { BrowserRouter as Router, Link, Redirect, Route, Switch } from 'react-router-dom';
import ErrorDialog from './components/ErrorDialog/ErrorDialog';
import LoginPage from './components/LoginPage/LoginPage';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import theme from './theme';
import './types';
import { ChatProvider } from './components/ChatProvider';
import { VideoProvider } from './components/VideoProvider';
import useConnectionOptions from './utils/useConnectionOptions/useConnectionOptions';
import UnsupportedBrowserWarning from './components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import InvitePage from './components/InvitePage/InvitePage';
import WelcomeScreen from './components/PreJoinScreens/WelcomeScreen/WelcomeScreen';
import Privacy from './components/Privacy/PrivacyScreen';
import Terms from './components/Terms/TermsScreen';
import About from './components/About/AboutScreen';
import UserPostMeetingPage from './components/PostMeeting/PostMeeting';

const VideoApp = () => {
    const { error, setError } = useAppState();
    const connectionOptions = useConnectionOptions();

    return (
        <VideoProvider options={connectionOptions} onError={setError}>
            <ErrorDialog dismissError={() => setError(null)} error={error} />
            <ChatProvider>
                <App />
            </ChatProvider>
        </VideoProvider>
    );
};

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <UnsupportedBrowserWarning>
            <Router>
                <AppStateProvider>
                    <Switch>
                        <Route path="/privacy">
                            <Privacy />
                        </Route>
                        <Route path="/postmeeting">
                            <UserPostMeetingPage />
                        </Route>
                        <Route path="/terms">
                            <Terms />
                        </Route>
                        <Route path="/about">
                            <About />
                        </Route>
                        <Route path="/welcome">
                            <WelcomeScreen />
                        </Route>
                        <Route path="/meetingId/:URLMeetingId/identity/:URLIdentity">
                            <VideoApp />
                        </Route>
                        <Route path="/login">
                            <LoginPage />
                        </Route>
                        <Route path="/invite/meetingId/:URLMeetingId/identity/:URLIdentity">
                            <InvitePage />
                        </Route>
                        <Route path="/">
                            <WelcomeScreen />
                        </Route>
                    </Switch>
                </AppStateProvider>
            </Router>
        </UnsupportedBrowserWarning>
    </MuiThemeProvider>,
    document.getElementById('root')
);

if (document.body.style.overflow !== 'hidden') {
    document.body.style.overflow = 'hidden';
} else {
    document.body.style.overflow = 'scroll';
}
