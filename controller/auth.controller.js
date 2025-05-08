import bcryptjs from "bcryptjs";
import twilio from "twilio";
import dotenv from "dotenv";
import crypto from "crypto";

import { Otp } from "../model/otp.model.js";
import { User } from "../model/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
} from "../mailTrap/emails.js";
dotenv.config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const twilioClient = new twilio(accountSid, authToken);

export async function handleSignup(req, res) {
  const { name, email, password, phone } = req.body;

  try {
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        msg: "missing fields",
        success: false,
      });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({
        msg: "user aleady exists",
        success: false,
      });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      name: name,
      email: email,
      password: hashPassword,
      phone: phone,
    });

    const userDetails = await user.save();

    // Delete any previous OTP for the same email
    await Otp.deleteMany({ email });

    const otpDoc = new Otp({
      email,
      otp: verificationToken,
      phone: phone,
      createdAt: Date.now(),
    });

    await otpDoc.save();

    //  // Send OTP via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your OTP code is ${verificationToken}`,
        from: twilioPhone,
        to: phone,
      });
    } catch (twilioError) {
      console.log(twilioError);
      return res.status(500).json({
        success: false,
        msg: "Failed to send OTP, retry again !!!",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "user created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(error, "error in signup function");
    return res.status(400).json({
      success: false,
      msg: "please try again",
    });
  }
}

export async function handleVerifyOtp(req, res) {
  const { otp, phone } = req.body;
  try {
    if (!phone || !otp) {
      return res.status(400).json({
        success: "false",
        msg: "missing fields",
      });
    }

    const userPresent = await Otp.findOne({
      phone,
    });

    if (!userPresent) {
      return res.status(400).json({
        success: "false",
        msg: "Otp expired! Try again",
      });
    }

    const otpDoc = await Otp.findOne({
      phone,
      otp,
    });

    if (!otpDoc) {
      res.status(400).json({
        success: "false",
        msg: "Invalid otp! Try again",
      });
    }

    await User.findOneAndUpdate({ phone }, { isVerified: true });

    await Otp.deleteMany({ phone });

    return res.status(200).json({
      success: true,
      msg: "User verified successfully",
    });
  } catch (error) {
    console.error(error, "error in verify otp function");
    return res.status(500).json({
      success: false,
      msg: "Something went wrong. Please try again.",
    });
  }
}

export async function handleRequestNewOtp(req, res) {
  const { email, phone } = req.body;
  try {
    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        msg: "Missing fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Please register",
      });
    }

    if (!user.isVerified) {
      //if previous otp present , delete them

      await Otp.deleteMany({ email });

      //generate new otp & save to the database
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const newOtp = new Otp({
        email: email,
        otp: verificationToken,
        createdAt: Date.now(),
        phone: phone,
      });

      await newOtp.save();

      //  // Send OTP via Twilio
      try {
        await twilioClient.messages.create({
          body: `Your OTP code is ${verificationToken}`,
          from: twilioPhone,
          to: phone,
        });
      } catch (twilioError) {
        return res.status(500).json({
          success: false,
          msg: "Failed to send OTP",
        });
      }

      return res.status(200).json({
        success: true,
        msg: "Otp sent successfully",
        otp: verificationToken,
      });
    }

    return res.status(400).json({
      success: false,
      msg: "User already verified",
    });
  } catch (error) {
    console.log(error, "error in handle request new otp function");
    return res.status(400).json({
      success: false,
      msg: "Something wrong",
    });
  }
}

export async function handleLogin(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        msg: "missing fields!!!",
        success: "false",
      });
    }

    const user = await User.findOne({
      email,
    });
    if (!user) {
      res.status(400).json({
        msg: "invalid credentials",
        success: "false",
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({
        msg: "invalid credentials",
        success: "false",
      });
    }

    //generate jwt token and save as cookie
    const jwtToken = generateTokenAndSetCookie(res, user._id);

    return res.status(200).json({
      msg: "successfully loggedin",
      success: "true",
      user: {
        ...user._doc,
        password: undefined,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.log(error, "error in login function");
    res.status(400).json({
      msg: "something wrong!!!",
      success: "false",
    });
  }
}
export async function handleLogout(req, res) {
  res.clearCookie("token");
  res.status(200).json({
    msg: "successfully logged out",
    success: "true",
  });
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        msg: "no such user",
        success: "false",
      });
    }

    const verifiedToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = verifiedToken;
    user.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${verifiedToken}`
    );

    res.status(200).json({
      success: "true",
      message: "email sent successfully!!!",
    });
  } catch (error) {
    console.log(error, "forgot password error");
    return res.status(400).json({
      msg: "something's wrong",
      success: "false",
    });
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      res.status(400).json({
        success: "false",
        msg: "invalid or expired token",
      });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);
    res.status(200).json({
      success: "true",
      msg: "password changed successfully",
    });
  } catch (error) {
    console.log(error, "error in reset password function");
    res.status(400).json({
      msg: "something wrong!!!",
      success: "false",
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({
        success: "false",
        msg: "no such user",
      });
    }

    res.status(200).json({
      success: "true",
      user,
    });
  } catch (error) {
    console.log(error, "error in checkAuth");
    res.status(200).json({
      success: "false",
      msg: "something's wrong",
    });
  }
};
