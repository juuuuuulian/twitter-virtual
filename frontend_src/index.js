import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col, Card, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { Slideshow, Slide } from './components/Slideshow.jsx';
import { App } from './components/App.jsx';
import { AtlanticTweetSlide, TweetCopySlide, FeedTweetCopySlide, AppSlide } from './components/Slides.jsx';

function getAppVars() {
    const appVars = window.APP_VARS;
    if (appVars == null) {
        console.warn('no window.APP_VARS available');
        return {};
    }
}

function getLastAppUseValue() {
    let last_app_use = getAppVars().last_app_use;
    if (last_app_use == null)
        return null;
    return new Date(last_app_use);
}

function getSecondsTilNextAppAvail() {
    var last_app_use = getLastAppUseValue();
    if (last_app_use == null)
        return 0;
    var ms_in_day = 60 * 60 * 24 * 1000;
    var next_available_use = new Date(last_app_use.getTime() + ms_in_day);
    var now = new Date();

    if (now.getTime() > next_available_use.getTime())
        return 0;

    return Math.floor((next_available_use.getTime() - now.getTime()) / 1000);
}

function getSampleAccounts() {
    return getAppVars().sample_accounts;
}

function getErrorMessage() {
    return getAppVars().error_message;
}

function getRecaptchaSiteKey() {
    return getAppVars().recaptcha_site_key;
}

const TestSlideshowApp = (props) => {
    let initialSlideIndex = props.errorMessage ? 2 : 0; // skip to the last slide if there's an error message
    return (
        <Slideshow 
            initialSlideIndex={initialSlideIndex} 
            inAnimation="animated faster zoomIn" 
            outAnimation="animated faster zoomOut" 
            waitAnimation="animated-wiggle"
            waitAnimation="none"
        >
            <TweetCopySlide />
            <FeedTweetCopySlide />
            {/*<AtlanticTweetSlide />*/}
            <AppSlide 
                secondsTilNextAppAvail={props.secondsTilNextAppAvail} 
                sampleAccounts={props.sampleAccounts} 
                errorMessage={props.errorMessage}
                captchaSiteKey={props.captchaSiteKey}
            />
        </Slideshow>
    );
};


function initApp() {
    ReactDOM.render(
        <TestSlideshowApp 
            secondsTilNextAppAvail={getSecondsTilNextAppAvail()} 
            sampleAccounts={getSampleAccounts()} 
            errorMessage={getErrorMessage()}
            captchaSiteKey={getRecaptchaSiteKey()}
        />,
        document.getElementById('react-container')
    );
}

window.addEventListener('DOMContentLoaded', (event) => {
    initApp()
});
