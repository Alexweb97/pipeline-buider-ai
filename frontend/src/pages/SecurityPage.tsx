/**
 * Security Page Component - Security Analysis & Monitoring
 */
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Security,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  VpnKey,
  Shield,
  BugReport,
  Lock,
  Visibility,
  Code,
  Storage,
  ArrowBack,
  Login,
  Computer,
  History,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { usePipelineStore } from '../stores/pipelineStore';
import securityApi, {
  SecurityStatistics,
  SecurityEvent,
  LoginHistoryItem,
  ActiveSession,
  UserActivity,
  AuditEvent,
} from '../api/security';
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
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SecurityPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pipelines, fetchPipelines } = usePipelineStore();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Security data state
  const [statistics, setStatistics] = useState<SecurityStatistics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const [statsRes, eventsRes, loginRes, sessionsRes, activityRes, auditRes] = await Promise.all([
          securityApi.getStatistics(7),
          securityApi.getSecurityEvents(undefined, 50, 7),
          securityApi.getLoginHistory(50, 7),
          securityApi.getActiveSessions(),
          securityApi.getUserActivity(undefined, 50, 7),
          securityApi.getAuditLog(undefined, undefined, 50, 7),
        ]);

        setStatistics(statsRes);
        setSecurityEvents(eventsRes.events);
        setLoginHistory(loginRes.logins);
        setActiveSessions(sessionsRes.sessions);
        setUserActivity(activityRes.activities);
        setAuditLog(auditRes.events);
      } catch (error: any) {
        console.error('Failed to fetch security data:', error);
        toast.error(error.data?.detail || 'Failed to load security data');
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
    fetchPipelines().catch(() => {});
  }, [fetchPipelines]);

  const securityScore = statistics?.security_score || 0;
  const criticalCount = statistics?.security_issues.critical || 0;
  const highCount = statistics?.security_issues.high || 0;
  const mediumCount = statistics?.security_issues.medium || 0;
  const lowCount = statistics?.security_issues.low || 0;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.warning.main;
      case 'medium':
        return theme.palette.info.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon />;
      case 'high':
        return <Warning />;
      case 'medium':
        return <Info />;
      case 'low':
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Security sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Security Center
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor and improve your data pipeline security
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Security Score Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }}
                >
                  <Shield sx={{ fontSize: 32 }} />
                </Box>
                <Chip
                  label={securityScore >= 80 ? 'Good' : securityScore >= 60 ? 'Fair' : 'At Risk'}
                  color={securityScore >= 80 ? 'success' : securityScore >= 60 ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {securityScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Security Score
              </Typography>
              <LinearProgress
                variant="determinate"
                value={securityScore}
                sx={{
                  mt: 2,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={0} sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: 'error.main',
                    mr: 2,
                  }}
                >
                  <ErrorIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {criticalCount + highCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical & High
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={0} sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: 'warning.main',
                    mr: 2,
                  }}
                >
                  <Warning />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {mediumCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Medium Issues
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={0} sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    mr: 2,
                  }}
                >
                  <CheckCircle />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {pipelines.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitored Pipelines
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
            <Tab label={`Issues (${securityEvents.length})`} icon={<BugReport />} iconPosition="start" />
            <Tab label={`Login History (${loginHistory.length})`} icon={<Login />} iconPosition="start" />
            <Tab label={`Active Sessions (${activeSessions.length})`} icon={<Computer />} iconPosition="start" />
            <Tab label={`Audit Log (${auditLog.length})`} icon={<History />} iconPosition="start" />
            <Tab label="Best Practices" icon={<CheckCircle />} iconPosition="start" />
            <Tab label="Compliance" icon={<Shield />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {securityEvents.length === 0 ? (
            <Alert severity="success" icon={<CheckCircle />}>
              <Typography variant="subtitle1" fontWeight="bold">
                No Security Issues Found
              </Typography>
              <Typography variant="body2">
                Your pipelines are following security best practices. Keep monitoring for new issues.
              </Typography>
            </Alert>
          ) : (
            <List>
              {securityEvents.map((event, index) => (
                <Box key={event.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      py: 2,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(getSeverityColor(event.severity), 0.1),
                          color: getSeverityColor(event.severity),
                        }}
                      >
                        {getSeverityIcon(event.severity)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {event.title}
                          </Typography>
                          <Chip
                            label={event.severity.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: alpha(getSeverityColor(event.severity), 0.1),
                              color: getSeverityColor(event.severity),
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                            }}
                          />
                          <Chip label={event.category} size="small" variant="outlined" />
                          <Chip label={event.status.toUpperCase()} size="small" color={event.status === 'resolved' ? 'success' : 'warning'} />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {event.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {event.resource_type}: {event.resource_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Login History Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>IP Address</strong></TableCell>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loginHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No login history available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  loginHistory.map((login) => (
                    <TableRow key={login.id} hover>
                      <TableCell>{login.username}</TableCell>
                      <TableCell>{login.email}</TableCell>
                      <TableCell>{login.ip_address}</TableCell>
                      <TableCell>{new Date(login.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={login.status}
                          size="small"
                          color={login.status === 'success' ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Active Sessions Tab */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Started</strong></TableCell>
                  <TableCell><strong>Last Activity</strong></TableCell>
                  <TableCell><strong>IP Address</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No active sessions
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  activeSessions.map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell>{session.username}</TableCell>
                      <TableCell>{session.email}</TableCell>
                      <TableCell>{new Date(session.started_at).toLocaleString()}</TableCell>
                      <TableCell>{new Date(session.last_activity).toLocaleString()}</TableCell>
                      <TableCell>{session.ip_address}</TableCell>
                      <TableCell>{session.location}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Audit Log Tab */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                  <TableCell><strong>Resource</strong></TableCell>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>IP Address</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLog.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No audit log entries
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLog.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>{entry.username}</TableCell>
                      <TableCell>
                        <Chip label={entry.action} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{entry.resource_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.resource_type}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{entry.ip_address}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Best Practices Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={2}>
            {[
              { icon: <VpnKey />, title: 'Use Strong Authentication', desc: 'Implement multi-factor authentication for all users' },
              { icon: <Lock />, title: 'Encrypt Data at Rest', desc: 'Enable encryption for all stored data and backups' },
              { icon: <Visibility />, title: 'Implement Access Control', desc: 'Use role-based access control (RBAC) for pipeline access' },
              { icon: <Code />, title: 'Validate Input Data', desc: 'Always validate and sanitize input data to prevent injection attacks' },
              { icon: <Storage />, title: 'Secure Credentials', desc: 'Store credentials in encrypted vaults, never in code' },
              { icon: <Shield />, title: 'Regular Security Audits', desc: 'Perform regular security audits and penetration testing' },
            ].map((practice, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: 'success.main',
                          flexShrink: 0,
                        }}
                      >
                        {practice.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                          {practice.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {practice.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Compliance Tab */}
        <TabPanel value={tabValue} index={5}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Compliance monitoring helps ensure your data pipelines meet regulatory requirements like GDPR, HIPAA, and SOC 2.
          </Alert>

          <Grid container spacing={3}>
            {statistics && [
              { name: 'GDPR', status: statistics.compliance.gdpr, items: 'Data residency, Right to erasure' },
              { name: 'HIPAA', status: statistics.compliance.hipaa, items: 'PHI encryption, Access logs' },
              { name: 'SOC 2', status: statistics.compliance.soc2, items: 'Audit trails, Backup procedures' },
              { name: 'PCI DSS', status: statistics.compliance.pci_dss, items: 'Cardholder data protection' },
            ].map((compliance, index) => {
              const getStatusColor = (status: string) => {
                if (status.toLowerCase().includes('compliant')) return 'success';
                if (status.toLowerCase().includes('partial')) return 'warning';
                return 'error';
              };

              return (
                <Grid item xs={12} md={6} key={index}>
                  <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {compliance.name}
                        </Typography>
                        <Chip
                          label={compliance.status}
                          color={getStatusColor(compliance.status) as any}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Required controls: {compliance.items}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>
      </Card>

      {/* Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
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
    </DashboardLayout>
  );
}
