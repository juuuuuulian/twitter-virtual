import React, { Component } from 'react';
import PropTypes from 'prop-types';

const TwitterUserImage = (props) => {
  const {
    size, fallbackImgSrc, src, ...other
  } = props;
  let primarySrc = src;

  const handleLoadFailure = (ev) => {
    const { target } = ev;
    if (fallbackImgSrc && target.src.indexOf(fallbackImgSrc) === -1) {
      target.src = fallbackImgSrc;
    }
  };

  // set src to desired image size (normal, bigger, mini)
  // https://developer.twitter.com/en/docs/accounts-and-users/user-profile-images-and-banners
  // we expect a props.src with no size specified
  if (size) {
    const imageFileName = primarySrc.split('/').pop();
    const newImageFileName = imageFileName.replace('.', `_${size}.`); // 'normal' -> '_normal.'

    primarySrc = src.replace(imageFileName, newImageFileName);
  }

  return <img {...other} src={primarySrc} onError={handleLoadFailure} alt="" />;
};

TwitterUserImage.propTypes = {
  src: PropTypes.string,
  size: PropTypes.string,
  fallbackImgSrc: PropTypes.string,
};

export default TwitterUserImage;
