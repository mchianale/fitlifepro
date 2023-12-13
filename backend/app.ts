import * as express from "express";
import {Request, Response} from "express";
const bodyParser = require('body-parser');
const cors = require('cors');
//Pg Admin 4
const sequelize = require('./sequelize-config.ts');
import {User, Program, Session, Exercise, Ex} from './Models';
//Other fun
import {isValidPassword, isValidName} from "./other_comp";
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



    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    //GET LIVENESS
    app.get('/api/liveness', (req: Request, res: Response) => {
        res.status(200).send('API LIVE');
    });

    //LOGIN
    app.put('/api/login/:mail/:mdp', async (req, res) => {
        const mail =  req.params.mail
        const mdp = req.params.mdp
        const users = await User.findAll();
        const current_user = users.find((U) => U.mail === mail);
        if (current_user !== null && current_user !== undefined) {
            if (current_user.mdp === mdp){
                const token = Math.random().toString(36).substring(2) + Date.now().toString(36); //Token
                //Update token
                current_user.token = token
                await current_user.save()
                res.status(200).send({ token });
            }
            else {
                res.status(401).send('Invalid Password');
            }
        }
        else {
            res.status(404).send(`User doesn't exists for mail: ${mail}`);
        }
    });
    //DISCONNECT
    app.put('/api/disconnect/:token', async (req, res) => {
        const token =  req.params.token
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        if (current_user !== null && current_user !== undefined) {
            current_user.token = '';
            await current_user.save();
            res.status(200).send({});
         }else {
            res.status(404).send("Error Page doesn't exist");
        }
    });

    //REGISTER
    app.post('/api/register', async (req, res) => {
        const {mail, firstname, lastname, mdp} = req.body
        const users = await User.findAll();
        const already_user = users.find((U) => U.mail === mail);
        if (already_user !== null && already_user!== undefined) {
            res.status(401).send({message: `User already exists with mail: ${mail}`});
        }
        else if (isValidPassword(mdp) !== true) {
            res.status(404).send({message: 'please input a valid password, with at least 6 characters and at least one special charactere'});
        }
        else if(isValidName(firstname) !== true){
            res.status(406).send({message:'please input a valid firstname'});
        }
        else if(isValidName(lastname) !== true){
            res.status(403).send({message:'please input a valid lastname'});
        }
        else {
            try {
                const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
                await User.bulkCreate([
                    { mail: mail, firstname: firstname, lastname: lastname , mdp: mdp, token: token},
                ])
                res.status(200).json({token});
            } catch (error) {
                console.log('Failed to post a new package: ', error);
                res.status(405).send({message: `Failed to post a new package: ${error}`});
            }
        }


    });
    //Get General User Information
    app.get('/api/informations/:token', async (req: Request, res: Response) => {
        const token =  req.params.token
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        if (current_user !== null && current_user !== undefined) {
            res.status(200).send({
                mail: current_user.mail,
                firstname: current_user.firstname,
                lastname: current_user.lastname,
            });
        }else {
            res.status(404).send("Error Page doesn't exist");
        }

    });

    //Get all exercises
    app.get('/api/exercises', async (req, res) => {
        const exes = await Ex.findAll();
        res.status(200).send({exes})
    });

    //Get exercises by ID
    app.get('/api/exercises/:id', async (req, res) => {
        const id =  req.params.id
        const exes = await Ex.findAll();
        const ex = exes.find((E) => E.id === id);
        if (ex !== null && ex !== undefined) {
                res.status(200).send({ ex });
            }
        else {
            res.status(404).send(`Exercise doesn't exist: ${id}`);
        }
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
        res.status(200).send({ExFiltered});
    });

    app.post('/api/new_program/:token', async (req, res) => {
        const program = req.body;
        const token = req.params.token;
        const users = await User.findAll();
        const current_user = users.find((U) => U.token === token);
        if (program.title !== '' || program.title.trim() !== '') {
            try {
                const newProgram = await Program.create(  {
                    title: program.title,
                    goal: program.goal,
                    description: program.description,
                    UserId: current_user.mail
                })
                const id = newProgram.id_program;
                console.log(id, 'id');
                return res.status(200).json({id})
            } catch (error) {
                return res.status(400).send(`Failed to create a new program ${token}`)
            }
        } return res.status(401).send(`Please provided a title`)
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
        console.log(program)
        if (program !== null && program !== undefined) {
            if (session.title !== '' || session.title.trim() !== '') {
                try {
                    const newSession= await Session.create( {
                        title: session.title,
                        description: session.description,
                        ProgramId : id_program,
                    })
                    const id = newSession.id_session;
                    console.log(id, 'id');
                    return res.status(200).json({id})
                } catch (error) {
                    return res.status(400).send(`Failed to create a new session for ${token}`)
                }
            } else {
                return res.status(401).send(`Please be provided a title`)
            }
        } return res.status(404).send(`Please be connect`)
    });

    //Update a session by adding new exercises selected
    app.post('/api/update_session/:id_session', async (req, res) => {
        console.log('kkdkdl');
        const id_session = req.params.id_session;
        const selectedExercises = req.body.selectedExercises;
        console.log(id_session)
        console.log(selectedExercises)
        const sessions = await Session.findAll();
        const session = sessions.find((S) : boolean => S.id_session.toString() === id_session)
        if (session !== null && session !== undefined) {
            const exercises = await Exercise.findAll()
            const session_exercises = exercises.filter((E) => E.SessionId.toString() === id_session);
            console.log(session_exercises);
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
            return res.status(200).json({ProgramId})
        }
        else {
            return res.status(403).send('Failed to update session')
        }
    });
})()