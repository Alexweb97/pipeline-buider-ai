/**
 * Schedules Page Component - Coming Soon
 */
import {
  Box,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha,
  Button,
} from '@mui/material';
import { Schedule, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

export default function SchedulesPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Card
          elevation={0}
          sx={{
            maxWidth: 600,
            width: '100%',
            border: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                color: 'warning.main',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Schedule sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Schedules
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              This feature is coming soon. Schedule your pipelines to run automatically at specific times or intervals.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/pipelines')}
              >
                View Pipelines
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
