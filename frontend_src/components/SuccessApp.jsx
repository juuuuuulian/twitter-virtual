/* eslint-disable import/extensions */
import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import PropTypes from 'prop-types';
import Footer from './Footer.jsx';

const SuccessApp = (props) => {
  const { newListUrl } = props;

  return (
    <>
      <div className="index-cont">
        <div className="index-head header-copy">
          <h1 className="display-4">Thanks For Trying Our Application!</h1>
          <div className="alert alert-success clearfix">
            <div>
              <span className="success-check">✓</span>
            </div>
            <div className="success-copy">
              <div>
                <a href={newListUrl} target="_blank" rel="noreferrer">
                  Click here
                </a>
                {' '}
                to view your new virtual feed, or look under the &apos;Lists&apos; section in your
                Twitter application
              </div>
              <div>
                To view your Twitter settings page and revoke our app access,
                {' '}
                <a href="https://twitter.com/settings/connected_apps" target="_blank" rel="noreferrer">click here</a>
              </div>
              <div>
                We appreciate feedback!
                {' '}
                <a href="mailto:twitter.virtual.app@gmail.com">Send us an e-mail with your thoughts!</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

SuccessApp.propTypes = {
  newListUrl: PropTypes.string,
};

SuccessApp.defaultProps = {
  newListUrl: 'twitter.com',
};

export default hot(SuccessApp);
