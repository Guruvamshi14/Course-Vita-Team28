const Otp = require('../models/otp');
const User = require('../models/user');
const mailSender = require('../utils/mailSender');
const otpGenerator = require('otp-generator');


exports.OtpViaEmail = async(req,res) => {
    try{

        //input from the post man
        const{email} = req.body;

        // check the user is present or not
        const checkUserPresent = await User.findOne({email});

        //if user is present 
        if(checkUserPresent){
            return res.status(400).json({
                success:true,
                message:'User has already registered',
            })
        }

        //It generates otp with only numbers
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        console.log(otp);

        
        //storing in to the DataBase
        const otpBody = await Otp.create({
            identifier:email,
            otp:otp
        });

        console.log("OTP in DB",otpBody);

        try{
            const mailResponse = await mailSender(email, "CourseVita SignUp", otp);
            console.log("Email sent Successfully: ", mailResponse);
        }
        catch(error) {
            console.log("error occured while sending mails: ", error);
            throw error;
        }

        res.render('signup', { email });

        // res.status(200).json({
        //     success:true,
        //     message:`OTP Sent SuccessFully`,
        //     otpBody,
        // })
    }catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
};
