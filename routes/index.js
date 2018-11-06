const express = require('express');
const router = express.Router();
const models = require("../models");
const Sequelize  = require("sequelize");
const phantom = require('phantom');
const cheerio = require('cheerio');

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

router.get('/test-phantom', async function(req, res, next) {
  const instance = await phantom.create();
  const page = await instance.createPage();
  let arrRequest = [];
  await page.on('onResourceRequested', function(requestData) {
    arrRequest.push(requestData.url)
  });

  const status = await page.open('https://www.chudu24.com/');
  const content = await page.property('content');
  let $ = cheerio.load(content);
  let dataReturn = {
     listKhuyenMai : []
  };
  $('.topDealsInfo').each((index, item) => {
    dataReturn.listKhuyenMai.push(`Top khuyến mãi ${index + 1 } : ${$("a", item).text()}`);
  });

  res.json({
    code: 200,
    message: "Get data success.",
    data: dataReturn
  });

  await instance.exit();
});



module.exports = router;
