const Relation = require('../models/Relation');
const DefaultComment = require('../models/DefaultComment');
const DevRecord = require('../models/DevRecord');
const Users = require('../models/User')
const TrainRecord = require("../models/TrainRecord");
const TestRecord = require("../models/TestRecord");

class HomeController {

    static async loginPage(req, res, next) {
        try {
            res.render('login');
        } catch (err) {
            console.log("Home Login error");
            console.log(err);
            next(err);
        }
    }

    static async registerPage(req, res, next) {
        let errData = {message: ""};
        errData.message = req.query.error;
        // console.log(errData);
        res.render('register', errData);
    }

    static async editUser(req, res, next) {
        try {
            res.render('editUser');
        } catch (err) {
            console.log("Res render edit user error");
            console.log(err);
            next(err);
        }
    }

    static async manageUsers(req, res, next) {
        console.log("we at manageUsers")
        try {
            res.locals.users = await Users.find();

            let remainingDev = await DevRecord.count({'assignedUser': {'$exists': false}});
            let remainingTrain = await TrainRecord.count({'assignedUser': {'$exists': false}});
            let remainingTest = await TestRecord.count({'assignedUser': {'$exists': false}});
            res.locals.remainingStats = `Remaining unassigned:\nDev: ${remainingDev}\nTrain: ${remainingTrain}\nTest: ${remainingTest}`

            // await this.updateUserProgress(res.locals.users);
            res.render('manageUsers');
        } catch (err) {
            console.log("Manage users error..");
            console.log(err);
            next(err);
        }

    }

    static async index(req, res, next) {
        res.redirect('/Record/editFile');
    }


}

module.exports = HomeController; 