const express = require('express');
const router = express.Router();
const models = require("../models");
const Sequelize  = require("sequelize");
const {testPhantom, testPuppeteer, testGetChoTot} = require('../controllers/index/test-controller');
const moment = require('moment');

/* GET home page. */
router.get('/',(req, res) => {
  res.write('API running... ' + moment().format('DD/MM/YYYY hh:mm:ss'));
  res.end();
});

router.get('/test-mysql',(req, res) => {
  models.query("SELECT * FROM test", { type: Sequelize.QueryTypes.SELECT})
    .then(myTableRows => {
      res.json({
        code: 200,
        message: "Get data success.",
        data : myTableRows
      })
    })
    .catch(err =>{
      res.json({
        code: 500,
        message: err.message,
        errors: err
      })
    });

});

router.get('/test', function(req, res, next) {
  models.test.findAll()
    .then(myTableRows => {
      res.json({
        code: 200,
        message: "Get data success.",
        data : myTableRows
      })
    })
    .catch(err =>{
      res.json({
        code: 200,
        message: err.name,
        errors: err
      })
    });

});

router.get('/test-phantom', testPhantom);

/** http://localhost:5555/test-puppeteer */
router.get('/test-puppeteer', testPuppeteer);

router.get('/test-get-cho-tot', testGetChoTot);



module.exports = router;
