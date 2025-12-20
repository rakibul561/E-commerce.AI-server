import { AuthProvider, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import config from "../config";
import { prisma } from "../prisma/prisma";

export const seedAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findUnique({
            where: {
                email: config.admin.email
            }
        });

        if (isSuperAdminExist) {
            console.log(" Admin Already Exists!");
            return;
        }

        const hashedPassword = await bcrypt.hash(config.admin.password as string, Number(config.bcrypt.saltRounds))



        const payload = {
            name: "Super admin",
            role: Role.ADMIN,
            email: config.admin.email as string,
            password: hashedPassword,
            isVerified: true,
            authProvider: AuthProvider.LOCAL,
            credits: 999

        }

        const superadmin = await prisma.user.create({
            data: payload
        })
        console.log("Super Admin Created Successfuly! \n");
        console.log(superadmin);
    } catch (error) {
        console.log(error);
    }
} 