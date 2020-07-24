//import AppContainer from 'react-hot-loader';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col, Card, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import TestSlideshowApp from './components/TestSlideshowApp.jsx';
import './css/bootstrap.min.css';
import './css/animate.min.css';
import './css/index.css';


function getAppVars() {
    const appVars = window.APP_VARS;
    if (appVars == null) {
        console.warn('no window.APP_VARS available');
        return {};
    }
    return appVars;
}

function getLastAppUseValue() {
    const appVars = getAppVars();
    let last_app_use = appVars.last_app_use;
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
