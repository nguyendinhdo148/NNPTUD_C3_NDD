var express = require("express");
var router = express.Router();
let inventoryModel = require("../schemas/inventory");

// GET ALL (join product)
router.get("/", async (req, res) => {
  try {
    const data = await inventoryModel.find().populate("product");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET BY ID
router.get("/:id", async (req, res) => {
  try {
    const data = await inventoryModel
      .findById(req.params.id)
      .populate("product");

    if (!data) return res.status(404).json({ error: "Not found" });

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADD STOCK
router.post("/add-stock", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inv = await inventoryModel.findOne({ product });
    if (!inv) return res.status(404).json({ error: "Not found" });

    inv.stock += quantity;
    await inv.save();

    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REMOVE STOCK
router.post("/remove-stock", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inv = await inventoryModel.findOne({ product });
    if (!inv) return res.status(404).json({ error: "Not found" });

    if (inv.stock < quantity)
      return res.status(400).json({ error: "Not enough stock" });

    inv.stock -= quantity;
    await inv.save();

    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESERVATION
router.post("/reserve", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inv = await inventoryModel.findOne({ product });
    if (!inv) return res.status(404).json({ error: "Not found" });

    if (inv.stock < quantity)
      return res.status(400).json({ error: "Not enough stock" });

    inv.stock -= quantity;
    inv.reserved += quantity;

    await inv.save();

    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SOLD
router.post("/sold", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inv = await inventoryModel.findOne({ product });
    if (!inv) return res.status(404).json({ error: "Not found" });

    if (inv.reserved < quantity)
      return res.status(400).json({ error: "Not enough reserved" });

    inv.reserved -= quantity;
    inv.soldCount += quantity;

    await inv.save();

    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;