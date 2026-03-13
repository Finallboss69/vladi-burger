'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const setAuth = useAuthStore((s) => s.setAuth);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Handle Google OAuth callback token
  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const error = searchParams.get('error');

    if (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error,
      });
      // Clean URL
      router.replace('/login');
      return;
    }

    if (token) {
      const redirect = searchParams.get('redirect') ?? '/';
      // Set token in store, then fetch user data
      useAuthStore.setState({ token, isAuthenticated: true });
      fetchMe().then(() => {
        addNotification({
          type: 'success',
          title: 'Bienvenido!',
          message: name
            ? `Iniciaste sesion como ${name}`
            : 'Iniciaste sesion con Google',
        });
        router.replace(redirect);
      });
    }
  }, [searchParams, addNotification, fetchMe, router]);

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalido';
    }
    if (!password.trim()) {
      newErrors.password = 'La contrasena es obligatoria';
    } else if (password.length < 4) {
      newErrors.password = 'Minimo 4 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const role = await login(email, password);
    setLoading(false);

    if (role) {
      const roleRedirects: Record<string, string> = {
        ADMIN: '/admin',
        KITCHEN: '/cocina',
        DELIVERY: '/delivery',
      };
      addNotification({
        type: 'success',
        title: 'Bienvenido!',
        message: 'Iniciaste sesion correctamente',
      });
      router.push(roleRedirects[role] ?? '/');
    } else {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Email o contrasena incorrectos',
      });
    }
  }

  function handleGoogleLogin() {
    setGoogleLoading(true);
    window.location.href = '/api/auth/google';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
    >
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Iniciar sesion
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Ingresa a tu cuenta para pedir
          </p>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex w-full h-11 items-center justify-center gap-2.5 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-primary)] text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-transparent" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          {googleLoading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border-color)]" />
          <span className="text-xs font-medium text-[var(--text-muted)]">o</span>
          <div className="h-px flex-1 bg-[var(--border-color)]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            iconLeft={<Mail className="h-4 w-4" />}
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tu contrasena"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              iconLeft={<Lock className="h-4 w-4" />}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[38px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex justify-end">
            <Link
              href="#"
              className="text-sm text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80"
            >
              Olvidaste tu contrasena?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="mt-2 w-full"
          >
            Ingresar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            No tenes cuenta?{' '}
            <Link
              href="/registro"
              className="font-semibold text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF6B35] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
