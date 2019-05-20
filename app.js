var express = require('express');
var bodyParser = require('body-parser');
var mimeTypes = require('mime-types');
var axios = require('axios');
var mime = require('mime-types');
const Pool = require('pg').Pool;

const app = express();

const BAKET = process.env.BAKET;

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
    // user: 'redirector',
    // host: 'localhost',
    // database: 'RedirectDB',
    // password: '123',
    // port: 5432,

});

app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({extend:true}));

//All GET routers
app.get('/*', async function(req, res){    
    console.log("Got a GET request for the Cloud.net");
    
    var host = req.headers.host.toString();
    console.log('HOST = ' + host);

    var url = req.url.toString();
    console.log('URL = ' + url);

    try {
        var file = url.match(/[0-9a-zA-Z]+\.[0-9a-zA-Z]*/g).toString();
        console.log('FILE IS A ' + file);
    }catch (err){
        file = '404.html';
    }

    var type = mime.lookup(file).toString();
    console.log('MIME TYPE OF TEST.PNG IS A ...' + type);
   
    function upload() {
       return hash = new Promise(function(resolve, reject) {
        //pool.query('SELECT hash FROM hashes WHERE host=$1', [host], function(err, resp){
        var TABLE = process.env.TABLE;
        var HOST_COLUMN = process.env.HOST_COLUMN;
        var HASH_COLUMN = process.env.HASH_COLUMN;
        const BLOCKED_COLUMN = process.env.BLOCKED_COLUMN;
        
        pool.query('SELECT ' + HASH_COLUMN + ', ' + BLOCKED_COLUMN + ' FROM ' + TABLE + ' WHERE ' + HOST_COLUMN + '=$1', [host], function(err, resp){
        //AND ' + BLOCKED_COLUMN + '=true' 
        if (err) {
         return reject(err)
        }        
        
        if(!resp.rows[0]) {
                //axios({url:'https://offers.website.yandexcloud.net/404.html',
                //axios({url:'https://offers.website.yandexcloud.net/403.html',
            axios({url:BAKET + '404.html',
                method: 'GET',
                responseType: 'arraybuffer'
                }).then(function(response) {
                        res.set('Content-Type', 'text/html');
                        res.send(response.data)
                    })
                .catch(function(err){
                    console.error('AXIOS ERROR', err.stack);                
                })
                
            return;
        }

        if(resp.rows[0].blocked === true) {
                //axios({url:'https://offers.website.yandexcloud.net/404.html',
                //axios({url:'https://offers.website.yandexcloud.net/403.html',
            axios({url:BAKET + '403.html',
                method: 'GET',
                responseType: 'arraybuffer'
                }).then(function(response) {
                        res.set('Content-Type', 'text/html');
                        res.send(response.data)
                    })
                .catch(function(err){
                    console.error('AXIOS ERROR', err.stack);                
                })
                
            return;
        }

        try{
            resolve(resp.rows[0].hash);
        } catch(err){
            return
        }
        
        })
         });

        hash
        .then(
            function(result) {
            console.log('RESULT FROM PROMISE' + result);
                return result;
            
        },
            function(error) {
                return error;
            }
        )
    }

    var hash = await upload();
    
    //var rezUrl = 'https://offers.website.yandexcloud.net/' + hash + url;
    var rezUrl = BAKET + hash + url;
    console.log('RESULT URL IS A ' + rezUrl); 

    //MAIN REDIRECT GET REQUEST
    axios({url:rezUrl,
            method: 'GET',
            responseType: 'arraybuffer'
            }).then(function(response) {
                    res.set('Content-Type', type);
                    res.send(response.data)
                })
            .catch(function(err){
                //console.error('AXIOS ERROR', err.stack);
                //axios({url:'https://offers.website.yandexcloud.net/' + hash + '/404.html',
                axios({url:BAKET + hash + '/404.html',
                    method: 'GET',
                    responseType: 'arraybuffer'
                    }).then(function(response) {
                        res.set('Content-Type', 'text/html');
                        res.send(response.data)
                    });
            })

});

const server = app.listen(3000, function() {
    console.log(`Server is up and running on port 3000`);
});

 //https://offers.honeybloger.ru/offer.txt
//(https://offers.website.yandexcloud.net/3SadvYRZHngw8hq9i4VVlGzPP4CTWoj/offer.txt
//https://offers.honeybloger.ru/2019-05-01/offer.txt 
//= https://offers.website.yandexcloud.net/3SadvYRZHngw8hq9i4VVlGzPP4CTWoj/2019-05-01/offer.txt
//3SadvYRZHngw8hq9i4VVlGzPP4CTWoj

//    pool.query('SELECT hash FROM hashes WHERE host=$1', [host], function(err, res) {
 //     if (err) {
 //         return console.error('Error executing query', err.stack)
 //         }
 //         return res.rows[0].name; // brianc
    // })

// .then(function(res){return resolve(res)}) // brianc
        // .catch(function(err){return reject(err)})
         // setTimeout(function() {   
         //    resolve('.org');
         // }, 10000)


