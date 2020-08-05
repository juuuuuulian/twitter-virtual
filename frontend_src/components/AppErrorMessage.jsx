import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';

const AppErrorMessage = (props) => {
  const { onClose, show, errorMessage } = props;
  return (
    <Alert variant="danger" dismissible onClose={() => onClose()} show={show}>
      <Alert.Heading>Uh oh! We hit a snag!</Alert.Heading>
      <p>{errorMessage}</p>
    </Alert>
  );
};

AppErrorMessage.propTypes = {
  onClose: PropTypes.func,
  show: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default AppErrorMessage;
