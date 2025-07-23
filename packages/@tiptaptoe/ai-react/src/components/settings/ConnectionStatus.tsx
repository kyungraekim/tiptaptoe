import React from 'react';
import { Alert } from '../../ui';

interface ConnectionStatusProps {
  status: 'idle' | 'success' | 'error';
  errorMessage?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  errorMessage,
}) => {
  if (status === 'idle') return null;

  return (
    <Alert
      variant={status === 'success' ? 'success' : 'error'}
      title={status === 'success' ? 'Connection successful!' : 'Connection failed'}
    >
      {errorMessage && status === 'error' && (
        <div style={{ marginTop: '4px' }}>
          {errorMessage}
        </div>
      )}
    </Alert>
  );
};