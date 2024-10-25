const express = require("express");
const mongoose = require('mongoose');
const app = express();
const {loginViaMobile} = require('./controllers/loginViaMobile');
const {OtpViaEmail} = require('./controllers/OtpViaEmail');
const {signup} = require('./controllers/auth');
const {login} = require('./controllers/auth');
const {auth} = require('./controllers/auth');
const {verifyOtp} = require('./controllers/auth');
const {sendOtp} = require('./controllers/auth');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const path = require('path');

app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'ejs');

// Serve static files for CSS, images, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


mongoose.connect("mongodb://localhost:27017/CourseVitaHackathon")
.then(() => {
    console.log('DB Connected Successfully');
})
.catch((error) => {
    console.log('DB Connection Failed:', error);
});

app.use(express.json());
app.post('/api/auth/otp',OtpViaEmail); 
app.post('/api/auth/signup',signup); 
app.post('/api/auth/login',login);
// app.post('/api/auth/loginPage',login);

app.post('/api/auth/paymentOtp',auth,sendOtp);
app.get('/api/auth/verify',auth,(req,res)=>{
    res.send("Hello");
});

app.post('/api/auth/payment',verifyOtp);

const PORT = process.env.PORT || 5000; 

// app.listen(PORT,()=>{
//     console.log('Running at port 5000');
// })
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

app.post('/api/auth/otpPage', (req, res) => {
    res.render('otpRequest', { message: '', messageType: '' });
});

app.get("/", (req, res) => {
    res.render("signup", { message: "", messageType: "" });
});

app.set("view engine", "ejs");

// Login route
app.post("/api/auth/loginPage", (req, res) => {
    res.render("login", { message: "", messageType: "" });
});

app.get('/api/auth/tryPaymentOtp',(req,res) => {
    res.render("PaymentOtp", { message: "", messageType: "" });
})