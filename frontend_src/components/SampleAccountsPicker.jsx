import React, { Component } from 'react';
import { Button, Card } from 'react-bootstrap';
import { TwitterUserImage } from './TwitterUserImage.jsx';

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

const AccountListItem = (props) => {
    const clickHandler = () => props.clickHandler(props.username)

    return (
        <div className="d-flex account-list-item align-items-center mb-2">
            <div className="mr-2">
                <TwitterUserImage 
                    src={props.profileImgUrl} 
                    className="rounded-circle" 
                    size="normal" 
                    fallbackImgSrc={"/static/images/tw_icon.png"} 
                />
            </div>
            <div className="mr-3">
                <div className="tweet-author-name">
                    <a className="text-decoration-none text-reset" href={"http://twitter.com/" + props.username} target="_blank">
                        {props.name}
                    </a>
                </div>
                <div className="tweet-author-username">
                    <a className="text-decoration-none text-reset" href={"http://twitter.com/" + props.username} target="_blank">
                        @{props.username}
                    </a>
                </div>
            </div>
            <div className="ml-auto d-none d-md-block d-lg-block d-xl-block">
                <Button variant="outline-primary" className="rounded-pill" onClick={clickHandler}>
                    Try Account
                </Button>
            </div>
        </div>
    );
};

const ListAccountPicker = (props) => {
    return (
        <div className="list-account-picker">
            { props.accounts.map((account) => 
                <AccountListItem
                    name={account.name}
                    username={account.username}
                    followingCount={account.following}
                    profileImgUrl={account.profile_img_url}
                    clickHandler={props.optionClickHandler}
                />
            )}
        </div>
    )
};

export { CardDeckAccountPicker, ListAccountPicker }