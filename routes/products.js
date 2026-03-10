var express = require("express");
var router = express.Router();
let productModel = require("../schemas/products");
const { default: slugify } = require("slugify");

// CREATE product
router.post("/", async function (req, res, next) {
  try {
    const product = new productModel({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: "-",
        remove: undefined,
        lower: true,
        strict: false,
      }),
      description: req.body.description,
      price: req.body.price,
      images: req.body.image,
      category: req.body.category,
    });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL products (no query allowed)
router.get("/", async function (req, res, next) {
  try {
    // Ignore any query params, always return all
    const products = await productModel.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE product by id
router.get("/:id", async function (req, res, next) {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE product by id
router.put("/:id", async function (req, res, next) {
  try {
    const updated = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE product by id
router.delete("/:id", async function (req, res, next) {
  try {
    const deleted = await productModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;