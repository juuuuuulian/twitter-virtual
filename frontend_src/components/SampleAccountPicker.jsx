/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from 'react-bootstrap';
import TwitterUserImage from './TwitterUserImage.jsx';
import TwitterVirtualizerIcon from '../images/twv_icon.png';

const SampleAccountListItem = (props) => {
  const {
    clickHandler, username, name, profileImgUrl,
  } = props;

  return (
    <a className="d-flex align-items-center list-group-item list-group-item-action account-picker-list-item" onClick={() => clickHandler(username)}>
      <div className="mr-2">
        <TwitterUserImage
          src={profileImgUrl}
          className="rounded-circle"
          size="normal"
          fallbackImgSrc={TwitterVirtualizerIcon}
        />
      </div>
      <div className="mr-3">
        <div className="tweet-author-name">
          {name}
        </div>
        <div className="tweet-author-username">
          @
          {username}
        </div>
      </div>
      <div className="ml-auto d-none d-sm-block d-md-block d-lg-block d-xl-block">
        <Button variant="outline-primary" className="rounded-pill account-picker-btn" onClick={clickHandler}>
          Try
        </Button>
      </div>
    </a>
  );
};

SampleAccountListItem.propTypes = {
  clickHandler: PropTypes.func,
  username: PropTypes.string,
  name: PropTypes.string,
  profileImgUrl: PropTypes.string,
};

const ListGroupSampleAccountPicker = (props) => {
  const { accounts, optionClickHandler } = props;
  return (
    <div className="account-picker-list-group list-group list-group-flush">
      { accounts.map((account) => (
        <SampleAccountListItem
          name={account.name}
          username={account.username}
          followingCount={account.following}
          profileImgUrl={account.profile_img_url}
          clickHandler={optionClickHandler}
        />
      ))}
    </div>
  );
};

ListGroupSampleAccountPicker.propTypes = {
  accounts: PropTypes.array,
  optionClickHandler: PropTypes.func,
};

// deprecated
const AccountCard = (props) => {
  const {
    profileImgUrl, name, username, following, clickHandler,
  } = props;
  return (
    <Card>
      <TwitterUserImage src={profileImgUrl} className="card-img-top" />
      <Card.Body>
        <div>
          <Card.Title>{name}</Card.Title>
        </div>
        <div>
          <Card.Text>
            Following&nbsp;
            {following}
            &nbsp;people
          </Card.Text>
        </div>
      </Card.Body>
      <Card.Footer>
        <Button
          className="sample-acct-btn"
          variant="primary"
          onClick={() => clickHandler(username)}
        >
          Try Account
        </Button>
      </Card.Footer>
    </Card>
  );
};

AccountCard.propTypes = {
  clickHandler: PropTypes.func,
  username: PropTypes.string,
  name: PropTypes.string,
  profileImgUrl: PropTypes.string,
  following: PropTypes.number,
};

// deprecated
// based on CardDeck
const CardDeckAccountPicker = (props) => {
  const { accounts, optionClickHandler } = props;
  return (
    <div className="sample-acct-picker">
      {accounts.map((account) => (
        <AccountCard
          name={account.name}
          username={account.username}
          following={account.following}
          profileImgUrl={account.profile_img_url}
          clickHandler={optionClickHandler}
        />
      ))}
    </div>
  );
};

CardDeckAccountPicker.propTypes = {
  accounts: PropTypes.array,
  optionClickHandler: PropTypes.func,
};

export default ListGroupSampleAccountPicker;
