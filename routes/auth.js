var express = require("express");
var router = express.Router();

let userController = require('../controllers/users');
const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecretkey";

// ======================
// LOGIN
// ======================
router.post('/login', async function (req, res, next) {

    try {

        let { username, password } = req.body;

        let user = await userController.QueryLogin(username, password);

        if (!user) {
            return res.status(404).json({
                message: "Thong tin dang nhap khong dung"
            });
        }

        // tạo token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login success",
            token: token,
            user: user
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


// ======================
// REGISTER
// ======================
router.post('/register', async function (req, res, next) {

    try {

        let { username, password, email } = req.body;

        let newUser = await userController.CreateAnUser(
            username,
            password,
            email,
            '69b6231b3de61addb401ea26'
        );

        res.json(newUser);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


// ======================
// GET ME
// ======================
router.get('/me', async function (req, res, next) {

    try {

        let { username } = req.query;

        if (!username) {
            return res.status(400).json({
                message: "Please provide username"
            });
        }

        let user = await userController.GetUserByUsername(username);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


// ======================
// CHANGE PASSWORD
// ======================
router.post('/change-password', async function (req, res, next) {

    try {

        let { username, oldPassword, newPassword } = req.body;

        let result = await userController.ChangePassword(
            username,
            oldPassword,
            newPassword
        );

        if (!result) {
            return res.status(400).json({
                message: "Old password incorrect"
            });
        }

        res.json({
            message: "Password changed successfully"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;