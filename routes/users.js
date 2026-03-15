var express = require("express");
var router = express.Router();

let userModel = require("../schemas/users");
let roleModel = require("../schemas/roles");
let userController = require("../controllers/users");


// GET ALL USERS
router.get("/", async function (req, res) {
  try {

    let users = await userModel
      .find({ isDeleted: false })
      .populate("role");

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET USER BY ID
router.get("/:id", async function (req, res) {
  try {

    let user = await userModel.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// CREATE USER
router.post("/", async function (req, res) {
  try {

    let { username, password, email, role } = req.body;

    let existedUser = await userModel.findOne({
      $or: [{ username }, { email }],
      isDeleted: false
    });

    if (existedUser) {
      return res.status(400).json({
        message: "Username or email already exists"
      });
    }

    let roleData = await roleModel.findOne({
      _id: role,
      isDeleted: false
    });

    if (!roleData) {
      return res.status(400).json({
        message: "Role not found"
      });
    }

    let newUser = await userController.CreateAnUser(
      username,
      password,
      email,
      role
    );

    res.status(201).json(newUser);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// UPDATE USER
router.put("/:id", async function (req, res) {
  try {

    let updatedUser = await userModel
      .findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
      .populate("role");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// DELETE USER (soft delete)
router.delete("/:id", async function (req, res) {
  try {

    let user = await userModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.isDeleted = true;

    await user.save();

    res.status(200).json({
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ENABLE USER
router.post("/enable", async function (req, res) {
  try {

    let { email, username } = req.body;

    let user = await userModel.findOne({
      email,
      username,
      isDeleted: false
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.status = true;
    await user.save();

    res.json({ message: "User enabled successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DISABLE USER
router.post("/disable", async function (req, res) {
  try {

    let { email, username } = req.body;

    let user = await userModel.findOne({
      email,
      username,
      isDeleted: false
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.status = false;
    await user.save();

    res.json({ message: "User disabled successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;