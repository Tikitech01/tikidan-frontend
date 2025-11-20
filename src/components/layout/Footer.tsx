import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="footer" 
      style={{
        backgroundColor: '#ffffff',
        borderTop: '2px solid #dee2e6',
        padding: '1rem 1.5rem',
        marginTop: 'auto',
        width: '100%',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 100,
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ color: '#495057', fontSize: '0.875rem', fontWeight: '500' }}>
        © {currentYear} Tikidan SaaS. All rights reserved.
      </div>
      <div style={{ color: '#6c757d', fontSize: '0.875rem' }}>
        v1.0.0
      </div>
    </footer>
  );
};

export default Footer;