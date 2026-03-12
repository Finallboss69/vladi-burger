'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegistroPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
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
    await new Promise((r) => setTimeout(r, 1000));
    login(email, password);
    addNotification({
      type: 'success',
      title: 'Cuenta creada!',
      message: 'Bienvenido a Vladi.burger',
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
            Crear cuenta
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Unite a la familia Vladi.burger
          </p>
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
