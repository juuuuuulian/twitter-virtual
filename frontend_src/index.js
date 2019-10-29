import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col, Card, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { Slideshow } from './components/Slideshow.jsx';
import { App } from './components/App.jsx';
import { Tweet } from './components/Tweet.jsx';

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
            sampleAccounts={props.secondsTilNextAppAvail} 
            errorMessage={props.errorMessage}
            captchaSiteKey={props.captchaSiteKey}
        />
    );
};

const TestSlideshowApp = (props) => {
    return (
        <Slideshow inAnimation="zoomIn" outAnimation="zoomOut" waitAnimation="animated-wiggle">
            <TestSlideContent slideNo="1" />
            <Tweet 
                authorName="The Atlantic"
                authorUsername="@TheAtlantic"
                authorIconUrl="/static/images/atlantic_icon.jpg"
            >
                <blockquote className="blockquote">
                    <p className="mb-0">
                        “Twitter is a highly individual experience that works like a collective hallucination, not a community. It’s probably totally fine that a good chunk of the nation’s elites spend so much time on it. What could go wrong?”
                    </p>
                    <footer className="blockquote-footer">
                        Alexis C. Madrigal <cite title="Twitter Is Not America"><a href="https://www.theatlantic.com/technology/archive/2019/04/twitter-is-not-america/587770/" target="_blank">“Twitter Is Not America”</a> The Atlantic</cite>
                    </footer>
                </blockquote>
            </Tweet>
            
            <AppSlide
                secondsTilNextAppAvail={props.secondsTilNextAppAvail}
                sampleAccounts={props.sampleAccounts}
                errorMessage={props.errorMessage}
                captchaSiteKey={props.errorMessage}
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
