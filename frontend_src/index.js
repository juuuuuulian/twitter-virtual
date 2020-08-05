import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  // eslint-disable-next-line no-unused-vars
  Button, Container, Row, Col, Card, InputGroup, Form, Modal, Alert,
} from 'react-bootstrap';
import TestSlideshowApp from './components/TestSlideshowApp.jsx';
import './css/bootstrap.min.css';
import './css/animate.min.css';
import './css/index.css';

function getAppVars() {
  const appVars = window.APP_VARS;
  if (appVars == null) {
    // eslint-disable-next-line no-console
    console.warn('no window.APP_VARS available');
    return {};
  }
  return appVars;
}

function getLastAppUseValue() {
  const appVars = getAppVars();
  const { last_app_use: lastAppUse } = appVars;
  if (lastAppUse == null) return null;
  return new Date(lastAppUse);
}

function getSecondsTilNextAppAvail() {
  const lastAppUse = getLastAppUseValue();
  if (lastAppUse == null) return 0;
  const msInADay = 60 * 60 * 24 * 1000;
  const nextAvailableAppUse = new Date(lastAppUse.getTime() + msInADay);
  const now = new Date();

  if (now.getTime() > nextAvailableAppUse.getTime()) return 0;

  return Math.floor((nextAvailableAppUse.getTime() - now.getTime()) / 1000);
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
    document.getElementById('react-container'),
  );
}

window.addEventListener('DOMContentLoaded', () => {
  initApp();
});
