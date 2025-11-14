/**
 * Transformations Page Component - Coming Soon
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
import { Transform, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

export default function TransformationsPage() {
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
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: 'success.main',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Transform sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Transformations
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              This feature is coming soon. You can add transformations to your pipelines using the Pipeline Builder modules.
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
                onClick={() => navigate('/pipeline-builder')}
              >
                Open Pipeline Builder
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
