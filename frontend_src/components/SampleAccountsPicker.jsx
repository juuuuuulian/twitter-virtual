import React, { Component } from 'react';
import { Button, Card } from 'react-bootstrap';

const SampleAccountCard = (props) => {
  return (
      <Card>
          <Card.Img 
              variant="top" 
              src={props.profileImgUrl} 
          />
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

const SampleAccountsPicker = (props) => {
  // based on CardDeck
  return <div className="sample-acct-picker">
      {props.accounts.map((account) => 
          <SampleAccountCard 
              name={account.name} 
              username={account.username} 
              following={account.following} 
              profileImgUrl={account.profile_img_url} 
              clickHandler={props.optionClickHandler} 
          />
      )}
  </div>
};

export { SampleAccountsPicker }