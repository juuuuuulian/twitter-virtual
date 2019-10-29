import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';

const AppErrorMessage = (props) => {
  return <Alert variant="danger" dismissible onClose={() => props.onClose()} show={props.show}>
      <Alert.Heading>Uh oh! We hit a snag!</Alert.Heading>
      <p>{props.errorMessage}</p>
  </Alert>
};

export { AppErrorMessage }
