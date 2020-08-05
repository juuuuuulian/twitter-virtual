import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { Slide } from './Slideshow.jsx';
import { TweetDetail, FeedTweet } from './Tweet.jsx';
import App from './App.jsx';
import AtlanticIcon from '../images/atlantic_icon.jpg';
import TwitterVirtualizerIcon from '../images/twv_icon.png';

// wrap every character of inputString in a <span>
const spanifyString = (inputString, props) => (
  inputString.split('').map((inputChar) => <span {...props}>{inputChar}</span>)
);

const AtlanticTweetSlide = (props) => {
  const { onSlideFinish } = props;
  return (
    <Slide {...props}>
      <TweetDetail
        authorName="The Atlantic"
        authorUsername="@TheAtlantic"
        authorIconUrl={AtlanticIcon}
      >
        <blockquote className="blockquote">
          <p>
            “Twitter, as it turns out, is not a good model of the world ... a highly&nbsp;
            individual experience that works like a collective
            {' '}
            <span className="hallucination">{ spanifyString('hallucination') }</span>
            , not a community.”
          </p>
          <p>
            “It’s probably totally fine that a good chunk of the nation’s elites spend so much&nbsp;
            time on it.”
          </p>
          <footer className="blockquote-footer">
            Alexis C. Madrigal
            {' '}
            <cite title="Twitter Is Not America">
              <a href="https://www.theatlantic.com/technology/archive/2019/04/twitter-is-not-america/587770/" target="_blank" rel="noreferrer">“Twitter Is Not America”</a>
              {' '}
              The Atlantic
            </cite>
          </footer>
        </blockquote>
        <Button variant="primary" onClick={onSlideFinish}>Finish Slide</Button>
      </TweetDetail>
    </Slide>
  );
};

AtlanticTweetSlide.propTypes = {
  onSlideFinish: PropTypes.func,
};

const TweetCopySlide = (props) => {
  const { onSlideFinish } = props;
  return (
    <Slide {...props}>
      <TweetDetail
        authorName="Twitter Virtualizer"
        authorUsername="@TwitterVirtualizer"
        authorIconUrl={TwitterVirtualizerIcon}
      >
        <h1>Here&apos;s A Tweet Detail ThingyyaaaaaaaAAAAA</h1>
        <Button variant="primary" onClick={onSlideFinish}>Finish Slide</Button>
      </TweetDetail>
    </Slide>
  );
};

TweetCopySlide.propTypes = {
  onSlideFinish: PropTypes.func,
};

const FeedTweetCopySlide = (props) => {
  const { onSlideFinish } = props;
  return (
    <Slide {...props}>
      <FeedTweet
        authorName="Twitter Virtualizer"
        authorUsername="@TwitterVirtualizer"
        authorIconUrl={TwitterVirtualizerIcon}
      >
        <h1>Here&apos;s A Feed Tweet Read This Thing Hello?</h1>
        <Button variant="primary" onClick={onSlideFinish}>Finish Slide</Button>
      </FeedTweet>
    </Slide>
  );
};

FeedTweetCopySlide.propTypes = {
  onSlideFinish: PropTypes.func,
};

const AppSlide = (props) => {
  const {
    secondsTilNextAppAvail, sampleAccounts, errorMessage, captchaSiteKey,
  } = props;
  return (
    <Slide {...props}>
      <TweetDetail
        authorName="Twitter Virtualizer"
        authorUsername="@TwitterVirtualizer"
        authorIconUrl={TwitterVirtualizerIcon}
      >
        <App
          secondsTilNextAppAvail={secondsTilNextAppAvail}
          sampleAccounts={sampleAccounts}
          errorMessage={errorMessage}
          captchaSiteKey={captchaSiteKey}
        />
      </TweetDetail>
    </Slide>
  );
};

AppSlide.propTypes = {
  secondsTilNextAppAvail: PropTypes.number,
  sampleAccounts: PropTypes.array,
  errorMessage: PropTypes.string,
  captchaSiteKey: PropTypes.string,
};

export {
  AtlanticTweetSlide, TweetCopySlide, FeedTweetCopySlide, AppSlide,
};
