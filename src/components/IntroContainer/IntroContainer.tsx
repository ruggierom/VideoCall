/*ABOUT
    background-color: #f76565;
TERMS
background-color: #00bfff;

Privacy
background-color: #00d38a;
*/

import React from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import Swoosh from './swoosh';
import VideoLogo from './VideoLogo';
import { useAppState } from '../../state';
import UserMenu from './UserMenu/UserMenu';
import { Link, useLocation } from 'react-router-dom';
import TwilioLogo from './TwilioLogo';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Terms from '../Terms/TermsScreen';
import About from '../About/AboutScreen';
import Privacy from '../Privacy/PrivacyScreen';

import { TransitionGroup, CSSTransition } from 'react-transition-group';

const useStyles = makeStyles((theme: Theme) => ({
    link: {
        textDecoration: 'none',
        display: 'flex',
        color: 'white',
        paddingLeft: '30px',
        paddingRight: '30px',
    },

    background: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgb(40, 42, 43)',
        height: '100%',
    },
    container: {
        position: 'relative',
        flex: '1',
        width: '888px',
    },
    innerContainer: {
        display: 'flex',
        width: '888px',
        height: '379px',
        borderRadius: '8px',
        boxShadow: '0px 2px 4px 0px rgba(40, 42, 43, 0.3)',
        overflow: 'hidden',
        position: 'relative',
        margin: 'auto',
        [theme.breakpoints.down('sm')]: {
            display: 'block',
            height: 'auto',
            width: 'calc(100% - 40px)',
            margin: 'auto',
            maxWidth: '400px',
        },
    },
    swooshContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: Swoosh,
        backgroundSize: 'cover',
        width: '296px',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            height: '100px',
            backgroundPositionY: '140px',
        },
    },
    logoContainer: {
        position: 'absolute',
        width: '210px',
        textAlign: 'center',
        [theme.breakpoints.down('sm')]: {
            display: 'flex',
            alignItems: 'center',
            width: '90%',
            textAlign: 'initial',
            '& svg': {
                height: '64px',
            },
        },
    },
    twilioLogo: {
        position: 'absolute',
        top: 10,
        left: 5,
        width: '40px',
    },
    footer: {
        position: 'fixed',
        bottom: 10,
        textAlign: 'center',
        paddingBottom: 25,
    },
    breadcrumbs: {
        position: 'fixed',
        bottom: 50,
        color: 'white',
        fontSize: '15px',
        textAlign: 'center',
        paddingBottom: 5,
    },
    footer2: {
        position: 'fixed',
        bottom: 0,
        color: 'white',
        fontSize: '10px',
        textAlign: 'center',
        paddingBottom: 5,
    },
    content: {
        background: 'white',
        width: '100%',
        padding: '4em',
        flex: 1,
        [theme.breakpoints.down('sm')]: {
            padding: '2em',
        },
    },
    title: {
        color: 'white',
        margin: '1em 0 0',
        [theme.breakpoints.down('sm')]: {
            margin: 0,
            fontSize: '1.1rem',
        },
    },
}));

const handleChange = (event, newValue) => {
    setValue(newValue);
};

interface IntroContainerProps {
    children: React.ReactNode;
}

const IntroContainer = (props: IntroContainerProps) => {
    const [value, setValue] = React.useState('recents');
    const [visible, setVisible] = React.useState(false);

    const classes = useStyles();
    const { user } = useAppState();
    const location = useLocation();
    const imgUrl = process.env.PUBLIC_URL + '/coffeeBreak.png';

    return (
        <div className={classes.background}>
            <div className={visible ? 'fadeOut' : 'fadeIn'}>
                {user && location.pathname !== '/login' && <UserMenu />}
                <a href="/welcome">
                    <img id="1" className={classes.twilioLogo} src={imgUrl}></img>
                </a>
                <div className={classes.container}>
                    <div className={classes.innerContainer}>
                        <div className={classes.swooshContainer}>
                            <div className={classes.logoContainer}>
                                <VideoLogo />
                                <Typography variant="h6" className={classes.title}>
                                    coffeeBreaks
                                </Typography>
                            </div>
                        </div>
                        <div className={classes.content}>{props.children}</div>
                    </div>
                </div>
            </div>
            <Breadcrumbs className={classes.breadcrumbs} aria-label="breadcrumb">
                <Link to="Privacy" color="inherit" className={classes.link}>
                    Privacy
                </Link>
                <Link to="Terms" className={classes.link}>
                    Terms
                </Link>
                <Link to="About" className={classes.link}>
                    About
                </Link>
            </Breadcrumbs>
            <Typography className={classes.footer2}>© 2021 COFFEEBREAK VENTURES INC.</Typography>
        </div>
    );
};

export default IntroContainer;
