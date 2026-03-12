'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));
    login(email, password);
    addNotification({
      type: 'success',
      title: 'Bienvenido!',
      message: 'Iniciaste sesion correctamente',
    });
    setLoading(false);
    router.push('/');
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
