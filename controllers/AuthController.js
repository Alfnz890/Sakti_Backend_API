import { PrismaClient } from '@prisma/client'
import axios from 'axios';
import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'

const prisma = new PrismaClient();

export const login = async (req, res) => {

   const { username, password } = req.body;
   try {
      const user = await prisma.user.findFirst({
         where: {
            name: username
         }
      })

      // if (!user) return res.status(400).json({ msg: "Username or Password is invalid!" })

      // const matchedPassword = await bcrypt.compare(password, user.password)

      // if (!matchedPassword) return res.status(400).json({ msg: "Username or Password is invalid!" })

      if (user) {

         const matchedPassword = await bcrypt.compare(password, user.password)
         if (!matchedPassword) return res.status(400).json({ msg: "Username or Password is invalid!" });

      } else {
         try {
            const externalResponse = await axios.post("https://api.uinsgd.ac.id/salam/v1/Auth/Login", { username, password });

            if (!externalResponse.data.status) {
               return res.status(400).json({ msg: "Username or Password is invalid!" });
            }

            const { first_name, email, telp } = externalResponse.data.data;
            user = await prisma.user.create({
               data: {
                  name: username,
                  password: await bcrypt.hash(password, 10),
                  first_name,
                  email,
                  phone: telp
               }
            });

         } catch (error) {
            return res.status(500).json({ msg: "Failed to authenticate with external API" });
         }
      }

      res.status(200).json({
         msg: "Login success...",
         data: {
            id: user.id,
            name: user.name,
            first_name: user.first_name,
            email: user.email,
            phone: user.phone
         }
      })

   } catch (error) {
      res.status(500).json({ msg: error.message })
   }
}

export const logout = (req, res) => {
   res.clearCookie('token');
   res.status(200).json({ msg: "Logout success..." });
};
