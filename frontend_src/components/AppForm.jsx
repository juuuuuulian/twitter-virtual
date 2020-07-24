import React, { Component } from 'react';
import { Button, InputGroup, Form } from 'react-bootstrap';

const AppForm = (props) => {
  const [submitTried, setSubmitTried] = React.useState(false);

  const screenNameRegexp = new RegExp("^[a-zA-Z0-9_]{1,15}$");
  function screenNameIsValid(screenName) {
      return screenNameRegexp.test(screenName);
  }

  const submitHandler = (event) => {
      if (screenNameIsValid(props.targetScreenName)) {
          props.onSubmit(event);
          setSubmitTried(false);
      } else {
          event.preventDefault();
          setSubmitTried(true);
      }
  };

  const inputChangeHandler = (event) => {
      let val = event.target.value;
      if (! val) setSubmitTried(false);
      props.setTargetScreenName(val);
  };

  return <Form
      method="POST"
      action="/twitter/begin"
      onSubmit={submitHandler}
      ref={props.formRef}>
      <InputGroup>
          <InputGroup.Prepend>
              <InputGroup.Text>@</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
              type="text"
              name="target_screen_name"
              placeholder="AccountName"
              value={props.targetScreenName}
              onChange={inputChangeHandler}
              isValid={screenNameIsValid(props.targetScreenName) && props.targetScreenName}
              isInvalid={! screenNameIsValid(props.targetScreenName) && (props.targetScreenName || submitTried)}
          />
          <InputGroup.Append className="target-screen-name-append">
              <Button variant="success" type="submit">GO</Button>
          </InputGroup.Append>
          <Form.Control.Feedback type="invalid">
              Please enter a valid Twitter screen name (letters, numbers, and underscores, fifteen characters or less).
          </Form.Control.Feedback>
      </InputGroup>
      <Form.Control
          type="hidden"
          name="captcha_response_token"
          value={props.captchaResponseToken}
      />
  </Form>
};

export { AppForm }
