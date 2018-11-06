const express = require('express');
const router = express.Router();
const restfulController = require('./../controllers/restfuls/restful-controller');

//localhost:3001/restful/Bank/get-all
router.get('/:modelName/get-all', restfulController.getAll);
//localhost:3001/restful/Bank/filter?limit=10&bankname=LIKE|techcombank
router.get('/:modelName/filter', restfulController.filter);
//localhost:3001/restful/Bank/get-by-id/EA7FB4CB-8BCB-4A9C-BEFE-CFCDAD5CCC96
router.get('/:modelName/get-by-id/:primaryId', restfulController.getById);

module.exports = router;