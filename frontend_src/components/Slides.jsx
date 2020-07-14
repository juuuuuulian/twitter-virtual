import React, { Component } from 'react';
import { Slide } from './Slideshow.jsx';
import { TweetDetail, FeedTweet } from './Tweet.jsx';
import { App } from './App.jsx';
import { Button } from 'react-bootstrap';


const spanifyString = (inputString, props) => {
  // wrap every character of inputString in a <span>
  return inputString.split('').map((inputChar) =>  <span {...props}>{inputChar}</span>)
};

const AtlanticTweetSlide = (props) => {
  return (
    <Slide {...props}>
      <TweetDetail 
        authorName="The Atlantic"
        authorUsername="@TheAtlantic"
        authorIconUrl="/static/images/atlantic_icon.jpg"
      >
        <blockquote className="blockquote">
            <p>
                “Twitter, as it turns out, is not a good model of the world ... a highly individual experience that works like a collective <span className="hallucination">{ spanifyString("hallucination") }</span>, not a community.”
            </p>
            <p>
              “It’s probably totally fine that a good chunk of the nation’s elites spend so much time on it.”
            </p>
            <footer className="blockquote-footer">
                Alexis C. Madrigal <cite title="Twitter Is Not America"><a href="https://www.theatlantic.com/technology/archive/2019/04/twitter-is-not-america/587770/" target="_blank">“Twitter Is Not America”</a> The Atlantic</cite>
            </footer>
        </blockquote>
        <Button variant="primary" onClick={props.onSlideFinish}>Finish Slide</Button>
      </TweetDetail>
    </Slide>
  );
};

const TweetCopySlide = (props) => {
  return (
    <Slide {...props}>
      <TweetDetail
        authorName="Twitter Virtualizer"
        authorUsername="@TwitterVirtualizer"
        authorIconUrl="/static/images/twv_icon.png"
      >
        <h1>Here's A Tweet Detail</h1>
        <Button variant="primary" onClick={props.onSlideFinish}>Finish Slide</Button>
      </TweetDetail>
    </Slide>
  );
};

const FeedTweetCopySlide = (props) => {
  return (
    <Slide {...props}>
      <FeedTweet
        authorName="Twitter Virtualizer"
        authorUsername="@TwitterVirtualizer"
        authorIconUrl="/static/images/twv_icon.png"
      >
        <h1>Here's A Feed Tweet Read This Thing</h1>
        <Button variant="primary" onClick={props.onSlideFinish}>Finish Slide</Button>
      </FeedTweet>
  </Slide>
  );
};

const AppSlide = (props) => {
  return (
    <Slide {...props}>
      <TweetDetail
        authorName="Twitter Virtualizer"
        authorUsername="@TwitterVirtualizer"
        authorIconUrl="/static/images/twv_icon.png"
        >
          <App
            secondsTilNextAppAvail={props.secondsTilNextAppAvail} 
            sampleAccounts={props.sampleAccounts} 
            errorMessage={props.errorMessage}
            captchaSiteKey={props.captchaSiteKey}
          />
        </TweetDetail>
    </Slide>
  );
};

export { AtlanticTweetSlide, TweetCopySlide, FeedTweetCopySlide, AppSlide }

