/**
 * Dashboard Page Component
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Dashboard as DashboardIcon,
  DataObject,
  Storage,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ETL Builder - Dashboard
          </Typography>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user?.full_name || user?.username}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {user?.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Role: {user?.role}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dashboard Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.full_name || user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Your role: <strong>{user?.role}</strong>
        </Typography>

        {/* Dashboard Cards */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DataObject sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6">Pipelines</Typography>
                </Box>
                <Typography variant="h3">0</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total ETL pipelines
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} fullWidth disabled>
                  Create Pipeline
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Storage sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Typography variant="h6">Data Sources</Typography>
                </Box>
                <Typography variant="h3">0</Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected data sources
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} fullWidth disabled>
                  Add Source
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DashboardIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Typography variant="h6">Active Jobs</Typography>
                </Box>
                <Typography variant="h3">0</Typography>
                <Typography variant="body2" color="text.secondary">
                  Running ETL jobs
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} fullWidth disabled>
                  View Jobs
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Start Guide */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Quick Start Guide
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome to ETL Builder! Here's how to get started:
            </Typography>
            <Box component="ol" sx={{ pl: 2 }}>
              <li>
                <Typography variant="body1">Connect your data sources (databases, APIs, files)</Typography>
              </li>
              <li>
                <Typography variant="body1">Design your ETL pipeline using the visual editor</Typography>
              </li>
              <li>
                <Typography variant="body1">Configure transformations and mappings</Typography>
              </li>
              <li>
                <Typography variant="body1">Schedule and monitor your pipeline executions</Typography>
              </li>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
