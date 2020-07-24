import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';

// countdown til next app availability - replaces the form if the user has used the app today
const AppUseTimer = (props) => {
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
};

export { AppUseTimer }
