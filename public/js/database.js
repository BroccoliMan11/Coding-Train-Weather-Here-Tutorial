getData(); 

async function getData(){
    const response = await fetch('/api');
    const data = await response.json();
    
    for (item of data){
        const file_reponse = await fetch(`/img/${item.imageName}`);
        const text = await file_reponse.text();
        item.image64 = text
        item.hasAirQuality = (item.air === undefined) ? false : true
    }

    const database = document.getElementById('database-template').innerHTML;
    const renderDatabase = Handlebars.compile(database);
    document.getElementById('showdatabase').innerHTML = renderDatabase({database: data});
    
    console.log(data);
}