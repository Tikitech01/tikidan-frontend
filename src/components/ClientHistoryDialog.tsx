import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  SwapHoriz as TransferIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface Creator {
  name?: string;
  email?: string;
}

interface Transfer {
  from?: {
    name?: string;
    email?: string;
  };
  to?: {
    name?: string;
    email?: string;
  };
  transferredAt?: string;
}

interface ClientHistoryDialogProps {
  open: boolean;
  clientName?: string;
  createdBy?: Creator;
  createdAt?: string;
  transferHistory?: Transfer[];
  onClose: () => void;
}

const ClientHistoryDialog: React.FC<ClientHistoryDialogProps> = ({
  open,
  clientName,
  createdBy,
  createdAt,
  transferHistory,
  onClose,
}) => {
  const getCreatorName = (creator?: Creator) => {
    if (!creator) return 'Unknown';
    return creator.name || creator.email || 'Unknown';
  };

  const getTransferName = (person?: any) => {
    if (!person) return 'Unknown';
    if (typeof person === 'string') return person;
    return person.name || person.email || 'Unknown';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{clientName} - History</Typography>
        <CloseIcon
          onClick={onClose}
          sx={{ cursor: 'pointer', fontSize: 20 }}
        />
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box>
          {/* Creation Event */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <PersonAddIcon />
              </Box>
              {transferHistory && transferHistory.length > 0 && (
                <Box
                  sx={{
                    width: 2,
                    height: 40,
                    backgroundColor: '#e5e7eb',
                    mt: 1,
                  }}
                />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Client Created
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Created by: <strong>{getCreatorName(createdBy)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(createdAt)}
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Transfer Events */}
          {transferHistory && transferHistory.length > 0 ? (
            transferHistory.map((transfer, index) => (
              <Box key={index} sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <TransferIcon />
                  </Box>
                  {index < (transferHistory?.length || 0) - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        height: 40,
                        backgroundColor: '#e5e7eb',
                        mt: 1,
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: '#fef3c7' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Client Transferred
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      From: <strong>{getTransferName(transfer.from)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      To: <strong>{getTransferName(transfer.to)}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(transfer.transferredAt)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No transfers yet
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientHistoryDialog;
