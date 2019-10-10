var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  return res.send('Received a GET HTTP method');
});
router.post('/', (req, res) => {
  return res.send('Received a POST HTTP method');
});
router.put('/', (req, res) => {
  return res.send('Received a PUT HTTP method');
});
router.delete('/', (req, res) => {
  return res.send('Received a DELETE HTTP method');
});

router.get('/table', (req, res) => {
  const obj = {a:1, b:2, c: {t: 'fsdfsdff', f:i=>i+1}};
  var json = JSON.stringify(obj, function(key, value) {
    if (typeof value === "function") {
      return "/Function(" + value.toString() + ")/";
    }
    return value;
  })
  return res.send(json);
});

module.exports = router;
