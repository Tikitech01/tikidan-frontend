import React from 'react';
import TopNavigationBar from './TopNavigationBar';
import VerticalNavigationBar from './VerticalNavigationBar';
import Footer from './Footer';

interface VerticalLayoutProps {
  children: React.ReactNode;
}

const VerticalLayout: React.FC<VerticalLayoutProps> = ({ children }) => {
  return (
    <div className="wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNavigationBar />
      
      <div className="d-flex" style={{ flex: 1, minHeight: 0 }}>
        <VerticalNavigationBar />
        
        <div className="main-content" style={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          position: 'relative'
        }}>
          <div className="content-wrapper" style={{ 
            flex: 1,
            padding: '1rem',
            paddingBottom: '80px',
            overflowY: 'auto',
            minHeight: 0
          }}>
            {children}
          </div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000
          }}>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalLayout;