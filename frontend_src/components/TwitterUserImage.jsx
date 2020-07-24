import React, { Component } from 'react';

const TwitterUserImage = (props) => {
  let src = props.src;
  const size = props.size;
  const fallbackImgSrc = props.fallbackImgSrc;

  const handleLoadFailure = (ev) => {
    if (ev.target.src != fallbackImgSrc && fallbackImgSrc)
      ev.target.src = fallbackImgSrc;
  };

  // set src to desired image size
  // https://developer.twitter.com/en/docs/accounts-and-users/user-profile-images-and-banners
  // we expect a props.src with no size specified
  if (size) {
    let imageFileName = src.split('/').pop();
    let newImageFileName = imageFileName;

    if (size == 'normal') {
      newImageFileName = imageFileName.replace('.', '_normal.');
    } else if (size == 'bigger') {
      newImageFileName = imageFileName.replace('.', '_bigger.');
    } else if (size == 'mini') {
      newImageFileName = imageFileName.replace('.', '_mini.');
    }

    src = src.replace(imageFileName, newImageFileName);
  }

  return <img src={src} onError={handleLoadFailure} className={props.className} />
};

export { TwitterUserImage }
