import { Box, InputBase } from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...', width = 260 }: SearchBarProps) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      border: '1px solid #E2E8F0', borderRadius: '6px',
      px: 1.5, py: 0.75, bgcolor: '#F8FAFC', width,
      '&:focus-within': { borderColor: '#2563EB', bgcolor: 'white', boxShadow: '0 0 0 3px rgba(37,99,235,0.10)' },
    }}>
      <Search sx={{ fontSize: 16, color: '#94A3B8' }} />
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{ fontSize: 13.5, flex: 1, '& input::placeholder': { color: '#94A3B8' } }}
      />
    </Box>
  );
}
