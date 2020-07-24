
import React, { Component } from 'react';
import Recaptcha from 'react-recaptcha';
import { Button, Row, Col, Modal } from 'react-bootstrap';

const SubmitModal = (props) => {
  return (
      <Modal show={props.show} onHide={props.onHide}>
          <Modal.Body>
              <Row>
                  <Col>Here's some steps that we'll take using your account!</Col>
              </Row>
              <Row>
                  <Col>Here's a disclaimer which meets your concerns about authorizing our app!</Col>
              </Row>
              <Row>
                  <Col>
                      You're gonna virtualize <a target="_blank" href={("http://twitter.com/" + props.targetScreenName)}>{props.targetScreenName}</a>
                  </Col>
              </Row>
              <Row>
                  <Col>Go here to de-authorize afterwards:
                  <a target="_blank" href="https://twitter.com/settings/applications">
                      Twitter Application Settings
                  </a>
              </Col>
              </Row>
              <Row>
                  <Col>
                      <Recaptcha
                          sitekey={props.captchaSiteKey}
                          verifyCallback={props.onCaptchaVerified}
                      />
                  </Col>
              </Row>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={props.onHide}>
                  Cancel
              </Button>
              <Button disabled={ props.finishEnabled ? false : true } variant="success" onClick={props.onCompleted}>
                  I Understand, Continue
              </Button>
          </Modal.Footer>
      </Modal>
  );
};

export { SubmitModal }
