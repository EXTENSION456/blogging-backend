import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplate.js";
import { mailtrapClient, sender } from "./mailTrap.config.js";

import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email verification",
    });

    console.log(response, "email send successfully");
  } catch (error) {
    console.log("error in sending email", error);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [
    {
      email,
    },
  ];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });

    console.log(response, "reset password email link send successfully");
  } catch (error) {
    console.log(error, "error in sending email");
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [
    {
      email,
    },
  ];

  try {
    const response = await mailtrapClient.send({
      to: recipient,
      from: sender,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log("password reset successful");
  } catch (error) {
    console.log(error, "error in password reset");
  }
};
