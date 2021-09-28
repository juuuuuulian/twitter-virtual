// eslint-disable-next-line import/extensions
import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import App from './App.jsx';

const TestNewApp = (props) => {
  const {
    errorMessage, secondsTilNextAppAvail, sampleAccounts, captchaSiteKey,
  } = props;
  return (
    <App
      secondsTilNextAppAvail={secondsTilNextAppAvail}
      sampleAccounts={sampleAccounts}
      errorMessage={errorMessage}
      captchaSiteKey={captchaSiteKey}
    />
  );
};

TestNewApp.propTypes = {
  errorMessage: PropTypes.string,
  secondsTilNextAppAvail: PropTypes.number,
  sampleAccounts: PropTypes.array,
  captchaSiteKey: PropTypes.string,
};

export default hot(TestNewApp);
