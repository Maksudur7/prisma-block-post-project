import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
// If your Prisma file is located elsewhere, you can change the path
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASSWORD,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                default: "user",
            },
            phone: {
                type: "string",
                required: false,
            },
            status: {
                type: "string",
                required: false,
                default: "active",
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
                const info = await transporter.sendMail({
                    from: '"Prisma Blog" <prismablog@gmail.com>',
                    to: user.email,
                    subject: "Verify your email address",
                    text: `Please verify your email by clicking: ${verificationUrl}`, // Fallback for plain-text
                    html: `
    <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
      <div style="margin: 50px auto; width: 70%; padding: 20px 0">
        <div style="border-bottom: 1px solid #eee">
          <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">Prisma Blog</a>
        </div>
        <p style="font-size: 1.1em">Hi,</p>
        <p>Thank you for choosing Prisma Blog. Use the following button to complete your registration and verify your account.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${verificationUrl}" style="background: #00466a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="font-size: 0.9em;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 0.9em; color: #00466a;">${verificationUrl}</p>
        // <p style="font-size: 0.9em; color: #00466a;">${url}</p>
        <hr style="border: none; border-top: 1px solid #eee" />
        <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
          <p>Prisma Blog Inc</p>
          <p>1600 Amphitheatre Parkway</p>
          <p>California</p>
        </div>
      </div>
    </div>
    `,
                });
            } catch (err) {
                console.error(err)
                throw err
            }
        },
    },
    socialProviders: {
        google: {
            accessType: "offline",
            prompt: "select_account consent",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});