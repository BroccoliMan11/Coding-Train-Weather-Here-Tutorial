const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const DataStore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();

const fs = require('fs');

app.listen(port, () => console.log(`Starting server at ${port}`));

//USE STATIC FILES
app.use(express.static('public'));

app.use(express.json({limit: '1mb'}));

//SETUP DATABASE
const dataBase = new DataStore('database.db');
dataBase.loadDatabase();

//API ROUTES
app.post('/api', (request, response) => {

    const data = request.body;

    const text = data.image64;
    const imageName = `image${data.timeStamp}.txt`
    const image_URL = `./public/images/${imageName}`;
    fs.writeFileSync(image_URL, text);
    data.imageName = imageName;
    delete data.image64;

    response.json(data);
    //set response object (and send it)

    dataBase.insert(data);

});

//GET DATA FROM DATABASE
app.get('/api', (request, response) => {
    dataBase.find({}, (err, data) => {
        if (err){
            response.end();
            return;
        }
        response.json(data);
    })
});

//GET IMAGE64 FROM IMAGE NAME
app.get('/img/:name', (request, response) => {
    const imageName = request.params.name;
    const text = fs.readFileSync(`./public/images/${imageName}`, 'utf8');
    response.send(text);
});

//ACCESS WEATHER AND AIR QUALITY FROM OTHER APIS
app.get('/weather/:latlon', async (request, response) => {
    const latlon = request.params.latlon.split(','); //get route parameters as string then splits it
    const lat = latlon[0];
    const lon = latlon[1];

    const api_key = process.env.API_KEY;
    const weather_url = `https://api.darksky.net/forecast/${api_key}/${lat},${lon}/?units=si`;
    //access darksky api but not in the client side so we dont get the CORS error (security reasons)
    const weather_response = await fetch(weather_url);
    const weather_data = await weather_response.json();

    const aq_url = `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}`;
    //?coordinates is an example of an URL query string
    const aq_response = await fetch(aq_url);
    const aq_data = await aq_response.json();

    const data = {
        weather: weather_data,
        air_quality: aq_data
    }

    response.json(data);
});

//DELETE IMAGES
app.post('/records/delete/:id/:imageName', async (request, response) => {

    fs.unlinkSync(`./public/images/${request.params.imageName}`);

    dataBase.remove({ _id: request.params.id }, {}, (err, num) => {
        response.json({ err: err, num: num, query: { _id: request.params.id } });
    });
});




