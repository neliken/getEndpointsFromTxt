const fs = require('fs')

function splitArrayElements(el) {
    const values = el.split(" ");
    const endpoint = values[0];
    let ids = values[1];

    if (ids == undefined) {
        ids = [];
    } else {
        ids = JSON.parse(values[1]);
    }

    return { endpoint, ids };
}

function regroupDublicates(item, index, array) {
    if (array.map(() => item['endpoints']).indexOf(item['endpoints']) === index)  {
        item.ids = item.ids.concat(array[index + 1].ids);
        array.splice(index, 1)
    }
}

async function asyncReadFile(filename) {
    try {
        const contents = await fs.promises.readFile(filename, 'utf-8');
        const arrayData = contents.trim().split(/\r?\n/);

        let objectsArray = arrayData.map((el) => splitArrayElements(el));
        
        objectsArray = objectsArray.filter((item, index, array) => {
            regroupDublicates(item, index, array);
            return objectsArray;
        });

        return objectsArray;

    } catch (err) {
        console.log(err);
    }
}

function writeNewFile(fileName, data) {
    fs.writeFile("textFiles/" + fileName + ".txt", data, (err) => {
        if (err) throw err;
    });
} 

async function fetchData(currentURL) {
    const response = await fetch(currentURL);
    const data = await response.text();
    return data;
}

async function dataHandler() {
    const objectsArray = await asyncReadFile('./text.txt');
    const URL = "https://jsonplaceholder.typicode.com/";

    for (let keys in objectsArray) {
        let currentEndpoint = objectsArray[keys].endpoint;
        let currentIds = objectsArray[keys].ids;

        if(!currentIds.length) {
            const currentURL = URL + currentEndpoint;
            const fileName = currentEndpoint;

            const data = await fetchData(currentURL);
            writeNewFile(fileName, data);
        }

        for(let id in currentIds) {
            const currentID = currentIds[id];
            const currentURL  = URL + currentEndpoint + "/" + currentID;
            const fileName = currentEndpoint + currentID;
    
            const data = await fetchData(currentURL);
            writeNewFile(fileName, data);
        }
    }      
}

dataHandler();