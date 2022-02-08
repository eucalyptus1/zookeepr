const express = require('express');
const res = require('express/lib/response');
const PORT = process.env.PORT || 3001;
const app = express();
const {animals} = require('./data/animals');

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

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});