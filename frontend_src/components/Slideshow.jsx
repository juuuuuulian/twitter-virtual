import React, { Component } from 'react';

const Slide = (props) => {
  const onHideFinish = props.onHideFinish;
  const onShowFinish = props.onShowFinish;
  const onSlideFinish = props.onSlideFinish;
  const animationState = props.animationState;
  const outAnimation = props.outAnimation;
  const inAnimation = props.inAnimation;
  const waitAnimation = props.waitAnimation;
  const className = props.className;
  let children = React.Children.toArray(props.children);

  const animationEndHandler = (evt) => {
      let animationName = evt.animationName;
      if (inAnimation.indexOf(animationName) != -1)
          onShowFinish(evt)
      if (outAnimation.indexOf(animationName) != -1)
          onHideFinish(evt)
  };

  let classes = ["slide", className];
  if (animationState == "in") {
      classes.push(inAnimation);
  } else if (animationState == "out") {
      classes.push(outAnimation);
  } else {
      classes.push(waitAnimation);
  }

  return (
      <div className={classes.join(' ')} onAnimationEnd={animationEndHandler}>
          { children.map((child) => React.cloneElement(child, { onSlideFinish: onSlideFinish })) }
      </div>
  );
};

const Slideshow = (props) => {
  const [currentIndex, setCurrentIndex] = React.useState(props.initialSlideIndex || 0);
  const [animationState, setAnimationState] = React.useState("in");
  const inAnimation = props.inAnimation;
  const outAnimation = props.outAnimation;
  const waitAnimation = props.waitAnimation;
  let children = React.Children.toArray(props.children);

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
              children.map((child, index) => {
                  if (currentIndex == index) {
                      let slideOut = child.props.outAnimation || outAnimation;
                      let slideIn = child.props.inAnimation || inAnimation;
                      let slideWait = child.props.waitAnimation || waitAnimation;

                      return React.cloneElement(child, { 
                          outAnimation: slideOut,
                          inAnimation: slideIn,
                          waitAnimation: slideWait,
                          slideIndex: index,
                          animationState: animationState,
                          onShowFinish: onShowFinish,
                          onHideFinish: onHideFinish,
                          onSlideFinish: onSlideFinish
                      });
                  }
              })
          }
      </>
  );
};

export { Slide, Slideshow }
