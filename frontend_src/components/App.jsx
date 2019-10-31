import React, { Component } from 'react';
import { AppUseTimer } from './AppUseTimer.jsx';
import { SampleAccountsPicker } from './SampleAccountsPicker.jsx';
import { SubmitModal } from './SubmitModal.jsx';
import { AppForm } from './AppForm.jsx';
import { AppErrorMessage } from './AppErrorMessage.jsx';

// twitter feed copy app: app availability timer, form, sample account picker, and submit modal

const App = (props) => {
  const [timerFinished, setTimerFinished] = React.useState((props.secondsTilNextAppAvail == 0 ? true : false));
  const [targetScreenName, setTargetScreenName] = React.useState("");
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [showAppErrorMessage, setShowAppErrorMessage] = React.useState(props.errorMessage ? true : false);
  const [submitModalCompleted, setSubmitModalCompleted] = React.useState(false);
  const [captchaResponseToken, setCaptchaResponseToken] = React.useState("");
  let formEle = React.createRef();

  let handleFormSubmit = (event) => {
      // modal+captcha completed, submit the form
      if (submitModalCompleted)
          return true;
      // prevent form submit, open the modal
      event.preventDefault();
      setShowSubmitModal(true);
  };

  let handleSubmitModalHide = () => {
      // hide the modal
      setShowSubmitModal(false);
      // reset modal completion status
      setSubmitModalCompleted(false);
      // clear recaptcha token
      setCaptchaResponseToken("");
  };

  let handleSubmitModalCompleted = () => {
      // mark modal as completed and submit the form
      setSubmitModalCompleted(true);
      formEle.current.submit();
  };

  let handleSubmitModalCaptchaVerified = (responseToken) => {
      // stash recaptcha token in the form
      setCaptchaResponseToken(responseToken);
  };

  let handleSampleAccountOptionClick = (screenName) => {
      // fill in the form and open the submit modal
      setTargetScreenName(screenName);
      if (showAppErrorMessage) setShowAppErrorMessage(false);
      setShowSubmitModal(true);
  };

  let handleErrorMessageHide = () => {
      setShowAppErrorMessage(false);
  };

  let handleFormSetTargetScreenName = (screenName) => {
      setTargetScreenName(screenName);
      if (showAppErrorMessage) setShowAppErrorMessage(false);
  };

  return (
      <div>
          <SubmitModal 
              show={showSubmitModal} 
              onHide={handleSubmitModalHide} 
              onCompleted={handleSubmitModalCompleted}
              onCaptchaVerified={handleSubmitModalCaptchaVerified}
              finishEnabled={ captchaResponseToken != "" }
              captchaSiteKey={props.captchaSiteKey}
              targetScreenName={targetScreenName}
          />
          <AppErrorMessage 
              errorMessage={props.errorMessage} 
              onClose={handleErrorMessageHide}
              show={showAppErrorMessage}
          />
          { props.secondsTilNextAppAvail != 0 && <AppUseTimer secondsAhead={props.secondsTilNextAppAvail} onTimerFinished={() => setTimerFinished(true)} /> }
          { (props.secondsTilNextAppAvail == 0 || timerFinished) && 
              <div>
                  <AppForm 
                      formRef={formEle}
                      targetScreenName={targetScreenName}
                      setTargetScreenName={handleFormSetTargetScreenName}
                      onSubmit={handleFormSubmit}
                      captchaResponseToken={captchaResponseToken}
                  />
                  <SampleAccountsPicker 
                      accounts={props.sampleAccounts} 
                      optionClickHandler={handleSampleAccountOptionClick} 
                  />
              </div>
          }
      </div>
  );
};

export { App }