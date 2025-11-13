/**
 * Dashboard Page Component
 */
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  DataObject,
  Storage,
  Schedule,
  TrendingUp,
  PlayArrow,
  Add,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import DashboardLayout from '../components/DashboardLayout';

export default function DashboardPage() {
  const theme = useTheme();
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Total Pipelines',
      value: '0',
      change: '+0%',
      icon: <DataObject sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
    },
    {
      title: 'Data Sources',
      value: '0',
      change: '+0%',
      icon: <Storage sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      bgColor: alpha(theme.palette.secondary.main, 0.1),
    },
    {
      title: 'Active Jobs',
      value: '0',
      change: '0',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
    },
    {
      title: 'Success Rate',
      value: 'N/A',
      change: '0%',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
    },
  ];

  const recentActivity = [
    {
      title: 'No activity yet',
      description: 'Start by creating your first pipeline',
      time: '',
      status: 'pending',
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.full_name || user?.username}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your data pipelines today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: stat.bgColor,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: 'success.main',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      height: 'fit-content',
                    }}
                  >
                    {stat.change}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} lg={8}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get started with these common tasks
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      cursor: 'not-allowed',
                      opacity: 0.7,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          mr: 2,
                        }}
                      >
                        <Add />
                      </Box>
                      <Typography variant="subtitle1" fontWeight="600">
                        Create Pipeline
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Build a new ETL pipeline with our visual designer
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled
                      startIcon={<Add />}
                    >
                      New Pipeline
                    </Button>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      cursor: 'not-allowed',
                      opacity: 0.7,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.secondary.main,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: 'secondary.main',
                          mr: 2,
                        }}
                      >
                        <Storage />
                      </Box>
                      <Typography variant="subtitle1" fontWeight="600">
                        Add Data Source
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Connect to databases, APIs, or file systems
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled
                      startIcon={<Add />}
                    >
                      Add Source
                    </Button>
                  </Paper>
                </Grid>
              </Grid>

              {/* Getting Started Guide */}
              <Box sx={{ mt: 4, p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Getting Started Guide
                </Typography>
                <Box component="ol" sx={{ pl: 2, m: 0 }}>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Connect your first data source (database, API, or file)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Create a pipeline using the drag-and-drop visual editor
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Configure transformations and data mappings
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Schedule your pipeline and monitor executions
                    </Typography>
                  </li>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Latest pipeline executions
              </Typography>

              {recentActivity.map((activity, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        color: 'text.secondary',
                      }}
                    >
                      <PlayArrow />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="600">
                        {activity.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No pipeline executions yet
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
