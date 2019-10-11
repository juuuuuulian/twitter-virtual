import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col, Card, InputGroup, Form, Modal } from 'react-bootstrap';
import Recaptcha from 'react-recaptcha';

function getLastAppUseValue() {
    let last_app_use = window.APP_VARS.last_app_use;
    if (last_app_use == null)
        return null;
    return new Date(last_app_use);
}

function getSecondsTilNextAppUse() {
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

// countdown til next app availability - replaces the form if the user has used the app today
function AppUseTimer(props) {
    const [secondsLeft, setSecondsLeft] = React.useState(props.seconds);

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
            React Timer: {formatTimer(secondsLeft)}
        </div>
    }
}

function SampleAccountCard(props) {
    return <Card style={{ 
        minWidth: "225px", 
        maxWidth: "225px", 
        maxHeight: "375px", 
        marginRight: "10px" 
        }}>
        <Card.Img variant="top" src={props.profileImgUrl} style={{ 
            width: "100%", 
            objectFit: "cover", 
            height: "175px" 
            }} />
        <Card.Body style={{ 
            display: "flex", 
            flexFlow: "column", 
            alignItems: "flex-start", 
            justifyContent: "space-between" 
            }}>
            <div>
                <Card.Title>{props.name}</Card.Title>
            </div>
            <div>
                <Card.Text>Following {props.following} people</Card.Text>
            </div>
        </Card.Body>
        <Card.Footer>
            <Button style={{ width: "100%" }} variant="primary" onClick={() => props.clickHandler(props.username)}>Try Account</Button>
        </Card.Footer>
    </Card>
}

function SampleAccountsPicker(props) {
    // CardDeck
    return <div style={{ 
        overflowX: "auto", 
        "-webkit-overflow-scrolling": "touch", 
        display: "flex", 
        flexFlow: "row nowrap", 
        marginLeft: "-15px", 
        marginRight: "-15px",
        padding: "10px",
        backgroundColor: "lightgrey"
    }}>
        {props.accounts.map((account) => 
            <SampleAccountCard name={account.name} username={account.username} following={account.following} profileImgUrl={account.profile_img_url} clickHandler={props.optionClickHandler} />
        )}
    </div>
}

function SubmitModal(props) {
    return (
        <Modal show={props.show} onHide={props.onHide}>
            <Modal.Body>
                <Row>
                    <Col>Here's a Modal!</Col>
                </Row>
                <Row>
                    <Col>Here's some modal content!</Col>
                </Row>
                <Row>
                    <Col>
                        <Recaptcha 
                            sitekey="6LcUOL0UAAAAABQxy5sqdpKRLeVAmF9nMhglXQ6E"  // TODO: move this to a prop
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
                    I Understand, Proceed
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function AppForm(props) {
    return <Form method="POST" action="/twitter/begin" onSubmit={(event) => props.onSubmit(event)} ref={props.formRef}>
        <InputGroup>
            <InputGroup.Prepend>
                <InputGroup.Text>@</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control 
                type="text" 
                name="target_screen_name" 
                placeholder="AccountName" 
                value={props.targetScreenName} 
                onChange={(event) => props.setTargetScreenName(event.target.value)} 
            />
            <Form.Control
                type="hidden"
                name="captcha_response_token"
                value={props.captchaResponseToken} />
            <Button variant="success" type="Submit">GO</Button> 
        </InputGroup>
    </Form>
}

function CopySection() {
    return <>
        <Row>
            <Col>
                <div>
                    "Twitter is a highly individual experience that works like a collective hallucination, not a community. It’s probably totally fine that a good chunk of the nation’s elites spend so much time on it. What could go wrong?"
                </div>
                <div>
                    -- <a href="https://www.theatlantic.com/technology/archive/2019/04/twitter-is-not-america/587770/" target="_blank">Alexis C. Madrigal, The Atlantic</a>
                </div>
            </Col>
        </Row>
        <Row>
            <Col>
                <div>
                    The Twitter timeline looks much the same to everybody. But have you seen another person's Twitter timeline before?
                </div>
            </Col>
        </Row>
        <Row>
            <Col>
                <div>
                    What would the President see if they opened Twitter on their phone right now? Or Bernie Sanders? Or Kanye West? Or your friend?
                </div>
            </Col>
        </Row>
        <Row>
            <Col>
                <div>
                    This free, experimental tool can show you. All that you'll need is a Twitter account, and the username of another person who you happen to follow. Or, you can choose a sample account from the list below.
                </div>
            </Col>
        </Row>
        <Row>
            <Col>
                <div>
                    <div>
                        - We do not store Twitter user credentials, nor any other Twitter data related to your account.
                    </div>
                    <div>
                        - We will never post anything to your account. <a href="https://twitter.com/settings/applications" target="_blank">De-authorizing our application is easy</a>, and we recommend doing so afterwards.
                    </div>
                </div>
            </Col>
        </Row>
    </>
}

function App(props) {
    const [timerFinished, setTimerFinished] = React.useState((props.seconds == 0 ? true : false));
    const [targetScreenName, setTargetScreenName] = React.useState("");
    const [showSubmitModal, setShowSubmitModal] = React.useState(false);
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
        setShowSubmitModal(true);
    };

    return <>
        <SubmitModal 
            show={showSubmitModal} 
            onHide={handleSubmitModalHide} 
            onCompleted={handleSubmitModalCompleted}
            onCaptchaVerified={handleSubmitModalCaptchaVerified}
            finishEnabled={ captchaResponseToken != "" }
        />
        <Container>
            <CopySection />
            <Row>
                <Col>
                    { props.seconds != 0 && <AppUseTimer seconds={props.seconds} onTimerFinished={() => setTimerFinished(true)} /> }
                    { (props.seconds == 0 || timerFinished) && 
                        <div>
                            <AppForm 
                                formRef={formEle} 
                                targetScreenName={targetScreenName} 
                                setTargetScreenName={(value) => setTargetScreenName(value)} 
                                onSubmit={handleFormSubmit}
                                captchaResponseToken={captchaResponseToken}
                            />
                            <SampleAccountsPicker 
                                accounts={props.sampleAccounts} 
                                optionClickHandler={handleSampleAccountOptionClick} 
                            />
                        </div>
                    }
                </Col>
            </Row>
        </Container>
    </>
}

function initApp() {
    ReactDOM.render(
        <App seconds={getSecondsTilNextAppUse()} sampleAccounts={getSampleAccounts()} />,
        document.getElementById('react-container')
    );    
}

window.addEventListener('DOMContentLoaded', (event) => {
    initApp()
});
