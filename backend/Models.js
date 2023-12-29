"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event_ = exports.Ex = exports.Exercise = exports.Session = exports.Program = exports.User = void 0;
const sequelize_1 = require("sequelize");
const sequelize = require('./sequelize-config.ts');
//User
const User = sequelize.define('userfit', {
    mail: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    firstname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    mdp: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: '', // Set the default value to an empty string
    },
}, { timestamps: false });
exports.User = User;
//Exercise
const Exercise = sequelize.define('exercise', {
    id_exercise: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
}, { timestamps: false });
exports.Exercise = Exercise;
//Session
const Session = sequelize.define('session', {
    id_session: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
    },
    creation_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, { timestamps: false });
exports.Session = Session;
//Program
const Program = sequelize.define('program', {
    id_program: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    goal: {
        type: sequelize_1.DataTypes.STRING,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
    },
    creation_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, { timestamps: false });
exports.Program = Program;
const Ex = sequelize.define('ex', {
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    bodyPart: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    equipment: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    gifUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    target: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    secondaryMuscles: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
    },
    instructions: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
    },
}, {
    timestamps: false,
});
exports.Ex = Ex;
const Event_ = sequelize.define('event', {
    title: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    start: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    end: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    primary: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    secondary: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    secondaryText: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }
}, { timestamps: false });
exports.Event_ = Event_;
//Define all the relations
// Define the association between LearningPackage and LearningFact with the relation 'fact_in_packages'
User.hasMany(Program, { as: 'user_program', foreignKey: 'UserId' });
Program.belongsTo(User, { foreignKey: 'UserId' });
Program.hasMany(Session, { as: 'program_session', foreignKey: 'ProgramId', onDelete: 'CASCADE' });
Session.belongsTo(Program, { foreignKey: 'ProgramId' });
Session.hasMany(Exercise, { as: 'session_exercise', foreignKey: 'SessionId', onDelete: 'CASCADE' });
Exercise.belongsTo(Session, { foreignKey: 'SessionId' });
Ex.hasMany(Exercise, { as: 'ex_exercise', foreignKey: 'ExId', onDelete: 'CASCADE' });
Exercise.belongsTo(Session, { foreignKey: 'ExId' });
User.hasMany(Event_, { as: 'user_event', foreignKey: 'UserId', onDelete: 'CASCADE' });
Event_.belongsTo(User, { foreignKey: 'UserId' });
//# sourceMappingURL=Models.js.map