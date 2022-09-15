const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path")
const Jwt = require("jsonwebtoken")
const jwtkey = 'e-comm'
app.set('view engine', 'ejs');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const oneDay = 1000 * 60 * 60 * 24;
const bodyParser = require("body-parser");
//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));
var session;

app.use('/style', express.static(path.join(__dirname, '/src/css')));
app.use('/script', express.static(path.join(__dirname, '/scripts')));
app.use(bodyParser.urlencoded({
    extended : true
}));

app.use('/required', express.static('required'));
app.use(express.static(__dirname));

require("./db/config");
const User = require("./db/User");
const Product = require("./db/Product");
app.use(express.json());
app.use(cors());

// API for signup user which take name, email and password
app.post("/register", async (req, res) => {
    let user = new User(req.body);
    let result = await user.save()
    result = result.toObject();
    delete result.password
    Jwt.sign({ result }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            res.send({ result: "something went wrong" })
        }
        else {
            session=req.session;
            session.userid=user;
            session.token = token;
            res.redirect("/")
        }
    })
})

// API for login user which take email and password as a params
app.post("/login", async (req, res) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password")
        if (user) {
            Jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    res.send({ result: "something went wrong" })
                }
                else {
                    session=req.session;
                    session.userid=user;
                    session.token = token
                    res.redirect("/")
                }
            })
        }
        else {
            res.send({ result: "No user found" })
        }
    }
    else {
        res.send({ result: "No data found..!!" })
    }

})

// API for create product which take name, price, category, and company as a params
app.post('/add-product', verifyToken, async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save()
    res.send(result);
})

// api for home page and product listing
app.get("/users", verifyToken, async (req, res) => {
    let users = await User.find();
    if (users.length > 0) {
        res.render("users", {"users" : users, "session" : session})
    }
    else {
        res.render("users", {"session" : session})
    }
})


// api for home page and product listing
app.get("/", async (req, res) => {
    let products = await Product.find();
    if (products.length > 0) {
        products = products
    }
    else {
        res.send({ 'result': "No products found" })
    }

    session=req.session;
    if(session.userid){
        res.render('productList',{"products" : products, "session" : session})
    }else
    res.render('login', {"session" : session})
})

// API for delete product which take product id as params
app.delete("/product/:id", verifyToken, async (req, res) => {
    const result = await Product.deleteOne({ _id: req.params.id })
    res.send(result)

})

// API for get single product data
app.get("/product/:id", verifyToken, async (req, res) => {
    let result = await Product.findOne({ _id: req.params.id })
    if (result) {
        res.send(result)
    }
    else {
        res.send({ "result": "No record found" });
    }
})

// API for update product which take product id and update key as params
app.put("/product/:id",verifyToken, async (req, res) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    )
    res.send(result)
})

function verifyToken(req, res, next) {
    let token;
    if(session)
    {
        token = session.token
    }
    if (token) {
        Jwt.verify(token, jwtkey, (err, success) => {
            if(err) {
                res.status(401).send({ result: "Please send valid token" })
            }else
            {
                next()
            }
           
        })
    }
    else {
        res.status(403).send({result: "please send token in header"})
    }
}

app.get('/add-product', (req, res)=>{
    res.render('add_product', {"session" : session})
})

app.get('/signup', (req, res)=>{
    res.render('signup', {"session" : session})
})

app.get('/login', (req, res)=>{
    res.render('login', {"session" : session})
})

app.get('/update', (req, res)=>{
    res.render('updateProduct', {"session" : session})
})

app.get('/logout',(req,res) => {
    req.session.destroy();
    session = req.session
    res.redirect('/login')
});

app.listen(5000)