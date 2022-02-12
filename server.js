const fs = require('fs');
const path = require('path');
const express = require('express');
const res = require('express/lib/response');
const PORT = process.env.PORT || 3001;
const app = express();
const {animals} = require('./data/animals');
const { writeFile } = require('fs/promises');

//parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
//parse incoming JSON data
app.use(express.json());

app.use(express.static('public'));

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        //save personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits  === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        //loop hrough each trait in the personalitytraits arrya:
        personalityTraitsArray.array.forEach(trait => {
        // check the trait against each animal in the filteredResults array.
        //remember, it is initiall a copy of the aniimalsarray,
        //but here we're updating it for each trait in the foreach() loop.
        // for each trait being targeted by the filter, the filteredresults array
        //will then contain only the entries that contain the trait,
        //so at the end we'll have an array of animals that have every one of
        // the traits when the .foreach() loop is finished.
        filteredResults = filteredResults.filter(
            animal => animal.personalityTraits.indexOf(trait) !== -1
        );
    });

    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animals => animals.name === query.name);
    }
    //retunr filtered results:
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
} 

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    return animal;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
    }
    return true;
}

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(animals);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
    res.json(result);
    } else {
        res.send(404);
    }
});

app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
     // add an animal to jdson file and animals array in this function
    const animal = createNewAnimal(req.body, animals);
    res.json(animal);
    }
  });

    app.get('/', (req,res) => {
        res.sendFile(path.join(__dirname, './public/index.html'));
    });

    app.get('/animals', (req,res) => {
        res.sendFile(path.join(__dirname, './public/animals.html'));
    });

    app.get('./zookeepers', (req, res) => {
        res.sendFile(path.join(__dirname, './public/zookeepers.html'));
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, './public/index.html'));
    });

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});