const Relation = require('../models/Relation');
const DevRecord = require('../models/DevRecord');
const Users = require('../models/User')
const TrainRecord = require("../models/TrainRecord");
const TestRecord = require("../models/TestRecord");

class HomeController {

    static async loginPage(req, res, next) {
        res.render('login');
    }

    static async registerPage(req, res, next) {
        let errData = {message: ""};
        errData.message = req.query.error;
        // console.log(errData);
        res.render('register', errData);
    }

    static async editUser(req, res, next) {
        res.render('editUser');
    }

    static async manageUsers(req, res, next) {
        res.locals.users = await Users.find();
        // await this.updateUserProgress(res.locals.users);
        res.render('manageUsers');
    }

    static async index(req, res, next) {
        res.redirect('/Record/editFile');
    }


}

module.exports = HomeController; 