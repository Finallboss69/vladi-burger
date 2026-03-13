'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
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

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegistroPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalido';
    }
    if (phone && !/^[+\d\s()-]{7,20}$/.test(phone)) {
      newErrors.phone = 'Telefono invalido';
    }
    if (!password.trim()) {
      newErrors.password = 'La contrasena es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'Minimo 6 caracteres';
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu contrasena';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contrasenas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const success = await register(name, email, password, phone || undefined);
    setLoading(false);

    if (success) {
      addNotification({
        type: 'success',
        title: 'Cuenta creada!',
        message: 'Tu cuenta fue creada exitosamente',
      });
      router.push('/');
    } else {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear la cuenta. El email ya puede estar en uso.',
      });
    }
  }

  function handleGoogleRegister() {
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
            Crear cuenta
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Registrate para empezar a pedir
          </p>
        </div>

        {/* Google Register */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          className="flex w-full h-11 items-center justify-center gap-2.5 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-primary)] text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-transparent" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          {googleLoading ? 'Conectando...' : 'Registrate con Google'}
        </button>

        <div className="my-1 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border-color)]" />
          <span className="text-xs font-medium text-[var(--text-muted)]">o</span>
          <div className="h-px flex-1 bg-[var(--border-color)]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre completo"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError('name'); }}
            error={errors.name}
            iconLeft={<User className="h-4 w-4" />}
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            error={errors.email}
            iconLeft={<Mail className="h-4 w-4" />}
            autoComplete="email"
          />

          <Input
            label="Telefono (opcional)"
            type="tel"
            placeholder="+54 11 1234-5678"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
            error={errors.phone}
            iconLeft={<Phone className="h-4 w-4" />}
            autoComplete="tel"
          />

          <div className="relative">
            <Input
              label="Contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimo 6 caracteres"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
              error={errors.password}
              iconLeft={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[38px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirmar contrasena"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repetir contrasena"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
              error={errors.confirmPassword}
              iconLeft={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-[38px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              tabIndex={-1}
              aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="mt-2 w-full"
          >
            Crear cuenta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Ya tenes cuenta?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80"
            >
              Iniciar sesion
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
