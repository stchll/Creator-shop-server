const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const dns = require("dns");
const app = express();
const cors = require("cors");
require("dotenv").config()

const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"admin")))

dns.setServers([
    `1.1.1.1`,
    `8.8.8.8`
])

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