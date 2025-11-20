import React from 'react';
import TopNavigationBar from './TopNavigationBar';
import VerticalNavigationBar from './VerticalNavigationBar';
import Footer from './Footer';

interface VerticalLayoutProps {
  children: React.ReactNode;
}

const VerticalLayout: React.FC<VerticalLayoutProps> = ({ children }) => {
  return (
    <div className="wrapper">
      <TopNavigationBar />
      
      <div className="d-flex">
        <VerticalNavigationBar />
        
        <div className="main-content">
          <div className="content-wrapper">
            {children}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalLayout;