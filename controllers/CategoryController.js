import prisma from "../lib/prisma.js";

export const getAllCategory = async (req, res) => {
   try {
      const response = await prisma.category.findMany({
         include: {
            Event: true
         }
      })
      return res.status(200).json({ status: true, data: response })
   } catch (error) {
      console.log(error)
   }
}

export const addCategory = async (req, res) => {
   const { categoryName } = req.body;
   try {
      const response = await prisma.category.create({
         data: {
            name: categoryName
         }
      })
      if (!response) return res.status(400).json({ message: "Failed to add category!" });
      res.status(201).json({ message: "Category has been created!", response })
   } catch (error) {
      console.log(error)
   }
}

export const getCategoryById = async (req, res) => {
   const { id } = req.params;
   try {
      const response = await prisma.category.findUnique({
         where: {
            id: Number(id)
         },
         include: {
            Event: true
         }
      })
      if (!response) return res.status(404).json({ message: "Category not found!" })
      res.status(200).json(response)
   } catch (error) {
      console.log(error)
   }
}