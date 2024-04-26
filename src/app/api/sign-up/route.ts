import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          messages: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEMail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(10000 + Math.random() * 90000).toString();

    if (existingUserByEMail) {
      if (existingUserByEMail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exits with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEMail.password = hashedPassword;
        existingUserByEMail.verifyCode = verifyCode;
        existingUserByEMail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEMail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }

    //send Vefification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registerd successfully Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering error", error);
    return Response.json(
      {
        success: false,
        message: "Error Registering User",
      },
      {
        status: 500,
      }
    );
  }
}
