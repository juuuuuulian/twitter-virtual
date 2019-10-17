import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col, Card, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import Recaptcha from 'react-recaptcha';

function getLastAppUseValue() {
    let last_app_use = window.APP_VARS.last_app_use;
    if (last_app_use == null)
        return null;
    return new Date(last_app_use);
}

function getSecondsTilNextAppAvail() {
    var last_app_use = getLastAppUseValue();
    if (last_app_use == null)
        return 0;
    var ms_in_day = 60 * 60 * 24 * 1000;
    var next_available_use = new Date(last_app_use.getTime() + ms_in_day);
    var now = new Date();

    if (now.getTime() > next_available_use.getTime())
        return 0;

    return Math.floor((next_available_use.getTime() - now.getTime()) / 1000);
}

function getSampleAccounts() {
    return window.APP_VARS.sample_accounts;
}

function getErrorMessage() {
    return window.APP_VARS.error_message;
}

function getRecaptchaSiteKey() {
    return window.APP_VARS.recaptcha_site_key;
}

// countdown til next app availability - replaces the form if the user has used the app today
function AppUseTimer(props) {
    const [secondsLeft, setSecondsLeft] = React.useState(props.secondsAhead);

    function formatTimer(secs) {
        var hrs = Math.floor(secs / 3600);
        var mins = Math.floor((secs % 3600) / 60);
        var secs = Math.floor((secs % 3600) % 60);

        return hrs.toString() + "h" + mins.toString() + "m" + secs + "s";
    }

    React.useEffect(() => {
        function startAppUseTimer(secs_from_now) {
            let timer = setInterval(function() {
                secs_from_now = secs_from_now - 1;
                setSecondsLeft(secs_from_now);

                if (secs_from_now == 0) {
                    clearInterval(timer);
                    props.onTimerFinished();
                }
            }, 1000);
            return timer;
        }

        let appUseTimer = startAppUseTimer(secondsLeft);
        return () => {
            clearInterval(appUseTimer);
        }
    }, []); // [] = skip new effect create on component update

    if (secondsLeft == 0) {
        return null;
    } else {
        return <div>
            <Alert variant="warning">
                <Alert.Heading>It looks as though you've already used our app today.</Alert.Heading>
                <p>
                    To comply with Twitter's terms of service, we have to limit how often our app is used. (Sorry.)<br />
                    You can use our app again in <b>{formatTimer(secondsLeft)}</b>.
                </p>
            </Alert>
        </div>
    }
}

function SampleAccountCard(props) {
    return (
        <Card>
            <Card.Img 
                variant="top" 
                src={props.profileImgUrl} 
            />
            <Card.Body>
                <div>
                    <Card.Title>{props.name}</Card.Title>
                </div>
                <div>
                    <Card.Text>Following {props.following} people</Card.Text>
                </div>
            </Card.Body>
            <Card.Footer>
                <Button 
                    className="sample-acct-btn"
                    variant="primary" 
                    onClick={() => props.clickHandler(props.username)}>
                    Try Account
                </Button>
            </Card.Footer>
        </Card>
    );
}

function SampleAccountsPicker(props) {
    // CardDeck
    return <div className="sample-acct-picker">
        {props.accounts.map((account) => 
            <SampleAccountCard 
                name={account.name} 
                username={account.username} 
                following={account.following} 
                profileImgUrl={account.profile_img_url} 
                clickHandler={props.optionClickHandler} 
            />
        )}
    </div>
}

function SubmitModal(props) {
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
}

function AppForm(props) {
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
}

function AppErrorMessage(props) {
    return <Alert variant="danger" dismissible onClose={() => props.onClose()} show={props.show}>
        <Alert.Heading>Uh oh! We hit a snag!</Alert.Heading>
        <p>{props.errorMessage}</p>
    </Alert>
}

function App(props) {
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
}

function initApp() {
    ReactDOM.render(
        <div>
            <App 
                secondsTilNextAppAvail={getSecondsTilNextAppAvail()} 
                sampleAccounts={getSampleAccounts()} 
                errorMessage={getErrorMessage()}
                captchaSiteKey={getRecaptchaSiteKey()}
            />
        </div>,
        document.getElementById('react-container')
    );
}

window.addEventListener('DOMContentLoaded', (event) => {
    initApp()
});
