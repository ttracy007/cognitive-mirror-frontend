import React from 'react';

const OnboardingProgress = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="onboarding-progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="progress-text">
        Question {current} of {total}
      </p>
    </div>
  );
};

export default OnboardingProgress;