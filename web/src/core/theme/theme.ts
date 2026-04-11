import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#2563EB' },
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
    warning: { main: '#F97316' },
    secondary: { main: '#9333EA' },
    background: { default: '#F9FAFB', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Instrument Sans", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 4px rgba(0,0,0,.08)', borderRadius: 12 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { '& th': { fontWeight: 600, backgroundColor: '#F3F4F6' } },
      },
    },
  },
});
