/**
 * Tema visual compartilhado do app.
 * Ele cria uma identidade mais forte para a apresentacao, evitando a aparencia padrao do template.
 */
export const theme = {
  colors: {
    background: '#F5EFE6',
    backgroundStrong: '#E8DDD1',
    surface: '#FFF9F2',
    surfaceStrong: '#F3E7D6',
    primary: '#165A69',
    primaryDark: '#0D3B44',
    accent: '#D95D39',
    accentSoft: '#F3B49F',
    secondary: '#F4A259',
    success: '#2F8F83',
    warning: '#F0B24A',
    danger: '#C44536',
    text: '#12323A',
    textMuted: '#63757A',
    border: '#DFCDBC',
    white: '#FFFFFF',
    shadow: 'rgba(18, 50, 58, 0.12)',
    overlay: 'rgba(13, 59, 68, 0.5)'
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 40
  },
  radii: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999
  },
  typography: {
    display: 'SpaceGrotesk_700Bold',
    heading: 'Manrope_700Bold',
    body: 'Manrope_500Medium',
    bodyStrong: 'Manrope_700Bold'
  }
} as const;
