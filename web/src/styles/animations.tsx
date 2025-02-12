import { keyframes, css, SerializedStyles, Keyframes } from '@emotion/react'; // @emotion/react ^11.11.0
import React from 'react';

// Animation Duration Constants
export const ANIMATION_DURATION_FAST = '150ms';
export const ANIMATION_DURATION_NORMAL = '300ms';
export const ANIMATION_DURATION_SLOW = '500ms';

// Animation Easing Functions
export const ANIMATION_EASING_DEFAULT = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const ANIMATION_EASING_ACCELERATE = 'cubic-bezier(0.4, 0, 1, 1)';
export const ANIMATION_EASING_DECELERATE = 'cubic-bezier(0, 0, 0.2, 1)';

// Accessibility Media Query
export const ANIMATION_REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

// Animation Options Interface
interface AnimationOptions {
  duration?: string;
  delay?: string;
  timingFunction?: string;
  iterationCount?: string | number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

interface TransitionOptions {
  duration?: string;
  easing?: string;
  delay?: string;
  properties?: string[];
}

// Default animation values
const ANIMATION_DEFAULTS = {
  duration: '1s',
  delay: '0s',
  timingFunction: 'ease',
  iterationCount: '1',
  direction: 'normal' as const,
  fillMode: 'none' as const
};

// Keyframe Animations
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

export const slideInFromLeft = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

export const slideInFromRight = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

export const slideInFromTop = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`;

export const slideInFromBottom = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

export const scaleIn = keyframes`
  from { transform: scale(0); }
  to { transform: scale(1); }
`;

export const scaleOut = keyframes`
  from { transform: scale(1); }
  to { transform: scale(0); }
`;

export const rotate360 = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Animation Creation Helper
export const createAnimation = (
  name: Keyframes,
  options: AnimationOptions = {}
): SerializedStyles => {
  const {
    duration = ANIMATION_DEFAULTS.duration,
    delay = ANIMATION_DEFAULTS.delay,
    timingFunction = ANIMATION_DEFAULTS.timingFunction,
    iterationCount = ANIMATION_DEFAULTS.iterationCount,
    direction = ANIMATION_DEFAULTS.direction,
    fillMode = ANIMATION_DEFAULTS.fillMode
  } = options;

  return css`
    animation: ${name} ${duration} ${timingFunction} ${delay} ${iterationCount} ${direction} ${fillMode};
    will-change: transform, opacity;
    
    ${ANIMATION_REDUCED_MOTION} {
      animation: none;
      transition: none;
    }
  `;
};

// Transition Creation Helper
export const createTransition = (
  properties: string[],
  options: TransitionOptions = {}
): SerializedStyles => {
  const {
    duration = ANIMATION_DURATION_NORMAL,
    easing = ANIMATION_EASING_DEFAULT,
    delay = '0ms'
  } = options;

  const transitionValue = properties
    .map(prop => `${prop} ${duration} ${easing} ${delay}`)
    .join(', ');

  return css`
    transition: ${transitionValue};
    will-change: ${properties.join(', ')};
    
    ${ANIMATION_REDUCED_MOTION} {
      transition: none;
    }
  `;
};

// Animation Wrapper Component
interface AnimationWrapperProps {
  children: React.ReactNode;
  animation: Keyframes;
  options?: AnimationOptions;
  reducedMotion?: boolean;
}

export class AnimationWrapper extends React.Component<AnimationWrapperProps> {
  private readonly shouldReduceMotion: boolean;

  constructor(props: AnimationWrapperProps) {
    super(props);
    this.shouldReduceMotion = props.reducedMotion ?? (
      typeof window !== 'undefined' 
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
        : false
    );
  }

  applyAnimation(animationName: Keyframes): SerializedStyles {
    if (this.shouldReduceMotion) {
      return css`
        animation: none;
        transition: none;
      `;
    }

    return createAnimation(animationName, this.props.options);
  }

  render() {
    return (
      <div css={this.applyAnimation(this.props.animation)}>
        {this.props.children}
      </div>
    );
  }
}

// Common Animation Presets
export const fadeInAnimation = createAnimation(fadeIn);
export const fadeOutAnimation = createAnimation(fadeOut);
export const slideInLeftAnimation = createAnimation(slideInFromLeft);
export const slideInRightAnimation = createAnimation(slideInFromRight);
export const slideInTopAnimation = createAnimation(slideInFromTop);
export const slideInBottomAnimation = createAnimation(slideInFromBottom);
export const scaleInAnimation = createAnimation(scaleIn);
export const scaleOutAnimation = createAnimation(scaleOut);
export const rotateAnimation = createAnimation(rotate360, { iterationCount: 'infinite' });