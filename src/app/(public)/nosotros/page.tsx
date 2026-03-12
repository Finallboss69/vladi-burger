'use client';

import { motion } from 'framer-motion';
import {
  Flame,
  Heart,
  Users,
  Award,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const values = [
  {
    icon: Flame,
    title: 'Calidad Premium',
    description:
      'Usamos ingredientes frescos y locales. Nuestra carne es 100% vacuna, nuestros panes son artesanales y nuestras salsas son caseras.',
    color: '#FF6B35',
  },
  {
    icon: Heart,
    title: 'Pasion por las Burgers',
    description:
      'Cada hamburguesa la hacemos con amor y dedicacion. No es solo comida, es una experiencia que queremos que disfrutes.',
    color: '#D62828',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description:
      'Creemos en construir una comunidad de amantes de las burgers. Por eso creamos el builder, las creaciones y los eventos.',
    color: '#2D6A4F',
  },
  {
    icon: Award,
    title: 'Innovacion',
    description:
      'Siempre estamos buscando nuevos sabores, combinaciones y formas de sorprenderte. La creatividad es nuestro ingrediente secreto.',
    color: '#F5CB5C',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
};

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3E2723] via-[#3E2723]/95 to-[#FF6B35]/80 py-24 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block text-6xl"
          >
            🍔
          </motion.span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Nuestra Historia
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80 leading-relaxed">
            De un sueno entre amigos a la mejor burger de la ciudad.
            Somos Vladi.burger y esta es nuestra historia.
          </p>
        </motion.div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FF6B35]/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5" />
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeInUp} className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              Como empezo todo
            </h2>
            <div className="flex flex-col gap-4 text-[var(--text-secondary)] leading-relaxed">
              <p>
                Todo comenzo en 2024, cuando Vladi decidio que las hamburguesas que comia
                no estaban a la altura de lo que el imaginaba. Con una plancha prestada,
                un par de recetas experimentales y mucha pasion, nacio la primera
                Vladi.burger en una cocina entre amigos.
              </p>
              <p>
                Lo que empezo como un hobby se convirtio rapidamente en una obsesion.
                Cada salsa fue probada decenas de veces, cada pan fue perfeccionado hasta
                lograr la textura ideal, y cada corte de carne fue seleccionado con el
                mismo cuidado que un chef de alta cocina.
              </p>
              <p>
                Hoy, Vladi.burger no es solo una hamburgueseria. Es un punto de
                encuentro para los que creen que una buena burger puede cambiar un mal
                dia. Es una comunidad de personas que valoran la calidad, la creatividad
                y el buen comer.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[var(--bg-secondary)] py-16">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              Nuestros Valores
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Lo que nos mueve cada dia
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col items-center gap-4 rounded-2xl bg-[var(--bg-primary)] p-6 text-center shadow-sm border border-[var(--border-color)] transition-shadow hover:shadow-lg"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${value.color}15` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: value.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            {...fadeInUp}
            className="flex flex-col items-center gap-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 sm:flex-row sm:items-start sm:p-12"
          >
            {/* Avatar placeholder */}
            <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#D62828] text-5xl shadow-lg">
              👨‍🍳
            </div>
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Vladi
              </h2>
              <p className="text-sm font-medium text-[#FF6B35]">
                Fundador & Chef
              </p>
              <p className="leading-relaxed text-[var(--text-secondary)]">
                &ldquo;Mi sueno siempre fue crear algo que hiciera feliz a la gente.
                Cuando veo a alguien morder una de nuestras burgers y sonreir, se que
                estamos haciendo las cosas bien. Cada ingrediente esta pensado para que
                esa experiencia sea unica.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact / Location */}
      <section className="bg-gradient-to-br from-[#3E2723] to-[#3E2723]/90 py-16 text-white">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Encontranos</h2>
            <p className="mt-2 text-white/70">
              Veni a visitarnos o escribinos
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MapPin,
                label: 'Direccion',
                value: 'Av. Corrientes 1234, CABA',
              },
              {
                icon: Phone,
                label: 'Telefono',
                value: '+54 11 2345-6789',
              },
              {
                icon: Mail,
                label: 'Email',
                value: 'hola@vladiburger.com',
              },
              {
                icon: Clock,
                label: 'Horario',
                value: 'Lun-Sab 11-23hs, Dom 12-22hs',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-5 w-5 text-[#FF6B35]" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium">{item.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Social */}
          <motion.div
            {...fadeInUp}
            className="mt-12 flex justify-center"
          >
            <a
              href="https://instagram.com/vladi.burger"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/20"
            >
              <Instagram className="h-5 w-5" />
              @vladi.burger
            </a>
          </motion.div>
        </div>
      </section>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
