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
        //API Open
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
        //GET LIVENESS
        app.get('/api/liveness', (req, res) => {
            return res.status(200).send('API LIVE');
        });
        //LOGIN
        app.put('/api/login/:mail/:mdp', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const mail = req.params.mail;
            const mdp = req.params.mdp;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.mail === mail);
            if (!(0, other_comp_1.NotNull)(current_user)) {
                return res.status(400).send({ message: `User mail doesn't exists ${mail}` });
            }
            if (current_user.mdp === mdp) {
                const token = Math.random().toString(36).substring(2) + Date.now().toString(36); //Token
                //Update token
                current_user.token = token;
                yield current_user.save();
                return res.status(201).send({ token });
            }
            else {
                return res.status(400).send({ message: 'Invalid Password' });
            }
        }));
        //DISCONNECT
        app.put('/api/disconnect/:token', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.params.token;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            if (!(0, other_comp_1.NotNull)(current_user)) {
                return res.status(401).send({ message: `Error Session doesn't exist` });
            }
            current_user.token = '';
            yield current_user.save();
            return res.status(200).send({});
        }));
        //REGISTER
        app.post('/api/register', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { mail, firstname, lastname, mdp } = req.body;
            const users = yield Models_1.User.findAll();
            const already_user = users.find((U) => U.mail === mail);
            if ((0, other_comp_1.NotNull)(already_user)) {
                return res.status(400).send({ message: `User already exists with mail: ${mail}` });
            }
            //Check input data are valid
            if (!(0, other_comp_1.isValidEmail)(mail)) {
                return res.status(400).send({ message: 'Please provide a valid email' });
            }
            if (!(0, other_comp_1.isValidPassword)(mdp)) {
                return res.status(400).send({ message: 'please input a valid password, with at least 6 characters and at least one special character' });
            }
            if (!(0, other_comp_1.isValidString)(firstname)) {
                return res.status(400).send({ message: 'please input a valid firstname' });
            }
            if (!(0, other_comp_1.isValidString)(lastname)) {
                return res.status(400).send({ message: 'please input a valid lastname' });
            }
            try {
                const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                yield Models_1.User.bulkCreate([
                    { mail: mail, firstname: firstname, lastname: lastname, mdp: mdp, token: token },
                ]);
                return res.status(201).json({ token });
            }
            catch (error) {
                console.log('Failed to post a new package: ', error);
                return res.status(500).send({ message: `Failed to create your account: ${error}` });
            }
        }));
        //Get General User Information
        app.get('/api/informations/:token', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.params.token;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            if (!(0, other_comp_1.NotNull)(current_user)) {
                return res.status(401).send({ message: `Error Session doesn't exist` });
            }
            return res.status(201).send({
                mail: current_user.mail,
                firstname: current_user.firstname,
                lastname: current_user.lastname,
            });
        }));
        //Get all exercises
        app.get('/api/exercises', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const exes = yield Models_1.Ex.findAll();
            return res.status(201).send({ exes });
        }));
        //Get exercises by ID
        app.get('/api/exercises/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const exes = yield Models_1.Ex.findAll();
            const ex = exes.find((E) => E.id === id);
            if ((0, other_comp_1.NotNull)(ex)) {
                return res.status(201).send({ ex });
            }
            return res.status(404).send({ message: `Exercise doesn't exist: ${id}` });
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
            return res.status(201).send({ ExFiltered });
        }));
        app.post('/api/new_program/:token', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const program = req.body;
            const token = req.params.token;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            if (!(0, other_comp_1.isValidString)(program.title)) {
                return res.status(400).send({ message: 'Please provide a valid title' });
            }
            if (!(0, other_comp_1.isValidString)(program.goal)) {
                return res.status(400).send({ message: 'Please provide a valid goal' });
            }
            try {
                const newProgram = yield Models_1.Program.create({
                    title: program.title,
                    goal: program.goal,
                    description: program.description,
                    UserId: current_user.mail
                });
                const id = newProgram.id_program;
                console.log(id, 'id');
                return res.status(201).json({ id });
            }
            catch (error) {
                return res.status(500).send({ message: `Failed to create a new program ${token}` });
            }
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
            if (!(0, other_comp_1.NotNull)(program)) {
                return res.status(401).send({ message: `Can't add a session` });
            }
            if (!(0, other_comp_1.isValidString)(session.title)) {
                return res.status(400).send({ message: 'Please provide a valid name for your program' });
            }
            try {
                const newSession = yield Models_1.Session.create({
                    title: session.title,
                    description: session.description,
                    ProgramId: id_program,
                });
                const id = newSession.id_session;
                console.log(id, 'id');
                return res.status(201).json({ id });
            }
            catch (error) {
                return res.status(500).send({ message: `Failed to create a new session for ${token}` });
            }
        }));
        // Ex of a session
        app.get('/api/exercise_of_session/:id_session', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id_session = req.params.id_session;
            const exercises = yield Models_1.Exercise.findAll({ where: { SessionId: id_session } });
            const exes = [];
            for (let i = 0; i < exercises.length; i++) {
                const ex = yield Models_1.Ex.findOne({ where: { id: exercises[i].ExId } });
                exes.push(ex);
            }
            return res.status(201).json({ exes });
        }));
        //Update a session by adding new exercises selected
        app.post('/api/update_session/:id_session', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id_session = req.params.id_session;
            const selectedExercises = req.body.selectedExercises;
            const sessions = yield Models_1.Session.findAll();
            const session = sessions.find((S) => S.id_session.toString() === id_session);
            if (!(0, other_comp_1.NotNull)(session)) {
                return res.status(401).send({ message: `Can't add update the session` });
            }
            const exercises = yield Models_1.Exercise.findAll();
            const session_exercises = exercises.filter((E) => E.SessionId.toString() === id_session);
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
            return res.status(201).json({ ProgramId });
        }));
        //get All programs of a user
        app.get('/api/programs/:token', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.params.token;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            if (!(0, other_comp_1.NotNull)(current_user)) {
                return res.status(401).send({ message: `Error Session doesn't exist` });
            }
            const programs = yield Models_1.Program.findAll();
            const user_programs = programs.filter((P) => P.UserId === current_user.mail);
            return res.status(201).send({ user_programs });
        }));
        app.put('/api/delete_program/:token/:id_program', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id_program = req.params.id_program;
            const token = req.params.token;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            if (!(0, other_comp_1.NotNull)(current_user)) {
                return res.status(401).send({ message: `Error Session doesn't exist` });
            }
            const programs = yield Models_1.Program.findAll();
            const program = programs.filter((P) => P.id_program.toString() === id_program);
            if (!(0, other_comp_1.NotNull)(program)) {
                return res.status(401).send({ message: `Error Program doesn't exist` });
            }
            yield Models_1.Program.destroy({ where: { id_program: id_program } });
            return res.status(200).send({ message: `Success to delete program ${program.title}` });
        }));
        //get All sessions for a program
        app.get('/api/program/sessions/:id_program', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id_program = req.params.id_program;
            const programs = yield Models_1.Program.findAll();
            const program = programs.find((P) => P.id_program.toString() === id_program);
            if (!(0, other_comp_1.NotNull)(program)) {
                return res.status(401).send({ message: `Error Program doesn't exist` });
            }
            const sessions = yield Models_1.Session.findAll();
            const program_sessions = sessions.filter((S) => S.ProgramId.toString() === id_program);
            return res.status(201).send({ program, program_sessions });
        }));
        app.put('/api/program/:id_program/delete/:id_session', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id_program = req.params.id_program;
            const id_session = req.params.id_session;
            const result = yield Models_1.Session.destroy({ where: { id_session: id_session, ProgramId: id_program } });
            if (result === 0) {
                return res.status(401).send({ message: `Error Session doesn't exist` });
            }
            return res.status(200).send({ message: `Success to delete session` });
        }));
        app.put('/api/program/sessions/exercises', (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log('bdcjcdibci');
            const sessions = req.body.sessions;
            console.log(sessions);
            const exercises_per_session = [];
            for (let i = 0; i < sessions.length; i++) {
                const exercises = yield Models_1.Exercise.findAll({ where: { SessionId: sessions[i].id_session } });
                const exes = [];
                for (let j = 0; j < exercises.length; j++) {
                    exes.push(yield Models_1.Ex.findOne({ where: { id: exercises[j].ExId } }));
                }
                exercises_per_session.push(exes);
            }
            console.log(exercises_per_session);
            return res.status(201).json({ exercises_per_session });
        }));
        //get All events of a user
        app.get('/api/events/:token', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.params.token;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            console.log(current_user);
            if (!(0, other_comp_1.NotNull)(current_user)) {
                return res.status(401).send({ message: `Error Session doesn't exist` });
            }
            const user_events = yield Models_1.Event_.findAll({ where: { UserId: current_user.mail } });
            return res.status(201).send({ user_events });
        }));
        //create a new event
        app.post('/api/new_event/:token', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.params.token;
            const event = req.body;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            const already = yield Models_1.Event_.findAll({ where: { title: event.title, UserId: current_user.mail } });
            if (already.length >= 1) {
                return res.status(400).send({ message: `title already exists ${event.title}` });
            }
            if (!(0, other_comp_1.isValidString)(event.title)) {
                return res.status(400).send({ message: 'Please provide a valid title' });
            }
            try {
                const newEvent = yield Models_1.Event_.create({
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    primary: event.primary,
                    secondary: event.secondary,
                    secondaryText: event.secondaryText,
                    UserId: current_user.mail
                });
                const id_event = newEvent.title;
                return res.status(201).json({ id_event });
            }
            catch (error) {
                return res.status(500).send({ message: `Failed to create a new event ${token}` });
            }
        }));
        //Delete an event
        app.put('/api/delete_event/:token/:title', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.params.token;
            const title = req.params.title;
            const users = yield Models_1.User.findAll();
            const current_user = users.find((U) => U.token === token);
            const result = yield Models_1.Event_.destroy({ where: { title: title, UserId: current_user.mail } });
            if (result === 0) {
                return res.status(401).send({ message: `Error Event doesn't exist` });
            }
            return res.status(200).send({ message: `Success to delete session` });
        }));
    });
})();
//# sourceMappingURL=app.js.map