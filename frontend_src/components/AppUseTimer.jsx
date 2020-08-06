import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';

// countdown til next app availability - replaces the form if the user has used the app today
const AppUseTimer = (props) => {
  const { secondsAhead, onTimerFinished } = props;
  const [secondsLeft, setSecondsLeft] = React.useState(secondsAhead);

  function formatTimer(secsFromNow) {
    const h = Math.floor(secsFromNow / 3600);
    const m = Math.floor((secsFromNow % 3600) / 60);
    const s = Math.floor((secsFromNow % 3600) % 60);

    return `${h.toString()}h${m.toString()}m${s.toString()}s`;
  }

  React.useEffect(() => {
    let timerSeconds = secondsLeft;
    if (timerSeconds === 0) return undefined;

    const timer = setInterval(() => {
      timerSeconds -= 1;
      setSecondsLeft(timerSeconds);

      if (timerSeconds === 0) {
        clearInterval(timer);
        onTimerFinished();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [secondsLeft, onTimerFinished]);

  if (secondsLeft === 0) {
    return null; // render nothing
  }

  return (
    <div>
      <Alert variant="warning">
        <Alert.Heading>It looks as though you&apos;ve already used our app today.</Alert.Heading>
        <p>
          To comply with Twitter&apos;s terms of service, we have to limit how often our app&nbsp;
          is used. (Sorry.)
          <br />
          You can use our app again in&nbsp;
          <b>{formatTimer(secondsLeft)}</b>
          .
        </p>
      </Alert>
    </div>
  );
};

AppUseTimer.propTypes = {
  secondsAhead: PropTypes.number,
  onTimerFinished: PropTypes.func,
};

export default AppUseTimer;
