module.exports = {
  purge: [
    './index.html',
    './public/**/*.html',
    './src/ui/**/*.{vue,js,ts,jsx,tsx}',
  ],
  mode: 'jit',
  important: true,
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    groupLevel: 10,
    groupScope: 'scope',
    groupVariants: ['hover', 'focus', 'focus-visible'],
    colors: {
      green: ({ opacityValue }) => {
        return `rgba(36, 150, 129, ${opacityValue})`;
      },
      success: ({ opacityValue }) => {
        return `rgba(234, 245, 243, ${opacityValue})`;
      },
      pink: ({ opacityValue }) => {
        return `rgba(236, 173, 169, ${opacityValue})`;
      },
      yellow: ({ opacityValue }) => {
        return `rgba(255, 205, 25, ${opacityValue})`;
      },
      warning: ({ opacityValue }) => {
        return `rgba(255, 250, 232, ${opacityValue})`;
      },
      red: ({ opacityValue }) => {
        return `rgba(245, 107, 88, ${opacityValue})`;
      },
      error: ({ opacityValue }) => {
        return `rgba(245, 234, 234, ${opacityValue})`;
      },
      dark: ({ opacityValue }) => {
        return `rgba(19, 20, 26, ${opacityValue})`;
      },
      grey: ({ opacityValue }) => {
        return `rgba(151, 152, 171, ${opacityValue})`;
      },
      white: ({ opacityValue }) => {
        return `rgba(252, 252, 252, ${opacityValue})`;
      },
      light: ({ opacityValue }) => {
        return `rgba(248, 248, 252, ${opacityValue})`;
      },
      inherit: 'inherit',
      initial: 'initial',
      transparent: 'transparent',
    },
    screens: {
      xs: '500px',
      sm: '640px',
      md: '768px',
      desktop: '900px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      spacing: {
        1.25: '0.3125rem',
        4.5: '1.125rem',
        5.5: '1.375rem',
        7.5: '1.875rem',
        10.5: '2.625rem',
        15: '3.75rem',
        17.5: '4.375rem',
        21.5: '5.375rem',
      },
      lineHeight: {
        1.07: '1.07em',
      },
      letterSpacing: {
        '-0.01': '-0.01em',
        '-0.03': '-0.03em',
        0.06: '0.06em',
      },
      borderRadius: {
        2.5: '0.625rem',
        3.5: '0.875rem',
        4.5: '1.125rem',
      },
      fontSize: {
        7: '1.75rem',
        9.5: '2.375rem',
        12.5: '3.125rem',
      },
      maxWidth: {
        80: '20rem',
        150: '37.5rem',
      },
      boxShadow: {
        cardLg: '0px 0px 24px rgba(46, 46, 46, 0.12)',
        input: '0px 2px 10px rgba(151, 152, 171, 0.25)',
        inputHover: '0px 2px 10px rgba(151, 152, 171, 0.4)',
        btnPrimary: '0px 4px 16px rgba(19, 20, 26, 0.4)',
        btnSecondary: '0px 4px 16px rgba(248, 200, 197, 0.4)',
        btnAlternate: '0px 4px 16px rgba(151, 152, 171, 0.2)',
        btnGhost: '0px 4px 16px rgba(151, 152, 171, 0.2)',
        btnDanger: '0px 4px 16px rgba(245, 107, 88, 0.4)',
      },
      outline: {
        green: '2px solid #249681',
      },
      fontFamily: {
        bcmsFont: ['Hergon Grotesk', 'sans-serif'],
      },
      zIndex: {
        100: '100',
        200: '200',
        1000: '1000',
        1000000: '1000000',
      },
      cursor: {
        grab: 'grab',
        grabbing: 'grabbing',
      },
    },
  },
  plugins: [require('tailwindcss-nested-groups')],
};
