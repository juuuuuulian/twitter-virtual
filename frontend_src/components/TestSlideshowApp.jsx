import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import { Slideshow, Slide } from './Slideshow.jsx';
import { AtlanticTweetSlide, TweetCopySlide, FeedTweetCopySlide, AppSlide } from './Slides.jsx';


const TestSlideshowApp = (props) => {
  let initialSlideIndex = props.errorMessage ? 2 : 0; // skip to the last slide if there's an error message
  return (
      <Slideshow
          initialSlideIndex={initialSlideIndex}
          inAnimation="animated faster zoomIn"
          outAnimation="animated faster zoomOut"
          waitAnimation="animated-wiggle"
          waitAnimation="nonea"
      >
          <TweetCopySlide />
          <FeedTweetCopySlide />
          {/*<AtlanticTweetSlide />*/}
          <AppSlide
              secondsTilNextAppAvail={props.secondsTilNextAppAvail}
              sampleAccounts={props.sampleAccounts}
              errorMessage={props.errorMessage}
              captchaSiteKey={props.captchaSiteKey}
          />
      </Slideshow>
  );
};

export default hot(TestSlideshowApp);
