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
import sampleAccounts from './json/sample_accounts.json';

const getAppVars = () => {
  const appVars = window.APP_VARS;
  if (appVars == null) {
    // eslint-disable-next-line no-console
    console.warn('no window.APP_VARS available');
    return {};
  }
  return appVars;
};

const getLastAppUseValue = () => {
  const appVars = getAppVars();
  const { last_app_use: lastAppUse } = appVars;
  if (lastAppUse == null) return null;
  return new Date(lastAppUse);
};

const getSecondsTilNextAppAvail = () => {
  const lastAppUse = getLastAppUseValue();
  if (lastAppUse == null) return 0;
  const msInADay = 60 * 60 * 24 * 1000;
  const nextAvailableAppUse = new Date(lastAppUse.getTime() + msInADay);
  const now = new Date();

  if (now.getTime() > nextAvailableAppUse.getTime()) return 0;

  return Math.floor((nextAvailableAppUse.getTime() - now.getTime()) / 1000);
};

const getErrorMessage = () => (getAppVars().error_message);

const initApp = () => {
  const secondsTilNextAppAvail = getSecondsTilNextAppAvail();
  // eslint-disable-next-line no-undef
  const recaptchaSiteKey = RECAPTCHA_SITE_KEY;
  const errorMessage = getErrorMessage();

  ReactDOM.render(
    <TestSlideshowApp
      secondsTilNextAppAvail={secondsTilNextAppAvail}
      sampleAccounts={sampleAccounts}
      errorMessage={errorMessage}
      captchaSiteKey={recaptchaSiteKey}
    />,
    document.getElementById('react-container'),
  );
};

window.addEventListener('DOMContentLoaded', initApp);
