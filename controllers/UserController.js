import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'

// CREATE
export const AddUser = async (req, res) => {

   const { name, password, first_name, phone, email } = req.body;
   const salt = await bcrypt.genSalt()
   const hashedPassword = await bcrypt.hash(password, salt);

   try {
      const response = await prisma.user.create({
         data: {
            name: name,
            password: hashedPassword,
            first_name: first_name,
            phone: phone,
            email: email
         }
      })
      res.status(201).json({ msg: "User has been created!", response })
   } catch (error) {
      res.status(500).json({ msg: error.message })
   }
}

// READ
export const GetAllUsers = async (req, res) => {

   const page = parseInt(req.query.page) || 0;
   const limit = parseInt(req.query.limit) || 10;
   const search = req.query.search_query || "";
   const offset = limit * page;

   const totalRows = await prisma.user.count({
      where: {
         OR: [
            {
               name: {
                  contains: search,
               }
            },
            {
               email: {
                  contains: search
               }
            }
         ]
      }
   });

   const totalPage = Math.ceil(totalRows / limit);

   const result = await prisma.user.findMany({
      where: {
         OR: [
            {
               name: {
                  contains: search,
               }
            },
            {
               email: {
                  contains: search
               }
            }
         ]
      },
      skip: offset,
      take: limit,
      orderBy: {
         id: 'desc'
      }
   })

   res.json({
      result: result,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage
   })

}

// UPDATE
export const UpdateUser = async (req, res) => {

   const { name, email, password, phone } = req.body;
   const { id } = req.params;

   try {

      const oldUser = await prisma.user.findFirst({
         where: {
            id: Number(id)
         }
      })

      let hashedPassword = oldUser.password;
      if (password) {
         const salt = await bcrypt.genSalt()
         hashedPassword = await bcrypt.hash(password, salt);
      }

      const response = await prisma.user.update({
         where: {
            id: Number(id)
         }, data: {
            name: name || oldUser.name,
            email: email || oldUser.email,
            password: hashedPassword,
            phone: phone || oldUser.phone,
            first_name: oldUser.first_name
         }
      })
      res.status(200).json({ msg: "User has been updated!", data: response })
   } catch (error) {
      res.status(500).json({ msg: error.message })
   }
}

// DELETE
export const DeleteUser = async (req, res) => {
   const { id } = req.params;
   try {
      const response = await prisma.user.delete({
         where: {
            id: Number(id)
         }
      })
      res.status(200).json({ msg: "User has been deleted!", response })
   } catch (error) {
      res.status(500).json({ msg: error.message })
   }
}

// GET USER BY ID
export const GetUserById = async (req, res) => {
   const id = req.params.id;
   try {
      const response = await prisma.user.findFirst({
         where: {
            id: Number(id)
         }
      })
      res.status(200).json(response)
   } catch (error) {
      res.status(500).json({ msg: error.message })
   }
}

// Get Current User
export const getUser = (req, res) => {
   const token = req.cookies.token; // Ambil token dari cookie
   if (!token) return res.status(401).json({ msg: "Unauthorized" });

   jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) return res.status(403).json({ msg: "Forbidden" });

      res.json({
         id: decoded.id,
         username: decoded.username,
         email: decoded.email,
         phone: decoded.phone
      });
   });
};