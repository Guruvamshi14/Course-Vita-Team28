const bcrypt = require("bcrypt");
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const mailSender = require('../utils/mailSender');
const otpGenerator = require('otp-generator');
const Otp = require('../models/otp');


exports.signup = async(req,res) => {

    try{
        const {
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            otp
        } = req.body;


        //validation
        if(!firstName || !lastName || !email || !password 
            || !otp) {
                return res.status(403).json({
                    success:false,
                    message:"All fields are required",
                })
        }

        

        //user already present
        const existingUser = await User.findOne({email});
        console.log(existingUser);
        if(existingUser) {
            // return res.status(400).json({
            //     success:false,
            //     message:'User is already registered',
            // });
            return res.render('signup', {
                message: "User is registered.",
                messageType: "error" // Optional: for styling purposes
            });
        }

        // sort => It will sort all the documents returend by the find function 
        // createdAt:-1 => Indicates that sorting is done in reverse Order
        //limit(1) => it limits the file to number 1
        const recentOtp = await Otp.find({identifier:email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        if(recentOtp.length == 0){
            return res.status(400).json({
                success:false,
                message:'OTPP Not Found',
            })
        }else if(otp !== recentOtp[0].otp){
            return res.status(400).json({
                success:false,
                message:'Invalid OTP',
            })
        }

        //Password is Hashed 
        const hashedPassword = await bcrypt.hash(password,10);


        //Creating an entry for the user
        const user = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password:hashedPassword,
        })

        
        // return res.status(200).json({
        //     success:true,
        //     message:'User is registered Successfully',
        //     user,

        // });
        return res.render('Home', { firstName });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registrered. Please try again",
        })
    }
}



//login 
exports.login = async(req,res) =>{
    try{

        //Data from the req body
        const {email,password} = req.body;

        //validation
        if(!email || !password)
            return res.status(403).json({
                success:false,
                message:'ALL Fields are requried Plesase try again'
        });


       // Check if the user is present in the DB or not
        const user = await User.findOne({ email });
        if (!user) {
            // Instead of returning an error response, render the 'login' view with an error message
            return res.render('login', {
                message: "User is not registered. Please sign up first.",
                messageType: "error" // Optional: for styling purposes
            });
        }


        //Comapare password
        if(await bcrypt.compare(password,user.password)){

            const payload = {
                email:user.email,
                id:user._id,
            }

            //User is information is stored in the DataBase
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });

            user.token = token;
            user.password = undefined;

            //Setting the time for the token validation
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }

            // res.cookie("token",token,options).status(200).json({
            //     succes:true,
            //     token,
            //     user,
            //     message:'Logged in successfully',
            // })
            
            res.cookie("token", token, options);
            return res.render('Home', { user });

        }else{
            return res.render('login', {
                message: "Password is incorrect",
                messageType: "error" // Optional: for styling purposes
            });
        }
        

    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:'Eror while login',
        });
    }
}

exports.auth = async(req,res,next) => {
    try{
        const token = req.cookies.token ||
                        req.body.token ||
                        req.header("Authorization").replace("Bearer ","");

        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }

        //verify the token
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(error){
            //verification - issue
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();

    }catch(error){
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
}


exports.verifyOtp = async (req, res) => {
    const { otp } = req.body;

    try {
        const user = await User.find({ otp }).sort({createdAt:-1}).limit(1);

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Further processing...
        // If successful:
        // return res.status(200).json({ message: 'OTP verified successfully and Start Payment' });
        res.render("end", { message: "", messageType: "" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


exports.sendOtp = async (req,res,next) => {

    const email = req.user.email;

    console.log("EMail ",email);

     //It generates otp with only numbers
     var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });

    console.log(otp);

    // const userdetails = await Otp.findOn

    const otpBody = await Otp.create({
        identifier:email,
        otp:otp
    });

    console.log(otpBody);

    console.log("OTP in DB",otpBody);
    try{
        const mailResponse = await mailSender(email, "CourseVita Payment Verification", otp);
        console.log("Email sent Successfully: ", mailResponse);
    }
    catch(error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }

    // return res.status(200).json({ message: 'OTP Sent' });
    res.render("PaymentOtp", { message: "", messageType: "" });
    
};

