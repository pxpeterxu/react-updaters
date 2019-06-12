module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // Target client-side browserslist defaults
        targets: 'defaults',
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
};
