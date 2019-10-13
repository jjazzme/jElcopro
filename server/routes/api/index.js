var express = require('express');
var router = express.Router();

//<editor-fold desc="root">
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
//</editor-fold>

//<editor-fold desc="Table">


//</editor-fold>
module.exports = router;
