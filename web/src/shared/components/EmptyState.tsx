import { Box, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message = 'Sin resultados', icon }: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      gap={1.5}
      color="text.secondary"
    >
      {icon ?? <InboxOutlined sx={{ fontSize: 48, opacity: 0.4 }} />}
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}
