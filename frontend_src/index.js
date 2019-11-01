import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col, Card, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { Slideshow, Slide } from './components/Slideshow.jsx';
import { App } from './components/App.jsx';
import { Tweet } from './components/Tweet.jsx';
import { AtlanticTweetSlide, TweetCopySlide } from './components/AppSlides.jsx';
import { NewSampleAccountPicker } from './components/SampleAccountsPicker.jsx';

function getLastAppUseValue() {
    let last_app_use = window.APP_VARS.last_app_use;
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
    return window.APP_VARS.sample_accounts;
}

function getErrorMessage() {
    return window.APP_VARS.error_message;
}

function getRecaptchaSiteKey() {
    return window.APP_VARS.recaptcha_site_key;
}

const TestSlideContent = (props) => {
    return (
        <div>
            <h1>Here's Some Slide Content! # {props.slideNo}</h1>
            <Button variant="primary" onClick={props.onSlideFinish}>Finish Slide</Button>
        </div>
    );
};

const AppSlide = (props) => {
    return (
        <App
            secondsTilNextAppAvail={props.secondsTilNextAppAvail} 
            sampleAccounts={props.sampleAccounts} 
            errorMessage={props.errorMessage}
            captchaSiteKey={props.captchaSiteKey}
        />
    );
};

const TestSlideshowApp = (props) => {
    let initialSlideIndex = props.errorMessage ? 3 : 0; // skip to the last slide if there's an error message
    return (
        <Slideshow initialSlideIndex={initialSlideIndex} inAnimation="animated faster zoomIn" outAnimation="animated faster zoomOut" waitAnimation="animated-wiggle" waitAnimation="none">
            <Slide waitAnimation="none">
                <App
                    secondsTilNextAppAvail={props.secondsTilNextAppAvail} 
                    sampleAccounts={props.sampleAccounts} 
                    errorMessage={props.errorMessage}
                    captchaSiteKey={props.captchaSiteKey}
                />
            </Slide>
            <Slide>
                <NewSampleAccountPicker accounts={props.sampleAccounts} />
            </Slide>
            <Slide>
                <TweetCopySlide />
            </Slide>
            <Slide>
                <AtlanticTweetSlide />
            </Slide>
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
