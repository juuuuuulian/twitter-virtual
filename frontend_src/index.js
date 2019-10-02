import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';

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

function initApp() {
    let secondsLeft = getSecondsTilNextAppUse();

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
                var timer = setInterval(function() {
                    secs_from_now = secs_from_now - 1;
                    setSecondsLeft(secs_from_now);

                    if (secs_from_now == 0) {
                        clearInterval(timer);
                        props.onTimerFinished();
                    }
                }, 1000);
            }
            startAppUseTimer(secondsLeft);
        }, []);

        if (secondsLeft == 0) {
            return null;
        } else {
            return <div>
                React Timer: {formatTimer(secondsLeft)}
            </div>
        }
    }

    function SampleAccount(props) {
        return <div>
            {props.name} (@{props.username} - Following {props.following})
            <button onClick={() => props.clickHandler(props.username)}>Click</button>
        </div>
    }

    function SampleAccountsCarousel(props) {
        return <div>
            <ul>
                {props.users.map((user) => 
                    <li><SampleAccount name={user.name} username={user.username} following={user.following} clickHandler={props.optionClickHandler} /></li>
                )}
            </ul>
        </div>
    }

    function AppForm(props) {
        return <div>
            <form method="POST" action="/twitter/begin">
                <input type="text" name="target_screen_name" />
                <input type="submit" value="Submit" />
            </form>
        </div>
    }

    function App(props) {
        const [timerFinished, setTimerFinished] = React.useState((props.seconds == 0 ? true : false));
        const [targetScreenName, setTargetScreenName] = React.useState("");
        const sampleAccounts = getSampleAccounts();
    
        return <Container>
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
            <Row>
                <Col>
                    { props.seconds != 0 && <AppUseTimer seconds={props.seconds} onTimerFinished={() => setTimerFinished(true)} /> }
                    { (props.seconds == 0 || timerFinished) && 
                        <div>
                            <AppForm targetScreenName={targetScreenName} />
                            <SampleAccountsCarousel users={sampleAccounts} optionClickHandler={(screenName) => setTargetScreenName(screenName)} />
                            <Button>My Button</Button>
                        </div>
                    }
                </Col>
            </Row>
        </Container>
    } 
    
    ReactDOM.render(
        <App seconds={secondsLeft} />,
        document.getElementById('react-container')
    );    

}

window.onload = initApp;
