import * as express from "express";
import {Request, Response} from "express";
const bodyParser = require('body-parser');
const cors = require('cors');
//Pg Admin 4
const sequelize = require('./sequelize-config.ts');
import {User, Program, Session, Exercise, Ex, Event_} from './Models';
//Other fun
import {isValidPassword,isValidEmail, NotNull, isValidString} from "./other_comp";
import {DataTypes} from "sequelize";

(async function Main() {
    //Load Data
    await sequelize.sync();
    try {
        await User.bulkCreate([
            {mail: 'matteo.chianale75@gmail.com', firstname: 'Matteo', lastname: 'Chianale', mdp: 'Test'},

        ])
    }
    catch (error) {
        console.log('user already exists')
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
    app.get('/api/liveness', (req: Request, res: Response) => {
        return res.status(200).send('API LIVE');
    });

    //LOGIN
    app.put('/api/login/:mail/:mdp', async (req, res) => {
        const mail =  req.params.mail
        const mdp = req.params.mdp
        const users = await User.findAll();
        const current_user = users.find((U) => U.mail === mail);
        if (!NotNull(current_user)) {return res.status(400).send({message: `User mail doesn't exists ${mail}`});}
        if (current_user.mdp === mdp){
            const token = Math.random().toString(36).substring(2) + Date.now().toString(36); //Token
            //Update token
            current_user.token = token
            await current_user.save()
            return res.status(201).send({ token });
        }
        else {
            return res.status(400).send({message:'Invalid Password'});
        }

    });
    //DISCONNECT
    app.put('/api/disconnect/:token', async (req, res) => {
        const token =  req.params.token
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        if (!NotNull(current_user)) {return res.status(401).send({message: `Error Session doesn't exist`});}
        current_user.token = '';
        await current_user.save();
        return res.status(200).send({});
    });

    //REGISTER
    app.post('/api/register', async (req, res) => {
        const {mail, firstname, lastname, mdp} = req.body
        const users = await User.findAll();
        const already_user = users.find((U) => U.mail === mail);
        if (NotNull(already_user)) {return res.status(400).send({message: `User already exists with mail: ${mail}`});}
        //Check input data are valid
        if(!isValidEmail(mail)){ return res.status(400).send({message:'Please provide a valid email'});}
        if(!isValidPassword(mdp)) { return res.status(400).send({message: 'please input a valid password, with at least 6 characters and at least one special character'});}

        if(!isValidString(firstname)){return res.status(400).send({message:'please input a valid firstname'});}
        if(!isValidString(lastname)){ return res.status(400).send({message:'please input a valid lastname'});}

        try {
            const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
            await User.bulkCreate([
                { mail: mail, firstname: firstname, lastname: lastname , mdp: mdp, token: token},
            ])
            return res.status(201).json({token});
        } catch (error) {
            console.log('Failed to post a new package: ', error);
            return res.status(500).send({message: `Failed to create your account: ${error}`});
        }
    });
    //Get General User Information
    app.get('/api/informations/:token', async (req: Request, res: Response) => {
        const token =  req.params.token
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        if (!NotNull(current_user)) {return res.status(401).send({message: `Error Session doesn't exist`});}
        return res.status(201).send({
            mail: current_user.mail,
            firstname: current_user.firstname,
            lastname: current_user.lastname,
        });
    });

    //Get all exercises
    app.get('/api/exercises', async (req, res) => {
        const exes = await Ex.findAll();
        return res.status(201).send({exes})
    });

    //Get exercises by ID
    app.get('/api/exercises/:id', async (req, res) => {
        const id =  req.params.id
        const exes = await Ex.findAll();
        const ex = exes.find((E) => E.id === id);
        if (NotNull(ex)) { return res.status(201).send({ ex });}
        return res.status(404).send({message:`Exercise doesn't exist: ${id}`});
    });
    //Get exercises by filtering
    // exercise is part of filtered exercise if its name includes filter name or (bodyPart correspond, one selected muscle is used in the exercise, withoutEquipment => Body Weight
    app.post('/api/exercises/search_by_filters', async (req, res) => {
        const filter = req.body;
        const exes = await Ex.findAll();

        const ExFiltered = [];
        for (const ex of exes) {
            const lowerCaseSearchName = filter.searchName.toLowerCase();
           if (filter.searchName !== "" &&  !ex.name.toLowerCase().includes(lowerCaseSearchName)){
               continue;
           }
           if (filter.searchName !== "" &&  ex.name.toLowerCase().includes(lowerCaseSearchName)){
                ExFiltered.push(ex);
                continue;
           }
           if(filter.searchBodyPart !== "" && ex.bodyPart !== filter.searchBodyPart) {
               continue;
           }
           if(filter.withoutEquipment === true && ex.equipment !== 'body weight') {
                continue;
           }
           if( Object.keys(filter.selectedMuscles).length !== 0) {
               const musclesArray = [ex.target, ...ex.secondaryMuscles];
               if (!musclesArray.some(muscle => filter.selectedMuscles[muscle])) {
                   // Skip if the exercise does not have any selected muscles
                   continue;
               }
           }
           ExFiltered.push(ex);
        }
        return res.status(201).send({ExFiltered});
    });

    app.post('/api/new_program/:token', async (req, res) => {
        const program = req.body;
        const token = req.params.token;
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        if(!isValidString(program.title)) { return res.status(400).send({message: 'Please provide a valid title'});}
        if(!isValidString(program.goal)) { return res.status(400).send({message: 'Please provide a valid goal'});}
        try {
            const newProgram = await Program.create({
                title: program.title,
                goal: program.goal,
                description: program.description,
                UserId: current_user.mail
            })
            const id = newProgram.id_program;
            console.log(id, 'id');
            return res.status(201).json({id})
        } catch (error) {
            return res.status(500).send({message:`Failed to create a new program ${token}`})
        }
    });

    //Create a new session
    app.post('/api/new_session/:token/:id_program', async (req, res) => {
        const session = req.body;
        const token = req.params.token;
        const id_program = req.params.id_program
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        const programs = await Program.findAll();
        //Double check
        const program = programs.find((P) : boolean => P.id_program.toString() === id_program && P.UserId === current_user.mail)
        if (!NotNull(program)){return res.status(401).send({message: `Can't add a session`})}
        if(!isValidString(session.title)) { return res.status(400).send({message: 'Please provide a valid name for your program'});}

        try {
            const newSession= await Session.create( {
                title: session.title,
                description: session.description,
                ProgramId : id_program,
            })
            const id = newSession.id_session;
            console.log(id, 'id');
            return res.status(201).json({id})
        } catch (error) {
            return res.status(500).send({message:`Failed to create a new session for ${token}`});
        }
    });

    // Ex of a session
    app.get('/api/exercise_of_session/:id_session', async (req,res) => {
        const id_session = req.params.id_session;
        const exercises = await Exercise.findAll({where : {SessionId : id_session}});
        const exes = []
        for (let i = 0; i < exercises.length; i++) {
            const ex = await Ex.findOne({where: {id: exercises[i].ExId}});
            exes.push(ex);
        }
        return res.status(201).json({exes});
    });

    //Update a session by adding new exercises selected
    app.post('/api/update_session/:id_session', async (req, res) => {
        const id_session = req.params.id_session;
        const selectedExercises = req.body.selectedExercises;
        const sessions = await Session.findAll();
        const session = sessions.find((S) : boolean => S.id_session.toString() === id_session)
        if (!NotNull(session)){return res.status(401).send({message: `Can't add update the session`})}
        const exercises = await Exercise.findAll()
        const session_exercises = exercises.filter((E) => E.SessionId.toString() === id_session);
        //Remove them
        for (let i = 0; i < session_exercises.length; i++) {
            await Exercise.destroy({ where: { id_exercise: session_exercises[i].id_exercise } });
        }
        //Add new exercises
        for (let i = 0; i < selectedExercises.length; i++) {
            const exercise = selectedExercises[i];
            await Exercise.create({SessionId : id_session, ExId : exercise.id});
        }
        const ProgramId = session.ProgramId;
        return res.status(201).json({ProgramId})
    });

    //get All programs of a user
    app.get('/api/programs/:token', async (req, res) => {
        const token = req.params.token;
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        if (!NotNull(current_user)) {return res.status(401).send({message: `Error Session doesn't exist`});}
        const programs = await Program.findAll()
        const user_programs = programs.filter((P) : boolean => P.UserId === current_user.mail);
        return res.status(201).send({user_programs})
    });

    app.put('/api/delete_program/:token/:id_program', async (req, res) => {
        const id_program = req.params.id_program;
        const token = req.params.token;
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        if (!NotNull(current_user)) {return res.status(401).send({message: `Error Session doesn't exist`});}
        const programs = await Program.findAll()
        const program = programs.filter((P) : boolean => P.id_program.toString() === id_program);
        if (!NotNull(program)) {return res.status(401).send({message: `Error Program doesn't exist`});}
        await Program.destroy({ where: { id_program: id_program } });
        return res.status(200).send({message : `Success to delete program ${program.title}`});
    });

    //get All sessions for a program
    app.get('/api/program/sessions/:id_program', async (req, res) => {
        const id_program = req.params.id_program;
        const programs = await Program.findAll()
        const program = programs.find((P) : boolean => P.id_program.toString() === id_program);
        if (!NotNull(program)) {return res.status(401).send({message: `Error Program doesn't exist`});}
        const sessions = await Session.findAll();
        const program_sessions = sessions.filter((S) : boolean => S.ProgramId.toString() === id_program);
        return res.status(201).send({program, program_sessions});
    });


    app.put('/api/program/:id_program/delete/:id_session', async (req, res) => {
        const id_program = req.params.id_program;
        const id_session = req.params.id_session;
        const result = await Session.destroy({ where: { id_session: id_session, ProgramId: id_program } });
        if(result === 0) {return res.status(401).send({message: `Error Session doesn't exist`});}
        return res.status(200).send({message : `Success to delete session`});
    });

    app.put('/api/program/sessions/exercises', async (req, res)=> {
        console.log('bdcjcdibci');
        const sessions = req.body.sessions;
        console.log(sessions);
        const exercises_per_session = [];
        for (let i = 0; i < sessions.length; i++) {
            const exercises = await Exercise.findAll({where: {SessionId: sessions[i].id_session}});
            const exes = []
            for (let j = 0; j <  exercises.length; j++) {
                exes.push(await Ex.findOne({where: {id: exercises[j].ExId}}))
            }
            exercises_per_session.push(exes);
        }
        console.log(exercises_per_session);
        return res.status(201).json({exercises_per_session});
        })

    //get All events of a user
    app.get('/api/events/:token', async (req, res) => {
        const token = req.params.token;
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        console.log(current_user)
        if (!NotNull(current_user)) {return res.status(401).send({message: `Error Session doesn't exist`});}
        const user_events = await Event_.findAll({where: {UserId: current_user.mail}});
        return res.status(201).send({user_events})
    });

    //create a new event
    app.post('/api/new_event/:token', async (req, res) => {
        const token = req.params.token;
        const event = req.body;
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        const already = await Event_.findAll({ where: { title: event.title, UserId: current_user.mail} });
        if(already.length >= 1) { return res.status(400).send({message: `title already exists ${event.title}`});}
        if(!isValidString(event.title)) { return res.status(400).send({message: 'Please provide a valid title'});}

        try {
            const newEvent =  await Event_.create({
                title: event.title,
                start: event.start,
                end: event.end,
                primary: event.primary,
                secondary: event.secondary,
                secondaryText: event.secondaryText,
                UserId: current_user.mail
            })
            const id_event = newEvent.title
            return res.status(201).json({id_event})
        } catch (error) {
            return res.status(500).send({message:`Failed to create a new event ${token}`})
        }
    });
    //Delete an event
    app.put('/api/delete_event/:token/:title', async (req, res) => {
        const token = req.params.token;
        const title = req.params.title;
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        const result = await Event_.destroy({ where: { title: title, UserId: current_user.mail} });
        if(result === 0) {return res.status(401).send({message: `Error Event doesn't exist`});}
        return res.status(200).send({message : `Success to delete session`});
    });
})
()
