const sequelize = require('./sequelize-config.ts');
import {Ex} from './Models'
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
sequelize.sync({ force: true }).then(async () => {


// Read the JSON file
    const jsonData = await readFileAsync('exercises.json', 'utf8');
    const exercisesData = JSON.parse(jsonData);

// Insert exercises into the database
    await sequelize.sync(); // Make sure the database schema is synchronized

// Loop through the exercises and create records in the database
    await Ex.bulkCreate(exercisesData);

    console.log('Exercises inserted successfully.');
});