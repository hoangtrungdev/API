const models = require('./../models/index');

const exportObj = {
  findAll: (transaction, modelName, callback) => models[modelName].findAll({transaction: transaction, limit: 1000})
    .then((results) => callback(null, results))
    .catch((err) => callback(err))
  ,
  filter: (transaction, modelName, params, callback) => {
    try {

      if (!params) {
        return exportObj.findAll(transaction, modelName);
      }
      // console.error('models[modelName]', models[modelName]);
      let where = {}, includePamams = getIncludeModelOption(modelName, params),
        limit = 1000;
      if (params.limit) {
        limit = params.limit;
        delete params.limit;
      }

      for (const key in params) {
        const value = params[key];
        if (value) {
          if (typeof value != 'string' || value.indexOf('|') == -1) { where[key] = value; }
          else {
            const arr = value.split('|');
            switch (arr[0]) {
              case 'LIKE': { where[key] = { $like: `%${arr[1]}%` }; break; }
              case 'IN': { where[key] = { $in: arr[1].split(',') }; break; }
              case 'NOTIN': { where[key] = { $notIn: arr[1].split(',') }; break; }
              case 'NOTNULL': { where[key] = { $ne: null }; break; }
              case 'ISNULL': { where[key] = { $eq: null }; break; }
              default : { let keySpec = `$`+ arr[0]; console.error('keySpec', keySpec, arr[1]);
                where[key] = {}; where[key][keySpec] = arr[1]; break; }

            }
          }
        }
      }

      return models[modelName].findAll({ where, limit: parseInt(limit), transaction: transaction
        ,include: includePamams
      })
        .then((results) => callback(null, results))
        .catch((err) => callback(err));

    } catch(ex){
      return callback(ex);
    }
  },
  findOne: (transaction, modelName, primaryId, params, callback) => {
    let includePamams = getIncludeModelOption(modelName, params);
    return models[modelName].findOne({ where: { id: primaryId }, transaction: transaction, include: includePamams})
      .then((results) => callback(null, results))
      .catch((err) => callback(err))
  }
};

const getIncludeModelOption =(modelName, params) => {
  let includePamams = [];
  let where = {};

  // include
  if(params && params.includes){
    const arrIncludes = params.includes.split('|');
    delete params.includes;
      arrIncludes.forEach(modelQuery=>{
          let arrmodelQuery = modelQuery.split('~');
          if(arrmodelQuery[1]){
            let arrTam = arrmodelQuery[1].split('=');
            where[arrTam[0]] = arrTam[1];
          }
          let includeItem = { model: models[arrmodelQuery[0]], where: where};
          includePamams.push(includeItem);
      });
  }
  return includePamams;
};

module.exports = exportObj;
