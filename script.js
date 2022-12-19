const fs = require('fs')

async function asyncReadFile(filename) {
        try {
        const contents = await fs.promises.readFile(filename, 'utf-8');
        const arr = contents.trim().split(/\r?\n/);


        const obj = arr.map( (el, i) => {
            const values = el.split(" ");
            let endpoints = values[0];
            let ids = values[1];

            if (ids == undefined) {
                ids = [];
            } else {
                ids = JSON.parse(values[1]);
            }

            return { endpoints, ids };
        })
        
        const filtredArray = obj.filter((item, index, array) => {

            if (array.map(() => item['endpoints']).indexOf(item['endpoints']) === index)  {
                item.ids = item.ids.concat(array[index + 1].ids);
                array.splice(index, 1)
            }
            return obj;
        });

        return filtredArray;

    } catch (err) {
        console.log(err);
    }
}

async function getData() {
    const obj = await asyncReadFile('./text.txt');

    for (let keys in obj ) {
        let currentEndpoint = obj[keys].endpoints;
        let currentIds = obj[keys].ids;

        if(currentIds == []) {
            let url = "https://jsonplaceholder.typicode.com/"+ currentEndpoint;

            const response = await fetch(url);
            const data = await response.text();
            
            fs.writeFile(currentEndpoint + ".txt", data, (err) => {
                if (err) throw err;
            });
        }

        for(let id in currentIds) {
            let currentID = currentIds[id];
            let url  = "https://jsonplaceholder.typicode.com/"+ currentEndpoint + "/" + currentID;
    
            const response = await fetch(url);
            const data = await response.text();
            
            fs.writeFile(currentEndpoint + currentID + ".txt", data, (err) => {
                if (err) throw err;
            });
        }
    }      
}

getData()