// eslint-disable-next-line import/extensions
import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Slideshow } from './Slideshow.jsx';
import {
  AtlanticTweetSlide, TweetCopySlide, FeedTweetCopySlide, AppSlide,
} from './Slides.jsx';

const TestSlideshowApp = (props) => {
  const {
    errorMessage, secondsTilNextAppAvail, sampleAccounts, captchaSiteKey,
  } = props;
  // skip to the last slide if there's an error message
  const initialSlideIndex = errorMessage ? 3 : 0;
  return (
    <Slideshow
      initialSlideIndex={initialSlideIndex}
      inAnimation="animated faster zoomIn"
      outAnimation="animated faster zoomOut"
      waitAnimation="animated-wigglea"
    >
      <TweetCopySlide />
      <FeedTweetCopySlide />
      <AtlanticTweetSlide />
      <AppSlide
        secondsTilNextAppAvail={secondsTilNextAppAvail}
        sampleAccounts={sampleAccounts}
        errorMessage={errorMessage}
        captchaSiteKey={captchaSiteKey}
      />
    </Slideshow>
  );
};

TestSlideshowApp.propTypes = {
  errorMessage: PropTypes.string,
  secondsTilNextAppAvail: PropTypes.number,
  sampleAccounts: PropTypes.array,
  captchaSiteKey: PropTypes.string,
};

export default hot(TestSlideshowApp);
