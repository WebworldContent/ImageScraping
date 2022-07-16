
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

let word = 'apple'

var START_URL = `https://www.bing.com/images/search?q=${word}&FORM=HDRSC2`; // This is main link from images
//var SEARCH_WORD = "anime";
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
pagesToVisit.push(START_URL);


// This function is use to change size of image obtain
function change_link_size(data) {

    let width = data.search("w=");
    let heigth = data.search("h=");
    if (width > 0 && heigth > 0) {
        var new_str = data.replace(data.substring(width, width + 5), 'w=256').replace(data.substring(heigth, heigth + 5), 'h=256') // change width = 256 and height = 256
        return new_str
    }
    else {
        return data
    }
}

//This function is main scraper of images from given Link
function scraper(url) {

    return new Promise((resolve, reject) => {
        request({ uri: url, headers: ['User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.101 Safari/537.11'] }, function (error, response, body) {
            var $ = cheerio.load(body);
            // Check status code (200 is HTTP OK)
            // console.log("Status code: " + response.statusCode);

            if (response.statusCode !== 200) {
                // callback();
                reject(response.statusCode)
            }

            var link = $("img").map(function () {
                return $(this).prop("src");
            }).get();  // image scraping method


            var new_links = link.map((data) => {
                return change_link_size(data)

            }) // use this function if you want to change the size of image obtain from each link

            resolve(new_links)

        })

    })
}

//This function prefetch link from internet 
function linkSearch(url) {

    var ar = []

    return new Promise((resolve, reject) => {
        //use of headers to show that bots are alike browsers
        request({ uri: url, headers: ['User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.101 Safari/537.11'] }, function (error, response, body) {
            var $ = cheerio.load(body);
            // Check status code (200 is HTTP OK)
            console.log("Status code: " + response.statusCode);


            var relativeLinks = $("a[href^='/']");
            console.log("Found " + relativeLinks.length + " relative links on page");
            // console.log(relativeLinks)
            relativeLinks.each(function () {
                //  console.log($(this).attr('href'))
                pagesToVisit.push(baseUrl + $(this).attr('href'));


            });

            // console.log(pagesToVisit)

            var new_pages = pagesToVisit.filter((data) => {
                var sp = data.split('?')
                let valid_string = sp[0].substring(sp[0].length - 14, sp[0].length)
                if (valid_string === '/images/search' && data.search('lang=') === -1) {
                    return data
                }
            })

            // console.log(new_pages)


            for (let i = 0; i < 4; i++) {  // This is main loop to iterate over each link obtain from given url "START_URL"
                let page_link = new_pages[i]  // This iteration can be increased further from "0-4" for more images

                let scp = scraper(page_link)


                ar.push(scp)

            }

            resolve(ar)
        })

    })

}

//promise use javascript method

linkSearch(START_URL)
    .then((res) => {
        return Promise.all(res)
    })
    .then((result) => {
        console.log('result', result)
    })
    .catch((err) => {
        console.log(err)
    })



