import React, { Component } from 'react';
import PropTypes from 'prop-types';

const Slide = (props) => {
  const {
    onHideFinish, onShowFinish, onSlideFinish, animationState, outAnimation, inAnimation,
    waitAnimation, className, children,
  } = props;
  const childrenArray = React.Children.toArray(children);

  const animationEndHandler = (evt) => {
    const { animationName } = evt;
    if (inAnimation.indexOf(animationName) !== -1) onShowFinish(evt);
    if (outAnimation.indexOf(animationName) !== -1) onHideFinish(evt);
  };

  const classes = ['slide', className];
  if (animationState === 'in') {
    classes.push(inAnimation);
  } else if (animationState === 'out') {
    classes.push(outAnimation);
  } else {
    classes.push(waitAnimation);
  }

  return (
    <div className={classes.join(' ')} onAnimationEnd={animationEndHandler}>
      { childrenArray.map((child) => React.cloneElement(child, { onSlideFinish })) }
    </div>
  );
};

Slide.propTypes = {
  onHideFinish: PropTypes.func,
  onShowFinish: PropTypes.func,
  onSlideFinish: PropTypes.func,
  animationState: PropTypes.string,
  outAnimation: PropTypes.string,
  inAnimation: PropTypes.string,
  waitAnimation: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.array,
};

const Slideshow = (props) => {
  const {
    inAnimation, outAnimation, waitAnimation, initialSlideIndex, children,
  } = props;
  const [currentIndex, setCurrentIndex] = React.useState(initialSlideIndex || 0);
  const [animationState, setAnimationState] = React.useState('in');
  const childrenArray = React.Children.toArray(children);

  // hide animation finish callback
  const onHideFinish = () => {
    setCurrentIndex(currentIndex + 1);
    setAnimationState('in');
  };

  // show animation finish callback
  const onShowFinish = () => {
    setAnimationState('wait');
  };

  // slide finished callback
  const onSlideFinish = () => {
    setAnimationState('out');
  };

  return (
    <>
      {
              childrenArray.map((child, index) => {
                if (currentIndex === index) {
                  const slideOut = child.props.outAnimation || outAnimation;
                  const slideIn = child.props.inAnimation || inAnimation;
                  const slideWait = child.props.waitAnimation || waitAnimation;

                  return React.cloneElement(child, {
                    outAnimation: slideOut,
                    inAnimation: slideIn,
                    waitAnimation: slideWait,
                    slideIndex: index,
                    animationState,
                    onShowFinish,
                    onHideFinish,
                    onSlideFinish,
                  });
                }
                return null;
              })
          }
    </>
  );
};

Slideshow.propTypes = {
  outAnimation: PropTypes.string,
  inAnimation: PropTypes.string,
  waitAnimation: PropTypes.string,
  children: PropTypes.any,
  initialSlideIndex: PropTypes.number,
};

export { Slide, Slideshow };
