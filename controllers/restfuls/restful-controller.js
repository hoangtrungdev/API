const models = require('./../../models/index');
const restfulService  = require('./../../services/restful-service');

module.exports = {

  /**
   * @api {get} /restful/{modelName}/{modelName}/get-all Find All Model Data
   * @apiName restfulGetAll
   * @apiGroup Restful
   *
   *
   * @apiSuccess {Integer} status status.
   * @apiSuccess {String} message String message.
   * @apiSuccess {Object} data Data Object.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
	 *       "error":  false,
	 		     "message" : "success"
	 *       "data": Array/Object
	 *     }
   *
   * @apiError error Error if exists.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 404 Not Found
   *     {
	 		"status": 404,
	 		 "message" : "not found"
	 *       "data": "Socket hang up."
	 *     }
   */
  getAll: (req, res) => {
    const { modelName } = req.params;
    if (!models[modelName]){
      let _error = new Error('Invalid Model Name');
      return res.json({
        code: 500 ,
        message: _error.message,
        errors : _error.stack
      });
    }
    return restfulService.findAll(null, modelName, function(error, result){
      let dataReturn = {
        code: error ? 500 : 200 ,
        message: error ? error.message : 'Get data success.',
      };
      if(error) {
        dataReturn['errors'] = error;
      } else {
        dataReturn['data'] = result ;
      }
      return res.json(dataReturn);
    });
  },

  /**
   * @api {get} /restful/{modelName}/filter Filter Model Data
   * @apiName FilterGetAll
   * @apiGroup Restful
   *
   *
   * @apiSuccess {Integer} status status.
   * @apiSuccess {String} message String message.
   * @apiSuccess {Object} data Data Object.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
	 *       "error":  false,
	 		     "message" : "Get data success."
	 *       "data": Array/Object
	 *     }
   *
   * @apiError error Error if exists.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 404 Not Found
   *     {
	 		"status": 404,
	 		 "message" : "not found"
	 *       "data": "Socket hang up."
	 *     }
   */
  filter: (req, res) => {
    const { modelName } = req.params;
    if (!models[modelName]){
      let _error = new Error('Invalid Model Name');
      return res.json({
        code: 500 ,
        message: _error.message,
        errors : _error.stack
      });
    }
    const query = req.query;
    return restfulService.filter(null, modelName, query, function(error, result){
      let dataReturn = {
        code: error ? 500 : 200 ,
        message: error ? error.message : 'Get data success.',
      };
      if(error) {
        dataReturn['errors'] = error;
      } else {
        dataReturn['data'] = result ;
      }
      return res.json(dataReturn);
    });
  },

  /**
   * @api {get} /restful/{modelName}/get-by-id/:primaryId Get Model Data By Id
   * @apiName getById
   * @apiGroup Restful
   *
   *
   * @apiSuccess {Integer} status status.
   * @apiSuccess {String} message String message.
   * @apiSuccess {Object} data Data Object.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
	 *       "error":  false,
	 		     "message" : "Get data success."
	 *       "data": Array/Object
	 *     }
   *
   * @apiError error Error if exists.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 404 Not Found
   *     {
	 		"status": 404,
	 		 "message" : "not found"
	 *       "data": "Socket hang up."
	 *     }
   */
  getById: (req, res) => {
    const { modelName, primaryId } = req.params;
    if (!models[modelName]){
      let _error = new Error('Invalid Model Name');
      return res.json({
        code: 500 ,
        message: _error.message,
        errors : _error.stack
      });
    }
    const query = req.query;
    return restfulService.findOne(null, modelName, primaryId, query, function(error, result){
      let dataReturn = {
        code: error ? 500 : 200 ,
        message: error ? error.message : 'Get data success.',
      };
      if(error) {
        dataReturn['errors'] = error;
      } else {
        dataReturn['data'] = result ;
      }
      return res.json(dataReturn);
    });
  }
};