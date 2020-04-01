async function getData(){
    const response = await fetch('/api');
    const data = await response.json();

    console.log(data);
    
    for (item of data){
        const root = document.createElement('div');
        root.setAttribute('class', 'record');

        const food = document.createElement('p');
        const geo = document.createElement('p');
        const date = document.createElement('p');
        const weatherSum = document.createElement('p');
        const weatherTemp = document.createElement('p');

        const airSummary = document.createElement('div');
        const airParam = document.createElement('p');
        const airValue = document.createElement('p');
        const airUnit = document.createElement('p');
        const airDate = document.createElement('p');
        const deletebtn = document.createElement('p');
        deletebtn.innerHTML = `
            <form action="/records/delete/${item._id}/${item.imageName}" method="post">
                <button type="submit">Delete</button>
            </form>
        `;

        const image = document.createElement('img');
        image.setAttribute('class', 'img');

        food.textContent = `Food: ${item.favouriteFood}`;
        geo.textContent = `Lat: ${item.lat}, Lon: ${item.lon}`;
        const dateString = new Date(item.timeStamp).toLocaleString();
        date.textContent = `Date: ${dateString}`;

        weatherSum.textContent = `Weather Summary: ${item.weather.summary}`;
        weatherTemp.textContent = `Temperature: ${item.weather.temperature}° C`;

        const file_reponse = await fetch(`/img/${item.imageName}`);
        const text = await file_reponse.text();
        image.src = text;

        if (item.air === undefined){
            airSummary.textContent = `[No Data On Air Quality]`
        }
        else
        {
            airParam.textContent = `Air Quality Parameter: ${item.air.parameter}`
            airValue.textContent = `Air Quality Value: ${item.air.value}`
            airUnit.textContent = `Air Quality Units: ${item.air.unit}`
            airDate.textContent = `Air Quality Last Updated: ${item.air.lastUpdated}`

            airSummary.append(airParam, airValue, airUnit, airDate);
        }

        root.append(food, geo, date, weatherSum, weatherTemp, airSummary, image, deletebtn);
        
        document.body.append(root);
    }
}
getData();