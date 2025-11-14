/**
 * Settings Page
 */
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Security as SecurityIcon,
  Notifications,
  Palette,
  Language,
  Edit as EditIcon,
  Save,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.full_name || '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pipelineSuccess: true,
    pipelineFailure: true,
    securityAlerts: true,
    weeklyReport: false,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
  });

  const handleProfileSave = () => {
    // TODO: Implement profile update API call
    toast.success('Profile updated successfully');
    setEditMode(false);
  };

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [setting]: event.target.checked,
    });
    toast.success('Notification preferences updated');
  };

  return (
    <DashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ bgcolor: 'white' }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your account settings and preferences
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Profile" icon={<Person />} iconPosition="start" />
              <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
              <Tab label="Notifications" icon={<Notifications />} iconPosition="start" />
              <Tab label="Appearance" icon={<Palette />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Button variant="outlined" startIcon={<EditIcon />} disabled>
                    Change Avatar
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                  {!editMode ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleProfileSave}
                      >
                        Save
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({ ...profileData, username: e.target.value })
                      }
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.fullName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, fullName: e.target.value })
                      }
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={user?.role?.toUpperCase()}
                      disabled
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Password
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  For security reasons, password changes require verification.
                </Alert>
                <Button variant="outlined" disabled>
                  Change Password
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add an extra layer of security to your account
                </Typography>
                <Button variant="outlined" disabled>
                  Enable 2FA
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Active Sessions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You can view and manage your active sessions in the Security page
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/security')}>
                  View Sessions
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Email Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={handleNotificationChange('emailNotifications')}
                    />
                  }
                  label="Enable email notifications"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Pipeline Notifications
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.pipelineSuccess}
                        onChange={handleNotificationChange('pipelineSuccess')}
                        disabled={!notifications.emailNotifications}
                      />
                    }
                    label="Pipeline execution success"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.pipelineFailure}
                        onChange={handleNotificationChange('pipelineFailure')}
                        disabled={!notifications.emailNotifications}
                      />
                    }
                    label="Pipeline execution failure"
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Security Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.securityAlerts}
                      onChange={handleNotificationChange('securityAlerts')}
                      disabled={!notifications.emailNotifications}
                    />
                  }
                  label="Security alerts and warnings"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Reports
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.weeklyReport}
                      onChange={handleNotificationChange('weeklyReport')}
                      disabled={!notifications.emailNotifications}
                    />
                  }
                  label="Weekly activity report"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Appearance Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Theme
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={appearance.theme}
                    label="Theme"
                    onChange={(e) =>
                      setAppearance({ ...appearance, theme: e.target.value })
                    }
                    disabled
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Language
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={appearance.language}
                    label="Language"
                    onChange={(e) =>
                      setAppearance({ ...appearance, language: e.target.value })
                    }
                    disabled
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Date Format
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={appearance.dateFormat}
                    label="Date Format"
                    onChange={(e) =>
                      setAppearance({ ...appearance, dateFormat: e.target.value })
                    }
                    disabled
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
