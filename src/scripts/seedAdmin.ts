import { prisma } from "../lib/prisma";
import { UserRole } from "../middelware/auth";

async function seedAdmin() {
    try {

        // use .env or config file later
        const adminData = {
            name: "Admin2 Saheb",
            email: "admin2@admin.com",
            role: UserRole.ADMIN,
            password: "admin1215"
        }
        // check user exist on db or not
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        })

        if (existingUser) {
            throw new Error("Admin user already exists");
        }

        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(adminData)
        })

        if (signUpAdmin.ok) {
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            })
        }

    } catch (error) {
        console.error("Error seeding admin user:", error);
    }
}

seedAdmin();