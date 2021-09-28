/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Media, Container, Row, Col,
} from 'react-bootstrap';
import TwitterUserImage from './TwitterUserImage.jsx';
import {
  AnimatedReplyIcon, AnimatedShareIcon, AnimatedLikeIcon, AnimatedRetweetIcon,
} from './TweetIcon.jsx';

const TweetDetail = (props) => {
  const {
    authorName, authorUsername, authorIconUrl, children, iconClickAnimation = 'animated hinge',
  } = props;

  return (
    <div className="tweet-detail">
      <div className="tweet-meta d-flex">
        <div className="mr-1 tweet-author-img">
          <TwitterUserImage className="rounded-circle" src={authorIconUrl} />
        </div>
        <div className="ml-1 tweet-author">
          <div className="tweet-author-name">
            {authorName}
          </div>
          <div className="tweet-author-username">
            {authorUsername}
          </div>
        </div>
        <div className="ml-auto">
          Icon?
        </div>
      </div>
      <div className="ml-1 mt-2 tweet-body">
        <div>{children}</div>
      </div>
      <div className="ml-1 mt-2 mb-2 tweet-post-date">
        <span className="tweet-time">
          12:00 PM
        </span>
        <span className="spacer">·</span>
        <span className="tweet-date">
          Nov 7, 2019
        </span>
      </div>
      <div className="mt-2 tweet-interaction-icons d-flex justify-content-around">
        <div>
          <AnimatedReplyIcon clickAnimation={iconClickAnimation} />
        </div>
        <div>
          <AnimatedRetweetIcon clickAnimation={iconClickAnimation} />
        </div>
        <div>
          <AnimatedLikeIcon clickAnimation={iconClickAnimation} />
        </div>
        <div>
          <AnimatedShareIcon clickAnimation={iconClickAnimation} />
        </div>
      </div>
    </div>
  );
};

TweetDetail.propTypes = {
  authorName: PropTypes.string,
  authorUsername: PropTypes.string,
  authorIconUrl: PropTypes.string,
  children: PropTypes.any,
  iconClickAnimation: PropTypes.string,
};

const FeedTweet = (props) => {
  const {
    authorName, authorUsername, authorIconUrl, children, iconClickAnimation = 'animated hinge',
  } = props;

  return (
    <Media className="tweet">
      <div className="mr-3 tweet-img-container">
        <div className="mb-1">
          <TwitterUserImage className="rounded-circle" src={authorIconUrl} />
        </div>
        <div className="reply-stretch-line" />
      </div>
      <Media.Body>
        <div className="tweet-meta">
          <span className="tweet-author-name">
            {authorName}
          </span>
          <span>
            <span className="tweet-author-username">
              {authorUsername}
            </span>
            <span className="spacer">·</span>
            <time>∞</time>
          </span>
        </div>
        <div className="tweet-body">
          {children}
        </div>
        <Container className="mt-2 tweet-interaction-icons">
          <Row>
            <Col>
              <AnimatedReplyIcon clickAnimation={iconClickAnimation} />
            </Col>
            <Col>
              <AnimatedRetweetIcon clickAnimation={iconClickAnimation} />
            </Col>
            <Col>
              <AnimatedLikeIcon clickAnimation={iconClickAnimation} />
            </Col>
            <Col>
              <AnimatedShareIcon clickAnimation={iconClickAnimation} />
            </Col>
          </Row>
        </Container>
      </Media.Body>
    </Media>
  );
};

FeedTweet.propTypes = {
  authorName: PropTypes.string,
  authorUsername: PropTypes.string,
  authorIconUrl: PropTypes.string,
  children: PropTypes.any,
  iconClickAnimation: PropTypes.string,
};

const QuoteTweet = (props) => {
  const {
    authorName, authorUsername, authorIconUrl, children,
  } = props;
  return (
    <Media className="tweet quote-tweet">
      <div className="mr-3 tweet-img-container">
        <div className="mb-1">
          <TwitterUserImage className="rounded-circle" src={authorIconUrl} />
        </div>
        <div className="reply-stretch-line" />
      </div>
      <Media.Body>
        <div className="tweet-meta">
          <span className="tweet-author-name">
            {authorName}
          </span>
          <span>
            <span className="tweet-author-username">
              {authorUsername}
            </span>
            <span className="spacer">·</span>
            <time>∞</time>
          </span>
        </div>
        <div className="tweet-body">
          {children}
        </div>
      </Media.Body>
    </Media>
  );
};

QuoteTweet.propTypes = {
  authorName: PropTypes.string,
  authorUsername: PropTypes.string,
  authorIconUrl: PropTypes.string,
  children: PropTypes.any,
};

export { FeedTweet, TweetDetail, QuoteTweet };
