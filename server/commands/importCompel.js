'use strict';

import axios from 'axios';
import fs from 'fs';

module.exports.run = async () => {
    const response = await axios.get(global.gConfig.companies.compel.stores.main.url, { responseType: 'stream' });
    const file = fs.createWriteStream('./storage.st.zip');
    await response.data.pipe(file);
};