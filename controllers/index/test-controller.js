const phantom = require('phantom');
const cheerio = require('cheerio');
const moment = require('moment');
const puppeteer = require('puppeteer');

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

    // function delay
    const delay = (ms) => new Promise(resovle => setTimeout(resovle, ms));

    const getContentCityPage = async () => {
      const arrProcess = [];
      $('.ddlTopCitiesTD').each((index, item) => {

        const process = new Promise(async (resovle) => {
          let cityName = $(".CityName a", item).attr('title');
          let link = $(".CityName a", item).attr('href');

          let instanceCity = await phantom.create();
          let pageCity = await instanceCity.createPage();
          let statusCityPage = await pageCity.open('https://www.chudu24.com/');
          await delay(1000);
          let contentCityPage = await pageCity.property('content');
          let $city = cheerio.load(contentCityPage);

          await instanceCity.exit();
          return resovle({
            cityName : cityName,
            link : link ,
            status : statusCityPage,
            contentCityPage : contentCityPage
          });
        });
        arrProcess.push(process);
      });

      return await Promise.all(arrProcess);
    };

    res.json({
      code: 200,
      message: "Get data success.",
      data:  {
        status : status,
        topDiemDen : await getContentCityPage()
      }
    });

    await instance.exit();
  },
  testPuppeteer: async function (req, res) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://chudu24.com');

    // Lấy danh sách top điểm đến
    let topDiemDen = await page.evaluate(() => {
      let dataReturn = [];
      $('.ddlTopCitiesTD').each((index, item) => {
        let cityName = $(".CityName a", item).attr('title');
        let link = $(".CityName a", item).attr('href');
        dataReturn.push({
          cityName : cityName,
          link : link
        })
      });
      return dataReturn;
    });

    // Tạo array process lấy chi tiết top điểm đến
    const arrayProcess = topDiemDen.map(async (item, index) => {
      console.log(`Chi tiết top điểm đến thứ ${index + 1 } ( ${item.cityName} : ${item.link} )`);
      let pageCity = await browser.newPage();
      await pageCity.goto('https:' + item.link);

      let dataDetail = await pageCity.evaluate(() => {
        let pageTitle = $('.page-top h1 a').text();
        let hotelList = [];
        $('.hotel-item').each((index, item) => {
          let hotelName = $('.post-features h2 a', item).html();
          let price = $('.price-zone .hotel-price', item).text();
          hotelList = [...hotelList, {
            hotelName : hotelName,
            price : price
          }];
        });
        return {
          pageTitle : pageTitle,
          hotelList : hotelList
        };
      });
      item = { ...item, ...dataDetail};
      // return Promise.resolve(item); ---- default async function là 1 Promise
      return item;
    });

    res.json({
      code: 200,
      message: "Get data success.",
      data:  {
        topDiemDen : await Promise.all(arrayProcess)
      }
    });
    await browser.close();

  }
};
const promiseWaterfall = (arrayTask) => {
  return arrayTask.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
      currentTask.then(currentResult =>
        [ ...chainResults, currentResult ]
      )
    );
  }, Promise.resolve([]));
};
