/**
 * Register Page Component
 */
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/authStore';
import type { RegisterData, UserRole } from '../types/auth';

// Validation schema
const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens and underscores'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    full_name: z.string().optional(),
    role: z.enum(['viewer', 'developer', 'admin']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'viewer',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData as RegisterData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo/Title */}
          <Typography component="h1" variant="h4" gutterBottom fontWeight="bold">
            ETL Builder
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Create your account
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }} onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Register Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
            <TextField
              fullWidth
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus
              margin="normal"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              id="username"
              label="Username"
              autoComplete="username"
              margin="normal"
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              id="full_name"
              label="Full Name (Optional)"
              autoComplete="name"
              margin="normal"
              {...register('full_name')}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              margin="normal"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              margin="normal"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              select
              id="role"
              label="Role"
              margin="normal"
              {...register('role')}
              error={!!errors.role}
              helperText={errors.role?.message || 'Select your role (default: viewer)'}
              disabled={isLoading}
              defaultValue="viewer"
            >
              <MenuItem value="viewer">Viewer - View pipelines only</MenuItem>
              <MenuItem value="developer">Developer - Create and edit pipelines</MenuItem>
              <MenuItem value="admin">Admin - Full access</MenuItem>
            </TextField>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
              startIcon={<PersonAdd />}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
          © 2025 ETL Builder. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
}
