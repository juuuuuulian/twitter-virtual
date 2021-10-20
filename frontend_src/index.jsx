import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  // eslint-disable-next-line no-unused-vars
  Button, Container, Row, Col, Card, InputGroup, Form, Modal, Alert,
} from 'react-bootstrap';
// import TestSlideshowApp from './components/TestSlideshowApp.jsx';
import App from './components/App.jsx';
import './css/bootstrap.min.css';
import './css/animate.min.css';
import './css/index.css';
import sampleAccounts from './json/sample_accounts.json';
import {
  getSecondsTilNextAppAvail, getErrorMessage,
} from './utils.jsx';

const initApp = () => {
  const secondsTilNextAppAvail = getSecondsTilNextAppAvail();
  // eslint-disable-next-line no-undef
  const recaptchaSiteKey = RECAPTCHA_SITE_KEY;
  const errorMessage = getErrorMessage();

  ReactDOM.render(
    <App
      secondsTilNextAppAvail={secondsTilNextAppAvail}
      sampleAccounts={sampleAccounts}
      errorMessage={errorMessage}
      captchaSiteKey={recaptchaSiteKey}
    />,
    document.getElementById('react-container'),
  );
};

window.addEventListener('DOMContentLoaded', initApp);
