"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require('./sequelize-config.ts');
const Models_1 = require("./Models");
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
sequelize.sync({ force: true }).then(() => __awaiter(void 0, void 0, void 0, function* () {
    // Read the JSON file
    const jsonData = yield readFileAsync('exercices.json', 'utf8');
    const exercisesData = JSON.parse(jsonData);
    // Insert exercises into the database
    yield sequelize.sync(); // Make sure the database schema is synchronized
    // Loop through the exercises and create records in the database
    yield Models_1.Ex.bulkCreate(exercisesData);
    console.log('Exercises inserted successfully.');
}));
//# sourceMappingURL=post-exercices.js.map