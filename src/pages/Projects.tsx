import React from 'react';
import { Typography, Box } from '@mui/material';

const Projects: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 2,
        p: 3,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontSize: '1.2rem', fontWeight: 600, color: '#333' }}>
        Projects
      </Typography>
    </Box>
  );
};

export default Projects;