import { Box, Drawer, IconButton, Typography, Divider } from '@mui/material';
import { Close } from '@mui/icons-material';

interface FormDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export function FormDrawer({ open, title, onClose, children, width = 440 }: FormDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>{children}</Box>
    </Drawer>
  );
}
