const phantom = require('phantom');
const cheerio = require('cheerio');
const moment = require('moment');
const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request');

const download = function(uri, filename){
  return new Promise((resolve) =>{
      request.head(uri,() => {
        request(uri).pipe(fs.createWriteStream(filename)).on('close',() => {
          return resolve();
        });
      });
    }
  )
};




module.exports = {
  testPhantom: async function(req, res) {
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
    const VIEWPORT = { width: 1280, height: 1080 };
    const browser = await puppeteer.launch({
      // headless: false,
      // slowMo : 500,
      // args: [
      //   '--window-size=1280,1000'
      // ]
    });
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
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
    // function getDetail
    getDetail = async (item, index) => {
      await page.goto('https:' + item.link);

      let dataDetail = await page.evaluate(() => {
        let pageTitle = $('.page-top h1 a').text();
        let hotelList = [];
        $('.hotel-item').each((index, item) => {
          let hotelName = $('.post-features h2 a', item).html();
          let price = $('.price-zone .hotel-price', item).text();
          let linkImage = $(".post-thumbnail img", item).attr('src');


          hotelList = [...hotelList, {
            hotelName : hotelName,
            price : price,
            linkImage : linkImage
          }];
        });
        return {
          pageTitle : pageTitle,
          hotelList : hotelList
        };
      });

      item = { ...item, ...dataDetail};
      if(item && item.hotelList && item.hotelList.length > 0){
        item.hotelList.forEach((hotelInfo, indexHotel) => {
          let dir = `../public/hotels/${index + 1} - ${item.cityName}`;
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          download(`https:${hotelInfo.linkImage}`, `${dir}/${indexHotel + 1} - ${hotelInfo.hotelName}.png`);

        })
      }
      // return Promise.resolve(item); ---- default async function là 1 Promise

      return item;
    };


    // Tạo array process lấy chi tiết top điểm đến
    for (let i = 0; i < topDiemDen.length; i++) {
      let item = topDiemDen[i];
      console.log(`Chi tiết top điểm đến thứ ${i + 1 } ( ${item.cityName} : ${item.link} )`);
      topDiemDen[i] = await getDetail(item, i)
    }

    res.json({
      code: 200,
      message: "Get data success.",
      data:  {
        topDiemDen : topDiemDen
      }
    });
    await browser.close();

  },
  testGetChoTot: async function (req, res) {

    const VIEWPORT = { width: 1280, height: 1080 };
    const browser = await puppeteer.launch({
      // headless: false,
      // args: [
      //   '--window-size=1280,1000'
      // ]
    });
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.goto('https://www.chotot.com/tp-ho-chi-minh/mua-ban-dien-thoai');

    let dataCrawl = await page.evaluate(() => {

      // Begin get ctStickyAdsListing
      let ctStickyAdsListing = [];
      let ctAdListingWrapper =  document.getElementsByClassName("ctAdListingWrapper");
      for(let i=0; i < ctAdListingWrapper.length; i++) {
        let link = ctAdListingWrapper[i].getElementsByClassName("ctAdListingItem")[0].getAttribute('href');
        let title = ctAdListingWrapper[i].getElementsByClassName("ctAdListingTitle")[0].textContent;
        let imageUrl = ctAdListingWrapper[i].getElementsByClassName("ctAdLitingThumbnail")[0].getElementsByTagName('img')[0].getAttribute('src');
        ctStickyAdsListing.push({
          link : `https://www.chotot.com` + link,
          title : title,
          imageUrl : imageUrl
        })
      }
      // End get ctStickyAdsListing

      return {
        ctStickyAdsListing : ctStickyAdsListing
      };
    });
    console.error('------>', dataCrawl);

    res.json({
      code: 200,
      message: "Get data success.",
      data:  dataCrawl
    });
    await browser.close();

  }
};

