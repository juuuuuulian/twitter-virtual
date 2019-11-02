import React, { Component } from 'react';

const TwitterUserImage = (props) => {
  const handleLoadFailure = (ev) => {
    if (ev.target.src != props.fallbackImgSrc)
      ev.target.src = props.fallbackImgSrc;
  };

  return <img src={props.src} onError={handleLoadFailure} className="rounded-circle" />
};

export { TwitterUserImage }