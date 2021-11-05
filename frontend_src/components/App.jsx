/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/extensions
import { hot } from 'react-hot-loader/root';
import AppUseTimer from './AppUseTimer.jsx';
import ListGroupSampleAccountPicker from './SampleAccountPicker.jsx';
import SubmitModal from './SubmitModal.jsx';
import AppForm from './AppForm.jsx';
import AppErrorMessage from './AppErrorMessage.jsx';
import Footer from './Footer.jsx';

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
    <>
      <SubmitModal
        show={showSubmitModal}
        onHide={handleSubmitModalHide}
        onCompleted={handleSubmitModalCompleted}
        onCaptchaVerified={handleSubmitModalCaptchaVerified}
        finishEnabled={captchaResponseToken !== ''}
        captchaSiteKey={captchaSiteKey}
        targetScreenName={targetScreenName}
      />
      <div className="index-cont">
        <div className="index-head header-copy">
          <h1 className="display-4">Discover the Twitter You&apos;ve Been Missing Out On</h1>
          <h6>Like VR goggles for your Twitter feed!</h6>
          <h6>What is Twitter like for your friends? Create a Virtual Timeline of people who a friend follows and discover Twitter from a new point of view</h6>
          <div>
            This experimental tool is
            {' '}
            <a href="https://github.com/juuuuuulian/twitter-virtual" target="_blank" rel="noreferrer">open-source</a>
            , free to use, and doesn&apos;t store any personal information
          </div>
        </div>
        <div>
          <AppErrorMessage
            errorMessage={errorMessage}
            onClose={handleErrorMessageHide}
            show={showAppErrorMessage}
          />
        </div>
        {
        secondsTilNextAppAvail !== 0
        && (
        <div>
          <AppUseTimer
            secondsAhead={secondsTilNextAppAvail}
            onTimerFinished={() => setTimerFinished(true)}
          />
        </div>
        )
      }
        { (secondsTilNextAppAvail === 0 || timerFinished)
              && (
              <>
                <div className="app-form-cont">
                  <AppForm
                    formRef={formEle}
                    targetScreenName={targetScreenName}
                    setTargetScreenName={handleFormSetTargetScreenName}
                    onSubmit={handleFormSubmit}
                    captchaResponseToken={captchaResponseToken}
                  />
                </div>
                <div className="header-copy">Or, choose one of the following accounts: </div>
                <div>
                  <ListGroupSampleAccountPicker
                    accounts={sampleAccounts}
                    optionClickHandler={handleSampleAccountOptionClick}
                  />
                </div>
              </>
              )}
      </div>
      <Footer />
    </>
  );
};

App.propTypes = {
  secondsTilNextAppAvail: PropTypes.number,
  sampleAccounts: PropTypes.array,
  errorMessage: PropTypes.string,
  captchaSiteKey: PropTypes.string,
};

export default hot(App);
