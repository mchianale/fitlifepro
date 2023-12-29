import {DataTypes} from 'sequelize';
const sequelize = require('./sequelize-config.ts');
//User
const User = sequelize.define('userfit', {
    mail: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mdp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '', // Set the default value to an empty string
    },
}, {timestamps: false});

//Exercise
const Exercise = sequelize.define('exercise', {
    id_exercise : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
}, {timestamps: false});

//Session
const Session = sequelize.define('session', {
    id_session : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
    },
    creation_date: {
        type : DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, {timestamps: false});

//Program
const Program = sequelize.define('program', {
    id_program : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    goal: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    creation_date: {
        type : DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, {timestamps: false});



const Ex = sequelize.define('ex', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    bodyPart: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    equipment: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gifUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    target: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    secondaryMuscles: {
        type: DataTypes.ARRAY(DataTypes.STRING),
    },
    instructions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
    },
}, {
    timestamps: false,
});

const Event_ = sequelize.define('event', {
    title: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    start: {
        type : DataTypes.DATE,
        allowNull: false,
    },
    end: {
    type : DataTypes.DATE,
        allowNull: false,
    },

    primary: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    secondary: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    secondaryText: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {timestamps: false});
//Define all the relations
// Define the association between LearningPackage and LearningFact with the relation 'fact_in_packages'
User.hasMany(Program, { as: 'user_program', foreignKey: 'UserId' });
Program.belongsTo(User, { foreignKey: 'UserId' });

Program.hasMany(Session, { as: 'program_session', foreignKey: 'ProgramId', onDelete: 'CASCADE' });
Session.belongsTo(Program, { foreignKey: 'ProgramId' });

Session.hasMany(Exercise, { as: 'session_exercise', foreignKey: 'SessionId', onDelete: 'CASCADE'});
Exercise.belongsTo(Session, { foreignKey: 'SessionId' });

Ex.hasMany(Exercise, { as: 'ex_exercise', foreignKey: 'ExId',onDelete: 'CASCADE' });
Exercise.belongsTo(Session, { foreignKey: 'ExId' });

User.hasMany(Event_, { as: 'user_event', foreignKey: 'UserId', onDelete: 'CASCADE'  });
Event_.belongsTo(User, { foreignKey: 'UserId' });
export  {User, Program, Session, Exercise, Ex, Event_}