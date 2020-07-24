import React, { Component } from 'react';
import { Button, Card } from 'react-bootstrap';
import { TwitterUserImage } from './TwitterUserImage.jsx';
import TwitterVirtualizerIcon from '../images/twv_icon.png';

const SampleAccountListItem = (props) => {
    const clickHandler = () => props.clickHandler(props.username);

    return (
        <a className="d-flex align-items-center list-group-item list-group-item-action account-picker-list-item" onClick={clickHandler}>
            <div className="mr-2">
                <TwitterUserImage
                    src={props.profileImgUrl}
                    className="rounded-circle"
                    size="normal"
                    fallbackImgSrc={TwitterVirtualizerIcon}
                />
            </div>
            <div className="mr-3">
                <div className="tweet-author-name">
                    {props.name}
                </div>
                <div className="tweet-author-username">
                    @{props.username}
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

const ListGroupSampleAccountPicker = (props) => {
    return (
        <div className="account-picker-list-group list-group list-group-flush">
            { props.accounts.map((account) =>
                <SampleAccountListItem
                    name={account.name}
                    username={account.username}
                    followingCount={account.following}
                    profileImgUrl={account.profile_img_url}
                    clickHandler={props.optionClickHandler}
                />
            )}
        </div>
    );
};


// deprecated
const AccountCard = (props) => {
  return (
      <Card>
        <TwitterUserImage src={props.profileImgUrl} className="card-img-top" />
        <Card.Body>
            <div>
                <Card.Title>{props.name}</Card.Title>
            </div>
            <div>
                <Card.Text>Following {props.following} people</Card.Text>
            </div>
        </Card.Body>
        <Card.Footer>
            <Button
                className="sample-acct-btn"
                variant="primary"
                onClick={() => props.clickHandler(props.username)}>
                Try Account
            </Button>
        </Card.Footer>
      </Card>
  );
};

// deprecated
const CardDeckAccountPicker = (props) => {
  // based on CardDeck
  return <div className="sample-acct-picker">
      {props.accounts.map((account) =>
          <AccountCard
              name={account.name}
              username={account.username}
              following={account.following}
              profileImgUrl={account.profile_img_url}
              clickHandler={props.optionClickHandler}
          />
      )}
  </div>
};

export { ListGroupSampleAccountPicker }
