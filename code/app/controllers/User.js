const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RUManager = require('./helpers/RecordUserManager');
const DevRecord = require("../models/DevRecord");
const TrainRecord = require("../models/TrainRecord");
const TestRecord = require("../models/TestRecord");

class UserController {

    static async loginUser(req, res, next) {
        let data = {
            username: req.body.username
        }
        User.findOne(data, (err, user) => {
            if (err) {
                console.log("Something went wrong at login");
                console.log(err)
                return next(err);
            }
            if (!user) {
                return res.render('login', {message: "Uporabnik ne obstaja."});
                // return res.redirect('/login?error="Uporabnik ne obstaja"');
            }
            let passwordOK = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordOK) {
                return res.render('login', {message: "Napačno geslo za uporabnika " + user.username});
            }

            req.session.user = user.toObject();
            return res.redirect("/");

        });

    }

    static async editUser(req, res, next) {
        try {
            //if (req.query.msg) res.locals.msg = req.query.msg;
            //if (req.query.error) res.locals.error = req.query.error;
            if (req.body.userId) {
                let {
                    userId,
                    username,
                    name,
                    email,
                    organisation,
                    newpassword,
                    alsoGiveMore,
                    testAssigned,
                    devAssigned,
                    trainAssigned
                } = req.body;

                let user = User.findById(userId);
                if (!user) {
                    throw new Error('editUser: Uporabnik z id ' + userId + ' ne obstaja!');
                }
                //console.log(user);
                //res.locals.mode = 'edit';
                //res.locals.user = user;
                if (!newpassword) {
                    await User.findByIdAndUpdate(userId, {name, username, email, organisation});
                } else {
                    let hashedPassword = bcrypt.hashSync(newpassword);
                    await User.findByIdAndUpdate(userId, {
                        name,
                        username,
                        email,
                        organisation,
                        password: hashedPassword
                    });
                }
                console.log("Checkpoin 1");

                if (alsoGiveMore === "true") {
                    await RUManager.AssignRecordsToUser(await User.findById(userId), 0, devAssigned, trainAssigned, testAssigned);
                }

                console.log("Checkpoin 2");
                console.log("aamm res locals", res.locals);
                console.log("aamm res session", res.session);
                console.log("aamm req session", req.session);
                return res.render('manageUsers');
            } else {
                //res.locals.mode = 'new';
                return res.render('manageUsers');
            }
            return res.render('manageUsers');
        } catch (err) {
            console.log("Edit user error")
            console.log(err);
            next(err);
        }
    }

    // POST - Create user ... well actually its used as GET
    static async createUser(req, res, next) {
        // console.log("-----------Creating new user");
        // console.log(req.query);
        try {
            //let {name, username, password, repeatPassword, organisation} = req.body;
            let name = req.query["name"];
            let username = req.query["username"];
            let email = req.query["email"];
            let password = req.query["password"];
            let repeatPassword = req.query["repeatPassword"];
            let organisation = req.query["organisation"];
            let numberOfRecordsToGive = req.query["numberOfRecordsToGive"];
            let adminCreate = req.query["adminCreate"] || "";
            if (adminCreate) {
                repeatPassword = password;
            } else {
                // TEMPORARY DON'T NEED REGULAR REGISTER PAGE...
                return res.redirect('/register?error="Register temporary disabled"')
            }

            if (password != repeatPassword) {
                return res.redirect('/register?error="Gesli se ne ujemata!"');
            }

            if (!username || !name) {
                return res.redirect('/register?error="Manjkajo obvezni parametri!"');
            }

            let hashedPassword = bcrypt.hashSync(password);
            let user = await User.create({name, email, username, password: hashedPassword, organisation});

            // give each user a specific amount of records
            await RUManager.AssignRecordsToUser(user, numberOfRecordsToGive);

            return res.redirect('/manageUsers');
        } catch (err) {
            console.log("error at create user");
            next(err);
        }

    }

    // PUT - Update user
    static async updateUser() {
        try {
            let {userId, name, username, password, repeatPassword, organisation} = req.body;

            if (password != repeatPassword) {
                return res.redirect(`/User/editUser?userId=${userId}&error="Gesli se ne ujemata!"`);
            }

            let hashedPassword = bcrypt.hashSync(password);

            await User.findByIdAndUpdate(userId, {name, password: hashedPassword, organisation});

            return res.redirect(`/User/editUser?userId=${userId}&msg="Uporabnik uspešno urejen!"`);

        } catch (err) {
            next(err);
        }
    }


    // DELETE - Delete user API
    static async deleteUser(req, res, next) {
        try {
            if (!res.locals.user?.admin) {
                return res.status(403).send("Forbidden! Must be admin...")
            }

            let {userId, odstraniUporabnikaChk} = req.body;

            if (!userId) {
                return res.status(400).send('UserId must not be null!');
            }

            if (!odstraniUporabnikaChk) {
                return res.status(400).send('Assurance checkbox must be checked!');
            }

            let user = await User.findById(userId);

            if (!user) {
                return res.status(404).send(`User with ID=${userId}not found!`);
            }

            await User.findByIdAndDelete(userId);

            // return res.end(); // OK
            return res.redirect('/manageUsers');
        } catch (err) {
            next(err);
        }
    }

    // Remove records from user
    static async removeRecords(req, res, next) {

        try {
            if (!res.locals.user?.admin) {
                return res.status(403).send("Forbidden! Must be admin...")
            }

            let {userId, odstraniRecordeChk} = req.body;

            if (!userId) {
                return res.status(400).send('UserId must not be null!');
            }

            if (!odstraniRecordeChk) {
                return res.status(400).send('Assurance checkbox must be checked!');
            }

            let user = await User.findById(userId);

            if (!user) {
                return res.status(404).send(`User with ID=${userId}not found!`);
            }

            await RUManager.UnassignAllRecordsFromUser(user);
            return res.redirect('/manageUsers');
        } catch (err) {
            next(err);
        }
    }

    static async updateUsersProgresses(req, res, next) {
        // update user progress
        if (!res.locals.user?.admin) {
            return res.status(403).send("Forbidden! Must be admin...");
        }
        let users = await User.find();
        for (const user of users) {
            for (const file of ['dev.tsv', 'train.tsv', 'test.tsv']) {
                if (!user.admin) {
                    if (user) {
                        // console.log(user.numRecordsAssigned, user.name, "A")
                        if (user.numRecordsAssigned) {
                            if (file === 'dev.tsv') user.numRecordsAssigned[0] = await DevRecord.count({
                                'assignedUser': user._id.toString(),
                                'edited': true
                            });
                            if (file === 'train.tsv') user.numRecordsAssigned[2] = await TrainRecord.count({
                                'assignedUser': user._id.toString(),
                                'edited': true
                            });
                            if (file === 'test.tsv') user.numRecordsAssigned[4] = await TestRecord.count({
                                'assignedUser': user._id.toString(),
                                'edited': true
                            });
                            user.save();
                        }
                        // console.log(user.numRecordsAssigned, user.name, "B")
                    } else {

                    }
                }
            }
        }
        return res.redirect('/manageUsers');
    }

}

module.exports = UserController;