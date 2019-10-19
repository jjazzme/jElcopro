'use strict';

const models = require('../models');
const unzipper = require('unzipper')
const _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var fs = require('fs');


module.exports = {
    run: () => {
        console.log(process.cwd());

        let unzip = async function() {
            const zip = await unzipper.Open.file('temp/test_pass.zip');
            return new Promise( (resolve, reject) => {
                zip.files[0]
                    .stream('pass')
                    .pipe(fs.createWriteStream('temp/unzipped/firstFile'))
                    .on('error',reject)
                    .on('finish',resolve)
            });
        };

        unzip().then(ret=>console.log(ret))

        // server/temp
        //https://www.npmjs.com/package/unzipper
        /*
                fs.createReadStream('temp/test.zip')
                    .pipe(unzip.Parse())
                    .on('entry', function (entry) {
                        // if some legacy zip tool follow ZIP spec then this flag will be set
                        const isUnicode = entry.props.flags.isUnicode;
                        // decode "non-unicode" filename from OEM Cyrillic character set
                        const fileName = isUnicode ? entry.path : il.decode(entry.props.pathBuffer, 'cp866');
                        const type = entry.type; // 'Directory' or 'File'
                        const size = entry.vars.uncompressedSize; // There is also compressedSize;
                        if (fileName === "Текстовый файл.txt") {
                            entry.pipe(fs.createWriteStream(fileName));
                        } else {
                            entry.autodrain();
                        }

         */

    },

}


