module.exports = {
  mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
  entry: {
    main: './src/index.js',
    worker: './src/worker.js',
  },
};
