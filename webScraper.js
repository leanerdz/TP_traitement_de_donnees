//Alors j'ai un dernier bug que je n'rrive pas résoudre et du coup je n'arrive pas génerer un csv correct. J'ai vraiment tout cherché et j'y arrive vraiment pas.

const axios = require('axios');
const cheerio = require('cheerio');
// scrape
const baseURL= 'https://www.fandom.com/';
let result = []
let gamesNames;
let gamesNamesObject;

// api
const postData = 'fields *; search "Star Wars"; limit 1;';
const config = {
    headers: {
        'POST': 'https://api.igdb.com/v4/games',
        'Client-ID': 'odf89vxkdzzcgb60os609gan1mhp0t',
        'Authorization': 'Bearer acpb72zijsd8kvgvr4ah3gz60rtvan',
        'Content-Type': 'text/plain',
    }
};
const getGames = 'https://api.igdb.com/v4/games'

//csv
const fs = require('fs');
const csv = require('csv-parser');
const filePath = 'steam-200k.csv';
const { createObjectCsvWriter } = require('csv-writer');

let promise = () => {
    return axios.get(baseURL)
        .then(({ data }) => {
            const $ = cheerio.load(data);
            const quotesNames = $('div.popular-wikis-wrapper')
                .map((_, quote) => {
                    const $quote = $(quote);
                    const name = $quote.find('.sub-title-text').text();
                    return [[name]];
                }).toArray();

            const result = [];
            quotesNames.forEach((element) => {
                let e;
                e = element[0].replace(/Wiki/g, ", ").split(",");
                result.push(e);
            });
            const gamesNames = result.flat().filter(name => name.trim() !== "");
            return gamesNames;
        });

}
Promise.all([promise()])
    .then(([gamesNames]) => {
        gamesNamesObject = gamesNames.map(name => ({ name: name.trim() }));
        //console.log(gamesNamesObject);
        gamesNamesObject.forEach((game) => {
            //console.log(game);
            const searchData = 'fields name,summary; search "' + game.name + '"; limit 1;';
            setTimeout(() => {
                axios.post(getGames, searchData, config)
                    .then(response => {
                        let searchData = (query) => {
                            const results = [];
                            fs.createReadStream(filePath)
                                .pipe(csv())
                                .on('data', (row) => {
                                    if (Object.values(row).some(value =>
                                        String(value).toLowerCase().includes(query.toLowerCase())
                                    )) {
                                        results.push(row);
                                    }
                                })
                                .on('end', () => {
                                    //console.log('Résultats de la recherche :', results);
                                    game.complementaryData = results
                                    //console.log(game)
                                    let json = game
                                    console.log(json)
                                    let fields = Object.keys(json[0])
                                    let replacer = function(key, value) { return value === null ? '' : value }
                                    let csv = json.map(function(row){
                                        return fields.map(function(fieldName){
                                            return JSON.stringify(row[fieldName], replacer)
                                        }).join(',')
                                    })
                                    csv.unshift(fields.join(','))
                                    csv = csv.join('\r\n');
                                    console.log(csv)
                                })
                                .on('error', (error) => {
                                    console.error('Erreur lors de la lecture du fichier CSV :', error.message);
                                });
                            return results
                        }
                        game.summary = response.data[0].summary
                        //console.log(game)
                        result = searchData(game.name);
                        //console.log("Result", result)
                        fs.writeFile('output.csv', csvData, (err) => {
                            if (err) throw err;
                            console.log('Fichier CSV créé avec succès');
                        });
                    })
                    .catch(error => {
                        console.error('Erreur lors de la requête :', error);
                    });
            }, 1000)

        })
    })
    .catch(error => {
        console.error('Erreur:', error);
    });

