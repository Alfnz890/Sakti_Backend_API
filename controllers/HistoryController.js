import prisma from "../lib/prisma.js";

export const getAllHistory = async (req, res) => {
   try {
      const response = await prisma.history.findMany();
      res.status(200).json(response)
   } catch (error) {
      res.status(500).json({ msg: error.message })
   }
}

export const getHistoryByUser = async (req, res) => {
   const userId = Number(req.params.userId);

   const page = parseInt(req.query.page) || 0;
   const limit = parseInt(req.query.limit) || 10;
   const offset = limit * page;

   try {

      const totalRows = await prisma.history.count({
         where: {
            userId
         }
      });

      const totalPage = Math.ceil(totalRows / limit);

      const response = await prisma.history.findMany({
         where: {
            userId
         },
         skip: offset,
         take: limit,
         orderBy: {
            id: 'desc'
         },
         include: {
            event: true
         }
      })

      if (response.length === 0) return res.status(404).json({ msg: "No history found!" })

      res.status(200).json({
         result: response,
         page: page,
         limit: limit,
         totalRows: totalRows,
         totalPage: totalPage
      })
   } catch (error) {
      res.status(500).json({ msg: error.message })
   }
}