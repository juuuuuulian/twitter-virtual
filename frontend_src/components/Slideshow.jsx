import React, { Component } from 'react';

const Slide = (props) => {
  const onHideFinish = props.onHideFinish;
  const onShowFinish = props.onShowFinish;
  const onSlideFinish = props.onSlideFinish;
  const animationState = props.animationState;
  const outAnimation = props.outAnimation;
  const inAnimation = props.inAnimation;
  const waitAnimation = props.waitAnimation;

  const animationEndHandler = (evt) => {
      let animationName = evt.animationName;
      if (inAnimation.indexOf(animationName) != -1)
          onShowFinish(evt)
      if (outAnimation.indexOf(animationName) != -1)
          onHideFinish(evt)
  };

  let classes = ["slide"];
  if (animationState == "in") {
      classes.push(inAnimation);
  } else if (animationState == "out") {
      classes.push(outAnimation);
  } else {
      classes.push(waitAnimation);
  }

  return (
      <div className={classes.join(' ')} onAnimationEnd={animationEndHandler}>
          { React.cloneElement(props.children, { onSlideFinish: onSlideFinish }) }
      </div>
  );
};

const Slideshow = (props) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [animationState, setAnimationState] = React.useState("in");
  const inAnimation = props.inAnimation;
  const outAnimation = props.outAnimation;
  const waitAnimation = props.waitAnimation;

  // hide animation finish callback
  const onHideFinish = () => {
      setCurrentIndex(currentIndex + 1);
      setAnimationState("in");
  };

  // show animation finish callback
  const onShowFinish = () => {
      setAnimationState("wait");
  };

  // slide finished callback
  const onSlideFinish = () => {
      setAnimationState("out");
  };

  return (
      <>
          {
              props.children.map((child, index) => {
                  if (currentIndex == index) {
                      return <Slide
                          slideIndex={index}
                          inAnimation={inAnimation} 
                          outAnimation={outAnimation} 
                          waitAnimation={waitAnimation} 
                          animationState={animationState} 
                          onShowFinish={onShowFinish} 
                          onHideFinish={onHideFinish} 
                          onSlideFinish={onSlideFinish}
                      >
                          {child}
                      </Slide>
                  }
              })
          }
      </>
  );
};

export { Slide, Slideshow }
