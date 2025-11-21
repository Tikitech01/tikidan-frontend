import React from 'react';
import { Typography, Box } from '@mui/material';

const Clients: React.FC = () => {
  return (
    <>
      {/* Full Width Clients Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">CLIENTS</h1>
        </div>
      </div>

      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 2,
          p: 3,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontSize: '1.2rem', fontWeight: 600, color: '#333' }}>
          Clients
        </Typography>
      </Box>
    </>
  );
};

export default Clients;