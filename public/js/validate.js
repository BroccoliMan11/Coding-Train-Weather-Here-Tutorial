function setup() //automatically runs (p5 library)
{
    //SET UP MAP
    let data; //variable to hold position

    var mymap = L.map('mapid').setView([0, 0], 1); //Create Empty Map

    const attribution = 
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreet</a> contributers'; //Credit Work

    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; //Get map tiles image

    const tiles = L.tileLayer(tileUrl, {attribution}) //Create tileLayer object

    tiles.addTo(mymap); //Add tile layer to map

    //SET UP CAMERA
    noCanvas(); //remove canvas (p5 library)
    const video = createCapture({
        audio: false,
        video: {
        facingMode: "user"
        }
    });
    //Camera styles
    video.style('height', '360px');
    video.style('width', '50%');
    video.style('float', 'left');
    video.style('object-fit', 'cover');

    //SUMBIT BUTTON PRESS
    const button = document.getElementById('submit');
    button.addEventListener('click', async event => {

        data.favouriteFood = document.getElementById('fav-food').value;

        const timeStamp = Date.now();
        data.timeStamp = timeStamp;

        video.loadPixels(); //load camera image to canvas
        data.image64 = video.canvas.toDataURL();

        //Create options for sending response
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        const response  = await fetch('/api', options); 
        //call app.post('/api', ...) from index.js
        //set response object

        const json = await response.json();
        //get json object from response object

        console.log(json);
    });

    //GET LOCATION
    if ('geolocation' in navigator)
    {
        console.log('geolocation available');

        //GET CURRENT POSITION
        navigator.geolocation.getCurrentPosition(async position => {

            //Get lattitude and display to 2 d.p
            const lat = position.coords.latitude;
            document.getElementById('latitude').textContent = lat.toFixed(2);
            

            //Get lonitude and display to 2 d.p
            const lon = position.coords.longitude;
            document.getElementById('longitude').textContent = lon.toFixed(2);

            //GET WEATHER FROM LOCATION
            const api_url = `weather/${lat},${lon}`; //the string after '/' is the route parameter
            /*
            api key part of request,
            therefore must make request in server side code
            not client side code
            */
            const response = await fetch(api_url); //geting response from created endpoint 'weather'
            const json = await response.json();

            const weather = json.weather.currently;
            const air = json.air_quality?.results[0]?.measurements[0];

            document.getElementById('summary').textContent = weather.summary;
            document.getElementById('temperature').textContent = weather.temperature;

            let txt = `The weather here at ${lat.toFixed(2)}&deg;, ${lon.toFixed(2)}&deg; 
            is ${weather.summary} with a temperature of ${weather.temperature}&deg; C. `

            if (air === undefined)
            {
                document.getElementById('aq_report').textContent = 
                "No air quality data could be retrieved for this location";

                txt += "No air quality data could be retrieved for this location"
            }
            else{
                document.getElementById('aq_parameter').textContent = air.parameter;
                document.getElementById('aq_value').textContent = air.value;
                document.getElementById('aq_units').textContent = air.unit;
                document.getElementById('aq_date').textContent = air.lastUpdated;

                txt += `The concentration of particulate matter (${air.parameter})
                is ${air.value}${air.unit} last read on ${air.lastUpdated}.`;
            }

            //Add Marker 
            const marker = L.marker([lat, lon]).addTo(mymap);

            marker.bindPopup(txt);

            //Change map centre view to marker position
            mymap.setView([lat, lon], 30 /*zoom level*/);

            //Set global variable to equal position
            data = {lat: lat, lon: lon, weather: weather, air: air};
        });
    }
    else
    {
        console.log('geolocation not available');
    }
}