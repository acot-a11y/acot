const createShadow = (...px) =>
  [
    `${px[0]}px ${px[1]}px ${px[2]}px ${px[3]}px rgba(0,0,0,0.2)`,
    `${px[4]}px ${px[5]}px ${px[6]}px ${px[7]}px rgba(0,0,0,0.14)`,
    `${px[8]}px ${px[9]}px ${px[10]}px ${px[11]}px rgba(0,0,0,0.12)`,
  ].join(',');

module.exports = {
  purge: ['./templates/**/*.html'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    boxShadow: {
      sm: createShadow(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0),
      DEFAULT: createShadow(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0),
      md: createShadow(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2),
      lg: createShadow(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3),
      xl: createShadow(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4),
      '2xl': createShadow(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5),
      '3xl': createShadow(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7),
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none',
    },
  },
};
