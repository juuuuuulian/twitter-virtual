import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Recaptcha from 'react-recaptcha';
import {
  Button, Row, Col, Modal,
} from 'react-bootstrap';

const SubmitModal = (props) => {
  const {
    show, onHide, targetScreenName, captchaSiteKey, onCaptchaVerified, finishEnabled, onCompleted,
  } = props;
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Body>
        <Row>
          <Col>Here&nbsp;s some steps that we&nbsp;ll take using your account!</Col>
        </Row>
        <Row>
          <Col>Here&nbsp;s a disclaimer which meets your concerns about authorizing our app!</Col>
        </Row>
        <Row>
          <Col>
            You&nbsp;re gonna virtualize
            {' '}
            <a target="_blank" rel="noreferrer" href={(`http://twitter.com/${targetScreenName}`)}>{targetScreenName}</a>
          </Col>
        </Row>
        <Row>
          <Col>
            Go here to de-authorize afterwards:
            <a target="_blank" rel="noreferrer" href="https://twitter.com/settings/applications">
              Twitter Application Settings
            </a>
          </Col>
        </Row>
        <Row>
          <Col>
            <Recaptcha
              sitekey={captchaSiteKey}
              verifyCallback={onCaptchaVerified}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button disabled={!finishEnabled} variant="success" onClick={onCompleted}>
          I Understand, Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

SubmitModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  targetScreenName: PropTypes.string,
  captchaSiteKey: PropTypes.string,
  onCaptchaVerified: PropTypes.func,
  finishEnabled: PropTypes.bool,
  onCompleted: PropTypes.func,
};

export default SubmitModal;
