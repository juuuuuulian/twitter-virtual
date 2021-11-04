import React, { Component } from 'react';
import GitHubIcon from '../images/GitHub-Mark-Light-120px-plus.png';

const Footer = () => (
  <div className="index-footer">
    <a href="https://www.theatlantic.com/technology/archive/2019/04/twitter-is-not-america/587770/" target="_blank" rel="noreferrer">Inspiration</a>
    <a href="https://github.com/juuuuuulian/twitter-virtual" target="_blank" rel="noreferrer">
      <img alt="GitHub Repository" src={GitHubIcon} className="img-fluid" />
    </a>
    <span>&copy; 2019</span>
  </div>
);

export default Footer;
