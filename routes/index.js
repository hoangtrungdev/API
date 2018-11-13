const express = require('express');
const router = express.Router();
const models = require("../models");
const Sequelize  = require("sequelize");
const testController = require('../controllers/index/test-controller');

/* GET home page. */
router.get('/', function(req, res, next) {
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

router.get('/test-phantom', testController.testPhantom);

router.get('/test-puppeteer', testController.testPuppeteer);

router.get('/test-get-cho-tot', testController.testGetChoTot);



module.exports = router;
