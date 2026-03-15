var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');
// GET all roles (không bị xóa mềm)
router.get('/', async function(req, res, next) {
    try {
        let roles = await roleModel.find({ isDeleted: false });
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET role by ID
router.get('/:id', async function(req, res, next) {
    try {
        let role = await roleModel.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE role
router.post('/', async function(req, res, next) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description || ""
        });
        await newRole.save();
        res.status(201).json(newRole);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// UPDATE role
router.put('/:id', async function(req, res, next) {
    try {
        let updatedRole = await roleModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedRole) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json(updatedRole);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE role (soft delete)
router.delete('/:id', async function(req, res, next) {
    try {
        let deletedRole = await roleModel.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );
        if (!deletedRole) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json({ message: "Role deleted successfully", role: deletedRole });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/users', async function(req, res, next) {
    try {

        let role = await roleModel.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!role) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        let users = await userModel
            .find({
                role: req.params.id,
                isDeleted: false
            })
            .populate('role');

        res.status(200).json({
            role: role,
            users: users
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;