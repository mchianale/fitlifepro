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
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
//Pg Admin 4
const sequelize = require('./sequelize-config.ts');
const Models_1 = require("./Models");
//Other fun
const other_comp_1 = require("./other_comp");
(function Main() {
    return __awaiter(this, void 0, void 0, function* () {
        //Load Data
        yield sequelize.sync();
        try {
            yield Models_1.User.bulkCreate([
                { mail: 'matteo.chianale75@gmail.com', firstname: 'Matteo', lastname: 'Chianale', mdp: 'Test' },
            ]);
        }
        catch (error) {
            console.log('user already exists');
        }
        //Load app
        const app = express();
        const port = 3000;
        app.use(bodyParser.json());
        app.use(cors());
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
        //GET LIVENESS
        app.get('/api/liveness', (req, res) => {
            res.status(200).send('API LIVE');
        });
        //LOGIN
        app.put('/api/login/:mail/:mdp', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const mail = req.params.mail;
            const mdp = req.params.mdp;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.mail === mail);
            if (current_user !== null && current_user !== undefined) {
                if (current_user.mdp === mdp) {
                    const token = Math.random().toString(36).substring(2) + Date.now().toString(36); //Token
                    //Update token
                    current_user.token = token;
                    yield current_user.save();
                    res.status(200).send({ token });
                }
                else {
                    res.status(401).send('Invalid Password');
                }
            }
            else {
                res.status(404).send(`User doesn't exists for mail: ${mail}`);
            }
        }));
        //DISCONNECT
        app.put('/api/disconnect/:token', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.params.token;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            if (current_user !== null && current_user !== undefined) {
                current_user.token = '';
                yield current_user.save();
                res.status(200).send({});
            }
            else {
                res.status(404).send("Error Page doesn't exist");
            }
        }));
        //REGISTER
        app.post('/api/register', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { mail, firstname, lastname, mdp } = req.body;
            const users = yield Models_1.User.findAll();
            const already_user = users.find((U) => U.mail === mail);
            if (already_user !== null && already_user !== undefined) {
                res.status(401).send({ message: `User already exists with mail: ${mail}` });
            }
            else if ((0, other_comp_1.isValidPassword)(mdp) !== true) {
                res.status(404).send({ message: 'please input a valid password, with at least 6 characters and at least one special charactere' });
            }
            else if ((0, other_comp_1.isValidName)(firstname) !== true) {
                res.status(406).send({ message: 'please input a valid firstname' });
            }
            else if ((0, other_comp_1.isValidName)(lastname) !== true) {
                res.status(403).send({ message: 'please input a valid lastname' });
            }
            else {
                try {
                    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    yield Models_1.User.bulkCreate([
                        { mail: mail, firstname: firstname, lastname: lastname, mdp: mdp, token: token },
                    ]);
                    res.status(200).json({ token });
                }
                catch (error) {
                    console.log('Failed to post a new package: ', error);
                    res.status(405).send({ message: `Failed to post a new package: ${error}` });
                }
            }
        }));
        //Get General User Information
        app.get('/api/informations/:token', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.params.token;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            if (current_user !== null && current_user !== undefined) {
                res.status(200).send({
                    mail: current_user.mail,
                    firstname: current_user.firstname,
                    lastname: current_user.lastname,
                });
            }
            else {
                res.status(404).send("Error Page doesn't exist");
            }
        }));
        //Get all exercises
        app.get('/api/exercises', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const exes = yield Models_1.Ex.findAll();
            res.status(200).send({ exes });
        }));
        //Get exercises by ID
        app.get('/api/exercises/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const exes = yield Models_1.Ex.findAll();
            const ex = exes.find((E) => E.id === id);
            if (ex !== null && ex !== undefined) {
                res.status(200).send({ ex });
            }
            else {
                res.status(404).send(`Exercise doesn't exist: ${id}`);
            }
        }));
        //Get exercises by filtering
        // exercise is part of filtered exercise if its name includes filter name or (bodyPart correspond, one selected muscle is used in the exercise, withoutEquipment => Body Weight
        app.post('/api/exercises/search_by_filters', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const filter = req.body;
            const exes = yield Models_1.Ex.findAll();
            const ExFiltered = [];
            for (const ex of exes) {
                const lowerCaseSearchName = filter.searchName.toLowerCase();
                if (filter.searchName !== "" && !ex.name.toLowerCase().includes(lowerCaseSearchName)) {
                    continue;
                }
                if (filter.searchName !== "" && ex.name.toLowerCase().includes(lowerCaseSearchName)) {
                    ExFiltered.push(ex);
                    continue;
                }
                if (filter.searchBodyPart !== "" && ex.bodyPart !== filter.searchBodyPart) {
                    continue;
                }
                if (filter.withoutEquipment === true && ex.equipment !== 'body weight') {
                    continue;
                }
                if (Object.keys(filter.selectedMuscles).length !== 0) {
                    const musclesArray = [ex.target, ...ex.secondaryMuscles];
                    if (!musclesArray.some(muscle => filter.selectedMuscles[muscle])) {
                        // Skip if the exercise does not have any selected muscles
                        continue;
                    }
                }
                ExFiltered.push(ex);
            }
            res.status(200).send({ ExFiltered });
        }));
        app.post('/api/new_program/:token', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const program = req.body;
            const token = req.params.token;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            if (program.title !== '' || program.title.trim() !== '') {
                try {
                    const newProgram = yield Models_1.Program.create({
                        title: program.title,
                        goal: program.goal,
                        description: program.description,
                        UserId: current_user.mail
                    });
                    const id = newProgram.id_program;
                    console.log(id, 'id');
                    return res.status(200).json({ id });
                }
                catch (error) {
                    return res.status(400).send(`Failed to create a new program ${token}`);
                }
            }
            return res.status(401).send(`Please provided a title`);
        }));
        //Create a new session
        app.post('/api/new_session/:token/:id_program', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const session = req.body;
            const token = req.params.token;
            const id_program = req.params.id_program;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            const programs = yield Models_1.Program.findAll();
            //Double check
            const program = programs.find((P) => P.id_program.toString() === id_program && P.UserId === current_user.mail);
            console.log(program);
            if (program !== null && program !== undefined) {
                if (session.title !== '' || session.title.trim() !== '') {
                    try {
                        const newSession = yield Models_1.Session.create({
                            title: session.title,
                            description: session.description,
                            ProgramId: id_program,
                        });
                        const id = newSession.id_session;
                        console.log(id, 'id');
                        return res.status(200).json({ id });
                    }
                    catch (error) {
                        return res.status(400).send(`Failed to create a new session for ${token}`);
                    }
                }
                else {
                    return res.status(401).send(`Please be provided a title`);
                }
            }
            return res.status(404).send(`Please be connect`);
        }));
        //Update a session by adding new exercises selected
        app.post('/api/update_session/:id_session', (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log('kkdkdl');
            const id_session = req.params.id_session;
            const selectedExercises = req.body.selectedExercises;
            console.log(id_session);
            console.log(selectedExercises);
            const sessions = yield Models_1.Session.findAll();
            const session = sessions.find((S) => S.id_session.toString() === id_session);
            if (session !== null && session !== undefined) {
                const exercises = yield Models_1.Exercise.findAll();
                const session_exercises = exercises.filter((E) => E.SessionId.toString() === id_session);
                console.log(session_exercises);
                //Remove them
                for (let i = 0; i < session_exercises.length; i++) {
                    yield Models_1.Exercise.destroy({ where: { id_exercise: session_exercises[i].id_exercise } });
                }
                //Add new exercises
                for (let i = 0; i < selectedExercises.length; i++) {
                    const exercise = selectedExercises[i];
                    yield Models_1.Exercise.create({ SessionId: id_session, ExId: exercise.id });
                }
                const ProgramId = session.ProgramId;
                return res.status(200).json({ ProgramId });
            }
            else {
                return res.status(403).send('Failed to update session');
            }
        }));
    });
})();
//# sourceMappingURL=app.js.map