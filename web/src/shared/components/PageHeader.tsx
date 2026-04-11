import { Box, Typography, Button, type ButtonProps } from '@mui/material';

interface Action extends ButtonProps {
  label: string;
}

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: Action[];
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
      <Box>
        {title && (
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box display="flex" gap={1}>
          {actions.map(({ label, ...props }, i) => (
            <Button key={i} variant="contained" {...props}>
              {label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}
