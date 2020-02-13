module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer:{
    host: '0.0.0.0',
    hot:true,
    port: 8080,
    overlay: {
      warnings: false,
      errors: false
    },
    proxy: {
      '/api2': {
        target: 'http://localhost:3000',
        pathRewrite:{'^/api2' : '/api2'}
      },
    },
  },
};