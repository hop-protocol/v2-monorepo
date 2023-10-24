module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          zlib: require.resolve('zlib-browserify')
        }
      }
    }
  }
}
