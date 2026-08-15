const express = require("express");

const app = express();
const cors = require("cors");
require("dotenv").config()

const PORT = 3000;

const path = require("path");

const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"admin")));
app.use("/uploads",express.static(path.join(__dirname,"uploads")))

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null,"uploads/");
    },

    filename: function(req,file,cb) {
        cb(null,`${Date.now()}-${file.originalname}`);
    }
})

const uplaod = multer({storage: storage});

const dns = require("dns");

dns.setServers([
    `1.1.1.1`,
    `8.8.8.8`
])

const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL)
.then(()=>{
    console.log(`Mongo DB is already connected!`);
})
.catch((error) => {
    console.error(`Error with database!`);
})

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    rating: Number,
    image: String,
})

const Product = mongoose.model("Product", productSchema)

app.post("/upload",uplaod.single("file") , (req,res) => {
    console.log(req.file);

    res.send(`File sucsessful uploaded!`)
})

app.get("/images",(req,res) => {
    const fs = require("fs");
    const dir = path.join(__dirname,"uploads");

    fs.readdir(dir, (err,files) => {
        if (err) {
            return res.status(500).send(`Unable to read file!`);
        }

        const imageUrl = files.map(file => `/uploads/${file}`);
        res.json(imageUrl);
    })
})

app.get("/products",async (req,res) => {
    const products = await Product.find(req.query);

    res.status(200).json(products)
})

app.post("/product",async(req,res) => {
    const data = req.body;

    console.log(data);
    

    const newProduct = new Product({
        title: data.title,
        description: data.description,
        price: data.price,
        rating: data.rating,
        image: data.image
    });

    const savedProduct = await newProduct.save();

    res.status(200).json(savedProduct)
});

app.delete("/product/:id", async (req,res) => {
    await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({message: "Products was deleted!"})
})

app.get("/hello",(req,res) => {
    res.json({message:"hello"})
})

app.listen(PORT,() => {
    console.log(`Server is running on PORT: ${PORT}`);
})