var express = require("express");
var router = express.Router();

let userController = require("../controllers/users");

let {
  RegisterValidator,
  validatedResult,
  ChangePasswordValidator
} = require("../utils/validator");

let { CheckLogin } = require("../utils/authHandler");


// LOGIN
router.post("/login", async function (req, res) {
  try {

    let { username, password } = req.body;

    let result = await userController.QueryLogin(username, password);

    if (!result) {
      return res.status(404).send("thong tin dang nhap khong dung");
    }

    res.cookie("TOKEN_NNPTUD_C3", result, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false
    });

    res.send(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// REGISTER
router.post(
  "/register",
  RegisterValidator,
  validatedResult,
  async function (req, res) {

    try {

      let { username, password, email } = req.body;

      let newUser = await userController.CreateAnUser(
        username,
        password,
        email,
        "69b6231b3de61addb401ea26"
      );

      res.send(newUser);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


// GET ME
router.get("/me", CheckLogin, function (req, res) {
  res.send(req.user);
});


// CHANGE PASSWORD
router.post(
  "/changepassword",
  CheckLogin,
  ChangePasswordValidator,
  validatedResult,
  async function (req, res) {

    try {

      let { oldpassword, newpassword } = req.body;

      let result = await userController.ChangePassword(
        req.user,
        oldpassword,
        newpassword
      );

      if (!result) {
        return res.status(400).send("Old password incorrect");
      }

      res.send("doi thanh cong");

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


// LOGOUT
router.post("/logout", CheckLogin, function (req, res) {

  res.cookie("TOKEN_NNPTUD_C3", null, {
    maxAge: 0
  });

  res.send("logout");

});

module.exports = router;