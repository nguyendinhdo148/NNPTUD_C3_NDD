var express = require('express');
var router = express.Router();

let userModel = require('../schemas/users');
let roleModel = require('../schemas/roles');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// đọc key RS256
const privateKey = fs.readFileSync('./private.key');
const publicKey = fs.readFileSync('./public.key');


// =======================
// CHECK LOGIN
// =======================

function CheckLogin(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(token, publicKey, {
            algorithms: ["RS256"]
        });

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid token"
        });

    }
}


// =======================
// LOGIN
// =======================

router.post('/login', async function(req,res){

    try{

        let {username,password} = req.body;

        let user = await userModel.findOne({
            username:username,
            isDeleted:false
        });

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        const isMatch = password === user.password;

        if(!isMatch){
            return res.status(400).json({
                message:"Wrong password"
            });
        }

        const token = jwt.sign(
            { id:user._id },
            privateKey,
            {
                algorithm:"RS256",
                expiresIn:"1h"
            }
        );

        res.json({
            message:"Login success",
            token:token
        });

    }catch(err){

        res.status(500).json({
            error:err.message
        });

    }

});


// =======================
// GET ME
// =======================

router.get('/me',CheckLogin,async function(req,res){

    try{

        let user = await userModel
        .findById(req.user.id)
        .populate("role")
        .select("-password");

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        res.json(user);

    }catch(err){

        res.status(500).json({
            error:err.message
        });

    }

});


// =======================
// CHANGE PASSWORD
// =======================

router.post('/change-password',CheckLogin,async function(req,res){

    try{

        let {oldPassword,newPassword} = req.body;

        if(!oldPassword || !newPassword){
            return res.status(400).json({
                message:"Missing password"
            });
        }

        if(newPassword.length < 6){
            return res.status(400).json({
                message:"New password must be at least 6 characters"
            });
        }

        let user = await userModel.findById(req.user.id);

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword,user.password);

        if(!isMatch){
            return res.status(400).json({
                message:"Old password incorrect"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword,salt);

        user.password = hashedPassword;

        await user.save();

        res.json({
            message:"Password changed successfully"
        });

    }catch(err){

        res.status(500).json({
            error:err.message
        });

    }

});


// =======================
// GET all users
// =======================

router.get('/', async function(req, res, next) {
    try {

        let users = await userModel
            .find({ isDeleted: false })
            .populate('role');

        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// GET user by id
// =======================

router.get('/:id', async function(req, res, next) {
    try {

        let user = await userModel.findOne({
            _id: req.params.id,
            isDeleted: false
        }).populate('role');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// CREATE user
// =======================

router.post('/', async function(req, res, next) {
    try {

        let { username, password, email, fullName, role } = req.body;

        let existedUser = await userModel.findOne({
            $or: [
                { username: username },
                { email: email }
            ],
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser = new userModel({
            username: username,
            password: hashedPassword,
            email: email,
            fullName: fullName || "",
            avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
            status: req.body.status || false,
            role: role,
            loginCount: 0
        });

        await newUser.save();

        let populatedUser = await userModel
            .findById(newUser._id)
            .populate('role');

        res.status(201).json(populatedUser);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// =======================
// UPDATE user
// =======================

router.put('/:id', async function(req, res, next) {
    try {

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        if (req.body.role) {

            let role = await roleModel.findOne({
                _id: req.body.role,
                isDeleted: false
            });

            if (!role) {
                return res.status(400).json({
                    message: "Role not found"
                });
            }
        }

        let updatedUser = await userModel
            .findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            )
            .populate('role');

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


// =======================
// DELETE user
// =======================

router.delete('/:id', async function(req, res, next) {
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
            message: "User deleted successfully",
            user: user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// ENABLE user
// =======================

router.post('/enable', async function(req, res, next) {
    try {

        let { email, username } = req.body;

        let user = await userModel.findOne({
            email: email,
            username: username,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found with provided email and username"
            });
        }

        user.status = true;
        await user.save();

        res.status(200).json({
            message: "User enabled successfully",
            user: {
                username: user.username,
                email: user.email,
                status: user.status
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// DISABLE user
// =======================

router.post('/disable', async function(req, res, next) {
    try {

        let { email, username } = req.body;

        let user = await userModel.findOne({
            email: email,
            username: username,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found with provided email and username"
            });
        }

        user.status = false;
        await user.save();

        res.status(200).json({
            message: "User disabled successfully",
            user: {
                username: user.username,
                email: user.email,
                status: user.status
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;