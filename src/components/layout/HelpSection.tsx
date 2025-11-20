import React from 'react';
import { Icon } from '@iconify/react';

const HelpSection: React.FC = () => {
  const handleUpgradeClick = () => {
    console.log('Upgrade to pro clicked');
    // Add your upgrade logic here
    // You could redirect to a pricing page or open a modal
    // window.location.href = '/pricing';
  };

  return (
    <div className="help-box text-center">
      <div className="help-content">
        <div className="help-icon">
          <Icon icon="mdi:star-outline" style={{ fontSize: '2rem', color: '#fbcc5c' }} />
        </div>
        <h5 className="help-title">Unlimited Access</h5>
        <p className="help-description">
          Upgrade to our Pro plan to get access to unlimited reports, advanced features, and priority support.
        </p>
        <button 
          className="btn btn-success btn-sm help-upgrade-btn"
          onClick={handleUpgradeClick}
        >
          <Icon icon="mdi:arrow-up-bold" className="me-1" />
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default HelpSection;