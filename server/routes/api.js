var models = require('../models')
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

router.get('/shell/:table/:userID', (req, res) => {
  // get shell
  const userID = req.params.userID;
  const table = req.params.table;

  models.tableShells.findAll({
    where:{
      user_id: userID,
      table: table
    }
  })
      .then(shell=>{
        res.send(shell);
      })
      .catch(err=>console.log(err));
});

router.put('/shell/:table/:userID', (req, res) => {
  // set shell
  const userID = req.params.userID;
  const table = req.params.table;
  const id = req.body.shell.id;

  if(id===0) {
      models.tableShells.create(
          {
              user_id: userID,
              table: table,
              version: req.body.shell.version,
              basket: req.body.shell.basket,
              columns: req.body.shell.columns,
              optics: req.body.shell.optics
          })
          .then(shell=>{
              res.send(shell.dataValues);
          })
          .catch(err=>console.log(err))
  } else {
      models.tableShells.upsert(
          {
              id: id,
              user_id: userID,
              table: table,
              version: req.body.shell.version,
              basket: req.body.shell.basket,
              columns: req.body.shell.columns,
              optics: req.body.shell.optics
          })
          .then(ok=>{
              res.send(ok);
          })
          .catch(err=>console.log(err))
  }


});

router.put('/model-get/:model/:userID/:page', (req, res) => {
  const userID = req.params.userID;
  const model = req.params.model;

  const optics = req.body.optics;
  const columns = req.body.columns;

  const page = req.params.page;
  const pageSize = optics.pageSize ? optics.pageSize : 15;
  const offset = (page-1) * pageSize;
  const limit = offset + pageSize;

  models[model].findAndCountAll({
      limit: limit,
      offset: offset,
  })
      .then(resp=>{
        res.send(resp);
      })
      .catch(err=>{
        console.log(err);
      });


});

//</editor-fold>
module.exports = router;
