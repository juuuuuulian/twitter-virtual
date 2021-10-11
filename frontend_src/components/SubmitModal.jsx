/* eslint-disable react/jsx-one-expression-per-line */
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
      <Modal.Header closeButton>
        <Modal.Title>
          Before Using Our Application...
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-warning">
          <Row>
            <Col>
              <h4>Requirements for Use</h4>
            </Col>
          </Row>
          <Row>
            <Col>
              <ul>
                <li>You&nbsp;
                  <b>must be following</b> the selected Twitter account
                </li>
                <li>
                  The selected Twitter account&nbsp;
                  <b>must not be following more than 2000 other Twitter
                    users
                  </b>&nbsp;
                  (a hard limit imposed on Lists by Twitter).&nbsp;
                  <a target="_blank" rel="noreferrer" href={(`http://twitter.com/${targetScreenName}`)}>Click here to view their profile</a>
                </li>
                <li>
                  You may only use our application once per day
                </li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col>
              <h4>Disclaimer</h4>
            </Col>
          </Row>
          <Row>
            <Col>
              <div>
                This application is not in&nbsp;
                <i>any</i> way affiliated with Twitter, and it will never store any
                data related to your Twitter account. It will never Tweet, Like, Reply, or perform
                any action on your account, other than the actions detailed below. With your
                permission, we will:
                <ol>
                  <li>Create a Twitter ’List’ under your Twitter account</li>
                  <li>
                    Add all users who &apos;{targetScreenName}&apos; follows to that List
                  </li>
                  <li>
                    Provide you with a link to that list, along with a Twitter settings link to
                    de-authorize our application from taking any further actions on your account.
                  </li>
                </ol>
              </div>
            </Col>
          </Row>
        </div>
        <Row>
          <Col>
            Complete the captcha below to continue:
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
