import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, InputGroup, Form } from 'react-bootstrap';

const AppForm = (props) => {
  const {
    targetScreenName, setTargetScreenName, onSubmit, formRef, captchaResponseToken,
  } = props;
  const [submitTried, setSubmitTried] = React.useState(false);

  const screenNameRegexp = new RegExp('^[a-zA-Z0-9_]{1,15}$');
  function screenNameIsValid(screenName) {
    return screenNameRegexp.test(screenName);
  }

  const submitHandler = (event) => {
    if (screenNameIsValid(targetScreenName)) {
      onSubmit(event);
      setSubmitTried(false);
    } else {
      event.preventDefault();
      setSubmitTried(true);
    }
  };

  const inputChangeHandler = (event) => {
    const val = event.target.value;
    if (!val) setSubmitTried(false);
    setTargetScreenName(val);
  };

  return (
    <Form
      method="POST"
      action="/twitter/begin"
      onSubmit={submitHandler}
      ref={formRef}
    >
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>@</InputGroup.Text>
        </InputGroup.Prepend>
        <Form.Control
          type="text"
          name="target_screen_name"
          placeholder="Enter a friend's username"
          value={targetScreenName}
          onChange={inputChangeHandler}
          isValid={screenNameIsValid(targetScreenName) && targetScreenName}
          isInvalid={!screenNameIsValid(targetScreenName) && (targetScreenName || submitTried)}
          className="shadow"
        />
        <Button variant="success" type="submit" className="shadow">Virtualize</Button>
        <Form.Control.Feedback type="invalid">
          Please enter a valid Twitter screen name (letters, numbers, and underscores,&nbsp;
          fifteen characters or less).
        </Form.Control.Feedback>
      </InputGroup>
      <Form.Control
        type="hidden"
        name="captcha_response_token"
        value={captchaResponseToken}
      />
    </Form>
  );
};

AppForm.propTypes = {
  targetScreenName: PropTypes.string,
  setTargetScreenName: PropTypes.func,
  onSubmit: PropTypes.func,
  formRef: PropTypes.any,
  captchaResponseToken: PropTypes.string,
};

export default AppForm;
