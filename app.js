const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const multer = require("multer");
const dns = require("dns");

require("dotenv").config();



const PORT = process.env.PORT || 3000;

const productLimiter = rateLimit({
    windowMs: 5 * 1000,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests. Try again later."
    }
});

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "admin")));
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const safeName = file.originalname
            .replace(ext, "")
            .replace(/[^a-zA-Z0-9]/g, "_");

        cb(null, `${Date.now()}-${safeName}${ext}`);
    }
});

const upload = multer({ storage: storage });

dns.setServers([
    `1.1.1.1`,
     `8.8.8.8`
]);

mongoose.connect(process.env.DATABASE_URL)
    .then(() => 
        console.log(`Mongo DB connected!`
    ))
    .catch((error) => 
        console.error(`Error with database:`, error)
    );

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    rating: Number,
    image: String,
});

const Product = mongoose.model("Product", productSchema);

app.get("/products", async (req, res) => {
    try {
        const products = await Product.find(req.query);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/product", productLimiter, upload.single("image"), async (req, res) => {
    try {
        const data = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

        const newProduct = new Product({
            title: data.title,
            description: data.description,
            price: Number(data.price),
            rating: Number(data.rating),
            image: imagePath
        });

        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: error.message });
    }
});

app.delete("/product/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});