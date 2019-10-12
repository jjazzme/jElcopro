/*
var express = require('express');
var router = express.Router();

router.get('/table', (req, res) => {
    const obj = {a:1000, b:20000, c: {t: 'fsdfsdff', f:i=>i+1}};
    var json = JSON.stringify(obj, function(key, value) {
        if (typeof value === "function") {
            return "/Function(" + value.toString() + ")/";
        }
        return value;
    });
    return res.send(json);
});
*/
