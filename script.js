const fs = require('fs')

function split(el) {
    const values = el.split(" ");
    let endpoints = values[0];
    let ids = values[1];

    if (ids == undefined) {
        ids = [];
    } else {
        ids = JSON.parse(values[1]);
    }

    return { endpoints, ids };
}

function filterArray(item, index, array) {
    if (array.map(() => item['endpoints']).indexOf(item['endpoints']) === index)  {
        item.ids = item.ids.concat(array[index + 1].ids);
        array.splice(index, 1)
    }
}

async function asyncReadFile(filename) {
        try {
        const contents = await fs.promises.readFile(filename, 'utf-8');
        const arr = contents.trim().split(/\r?\n/);

        const obj = arr.map((el) => split(el));
        
        const filtredArray = obj.filter((item, index, array) => {
            filterArray(item, index, array);
            return obj;
        });

        return filtredArray;

    } catch (err) {
        console.log(err);
    }
}

function writeFile(txtFileName, data) {
    fs.writeFile("textFiles/" + txtFileName + ".txt", data, (err) => {
        if (err) throw err;
    });
} 

async function getData() {
    const obj = await asyncReadFile('./text.txt');
    let URL = "https://jsonplaceholder.typicode.com/";

    for (let keys in obj ) {
        let currentEndpoint = obj[keys].endpoints;
        let currentIds = obj[keys].ids;

        if(!currentIds.length) {
            let currentURL = URL + currentEndpoint;

            const response = await fetch(currentURL);
            const data = await response.text();

            let txtFileName = currentEndpoint;
            writeFile(txtFileName, data);
        }

        for(let id in currentIds) {
            let currentID = currentIds[id];
            let currentURL  = URL + currentEndpoint + "/" + currentID;
    
            const response = await fetch(currentURL);
            const data = await response.text();
            
            let txtFileName = currentEndpoint + currentID;
            writeFile(txtFileName, data);
        }
    }      
}

getData()