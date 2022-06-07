class AdminController {

    static async index(req, res, next) {
        return res.render('admin');
    }
}

module.exports = AdminController; 