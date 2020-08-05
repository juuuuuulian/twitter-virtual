import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AppUseTimer from './AppUseTimer.jsx';
import ListGroupSampleAccountPicker from './SampleAccountPicker.jsx';
import SubmitModal from './SubmitModal.jsx';
import AppForm from './AppForm.jsx';
import AppErrorMessage from './AppErrorMessage.jsx';

// twitter feed copy app: app availability timer, form, sample account picker, and submit modal
const App = (props) => {
  const {
    secondsTilNextAppAvail, errorMessage, captchaSiteKey, sampleAccounts,
  } = props;
  const [timerFinished, setTimerFinished] = React.useState((secondsTilNextAppAvail === 0));
  const [targetScreenName, setTargetScreenName] = React.useState('');
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [showAppErrorMessage, setShowAppErrorMessage] = React.useState(!!errorMessage);
  const [submitModalCompleted, setSubmitModalCompleted] = React.useState(false);
  const [captchaResponseToken, setCaptchaResponseToken] = React.useState('');
  const formEle = React.createRef();

  const handleFormSubmit = (event) => {
    // modal+captcha completed, submit the form
    if (submitModalCompleted) return true;
    // prevent form submit, open the modal
    event.preventDefault();
    setShowSubmitModal(true);
    return false;
  };

  const handleSubmitModalHide = () => {
    // hide the modal
    setShowSubmitModal(false);
    // reset modal completion status
    setSubmitModalCompleted(false);
    // clear recaptcha token
    setCaptchaResponseToken('');
  };

  const handleSubmitModalCompleted = () => {
    // mark modal as completed and submit the form
    setSubmitModalCompleted(true);
    formEle.current.submit();
  };

  const handleSubmitModalCaptchaVerified = (responseToken) => {
    // stash recaptcha token in the form
    setCaptchaResponseToken(responseToken);
  };

  const handleSampleAccountOptionClick = (screenName) => {
    // fill in the form and open the submit modal
    setTargetScreenName(screenName);
    if (showAppErrorMessage) setShowAppErrorMessage(false);
    setShowSubmitModal(true);
  };

  const handleErrorMessageHide = () => {
    setShowAppErrorMessage(false);
  };

  const handleFormSetTargetScreenName = (screenName) => {
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
        finishEnabled={captchaResponseToken !== ''}
        captchaSiteKey={captchaSiteKey}
        targetScreenName={targetScreenName}
      />
      <AppErrorMessage
        errorMessage={errorMessage}
        onClose={handleErrorMessageHide}
        show={showAppErrorMessage}
      />
      {
        secondsTilNextAppAvail !== 0
        && (
        <AppUseTimer
          secondsAhead={secondsTilNextAppAvail}
          onTimerFinished={() => setTimerFinished(true)}
        />
        )
      }
      { (secondsTilNextAppAvail === 0 || timerFinished)
              && (
              <div>
                <AppForm
                  formRef={formEle}
                  targetScreenName={targetScreenName}
                  setTargetScreenName={handleFormSetTargetScreenName}
                  onSubmit={handleFormSubmit}
                  captchaResponseToken={captchaResponseToken}
                />
                <div>
                  <ListGroupSampleAccountPicker
                    accounts={sampleAccounts}
                    optionClickHandler={handleSampleAccountOptionClick}
                  />
                </div>
              </div>
              )}
    </div>
  );
};

App.propTypes = {
  secondsTilNextAppAvail: PropTypes.number,
  sampleAccounts: PropTypes.array,
  errorMessage: PropTypes.string,
  captchaSiteKey: PropTypes.string,
};

export default App;
