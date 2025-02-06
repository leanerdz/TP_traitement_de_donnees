const axios = require('axios');
const cheerio = require('cheerio');

const baseURL= 'https://www.fandom.com/';
let result = []
axios.get(baseURL)
    .then(({ data }) => {
        // console.log(data);
        const $ = cheerio.load(data);
        const quotesNames = $('div.popular-wikis-wrapper')
            .map((_, quote) => {
            const $quote = $(quote);
            const name = $quote.find('.sub-title-text').text()
            return [[name, ]]
        }).toArray();
        quotesNames.forEach((element) => {
            let e ;
            e = element[0].replace(/Wiki/g, ", ").split(",")
            result.push(e)

        });
        let gamesNames = result.flat()
        console.log(gamesNames)
    });
//