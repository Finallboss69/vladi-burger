// Centralized restaurant configuration
// Change these values to customize the app for your restaurant

export const RESTAURANT = {
  name: 'Vladi.burger',
  shortName: 'Vladi',
  tagline: 'Hamburguesas Artesanales',
  slogan: 'Las mejores hamburguesas artesanales',
  description: 'Las mejores hamburguesas artesanales. Pedí online, armá tu propia burger y disfrutá.',
  keywords: ['hamburguesas', 'artesanales', 'delivery', 'buenos aires'],

  // Contact info
  address: 'Av. Corrientes 1234, CABA',
  phone: '+54 11 2345-6789',
  email: 'hola@vladiburger.com',
  instagram: 'vladi.burger',
  instagramUrl: 'https://instagram.com/vladi.burger',

  // Operating hours
  hours: [
    'Lun-Jue 11-23h',
    'Vie-Sab 11-00h',
    'Dom 12-22h',
  ],
  hoursShort: 'Lun-Sab 11-23hs, Dom 12-22hs',

  // Branding
  primaryColor: '#FF6B35',
  secondaryColor: '#D62828',

  // Founder / About page
  founder: {
    name: 'Vladi',
    title: 'Fundador & Chef',
    story: [
      'Todo comenzo en 2024, cuando Vladi decidio que las hamburguesas que comia no estaban a la altura de lo que el imaginaba. Con una plancha prestada, un par de recetas experimentales y mucha pasion, nacio la primera Vladi.burger en una cocina entre amigos.',
      'Lo que empezo como un hobby se convirtio rapidamente en una obsesion. Cada salsa fue probada decenas de veces, cada pan fue perfeccionado hasta lograr la textura ideal, y cada corte de carne fue seleccionado con el mismo cuidado que un chef de alta cocina.',
      'Hoy, Vladi.burger no es solo una hamburgueseria. Es un punto de encuentro para los que creen que una buena burger puede cambiar un mal dia. Es una comunidad de personas que valoran la calidad, la creatividad y el buen comer.',
    ],
    quote: 'Mi sueno siempre fue crear algo que hiciera feliz a la gente. Cuando veo a alguien morder una de nuestras burgers y sonreir, se que estamos haciendo las cosas bien. Cada ingrediente esta pensado para que esa experiencia sea unica.',
  },

  // Payment
  currency: 'ARS' as const,
  locale: 'es-AR' as const,
  paymentDescriptor: 'VLADI BURGER',
} as const
