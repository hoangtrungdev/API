const phantom = require('phantom');
const cheerio = require('cheerio');

module.exports = {
  testPhantom: async function(req, res, next) {
    const instance = await phantom.create();
    const page = await instance.createPage();
    let arrRequest = [];
    await page.on('onResourceRequested', function(requestData) {
      arrRequest.push(requestData.url)
    });

    const status = await page.open('https://www.chudu24.com/');
    const content = await page.property('content');
    let $ = cheerio.load(content);

    const getContent = async () => {
      let dataReturn = {
        status : status,
        topDiemDen : []
      };
      const arrProcces = [];
      $('.ddlTopCitiesTD').each((index, item) => {

        const pr = new Promise(async (resovle, reject) => {
          let cityName = $(".CityName a", item).attr('title');
          let link = $(".CityName a", item).attr('href');

          let instanceCity = await phantom.create();
          let pageCity = await instanceCity.createPage();
          let statusCityPage = await pageCity.open('https://www.chudu24.com/');
          let contentCityPage = await pageCity.property('content');
          let $city = cheerio.load(contentCityPage);

          dataReturn.topDiemDen.push({
            cityName : cityName,
            link : link ,
            status : statusCityPage
          });
          await instanceCity.exit();
          return resovle({
            cityName : cityName,
            link : link ,
            status : statusCityPage
          });
        });
        arrProcces.push(pr);
      });
      dataReturn = await Promise.all(arrProcces);
      return dataReturn;
    };

    res.json({
      code: 200,
      message: "Get data success.",
      data: await getContent()
    });

    await instance.exit();
  }
};
