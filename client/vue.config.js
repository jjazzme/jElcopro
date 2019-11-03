module.exports = {
    devServer:{
        host: 'localhost',
        hot:true,
        port: 8080,
        //sourceMap: true,
        //sourceMapPathOverrides:{
        //    "webpack:///*": "${webRoot}/*",
        //    "webpack:///./*": "${webRoot}/*",
        //    "webpack:///src/*": "${webRoot}/src/*"
        //},
        //open: 'Chrome',
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                pathRewrite:{'^/api' : '/api'}
            },
            //https://cli.vuejs.org/guide/html-and-static-assets.html#disable-index-generation
            /*
            '/*':{ //everything from root
                target: 'http://localhost:3000',
                secure: false,
                ws: false,
            },
            '/ws/': { //web sockets
                target: 'http://localhost:3000',
                secure: false,
                ws: true
            },
            '!/':{ //except root, which is served by webpack's devserver, to faciliate instant updates
                target: 'http://localhost:3000/',
                secure: false,
                ws: false
            },
             */
        }
    },
}