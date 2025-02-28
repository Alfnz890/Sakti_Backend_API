import prisma from '../lib/prisma.js';
import path from 'path'
import fs from 'fs'

export const getAllSpeakers = async (req, res) => {

   const page = parseInt(req.query.page) || 0;
   const limit = parseInt(req.query.limit) || 10;
   const search = req.query.search_query || "";
   const offset = limit * page;
   const status = req.query.status || "";

   const totalRows = await prisma.speaker.count({
      where: {
         ...(status && { status }),
         OR: [
            {
               speakerName: {
                  contains: search,
               }
            }
         ]
      }
   });

   const totalPage = Math.ceil(totalRows / limit);

   try {
      const speakers = await prisma.speaker.findMany({
         where: {
            ...(status && { status }),
            OR: [
               {
                  speakerName: {
                     contains: search,
                  }
               }
            ]
         },
         skip: offset,
         take: limit,
         orderBy: {
            id: 'desc'
         }
      });

      res.json({
         result: speakers,
         page: page,
         limit: limit,
         totalRows: totalRows,
         totalPage: totalPage
      })

   } catch (error) {
      return res.status(500).json({ msg: error.message })
   }
}

export const addSpeaker = async (req, res) => {
   if (req.files === null) return res.status(400).json({ msg: "No File Uploaded!" });

   const { name, biography, position, status } = req.body;
   const file = req.files.file;

   const fileSize = file.data.length;
   const ext = path.extname(file.name);
   const fileName = file.md5 + ext;
   const url = `${req.protocol}://${req.get("host")}/images/${fileName}`

   const allowedType = ['.png', '.jpg', '.jpeg'];

   if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: 'Invalid image' })
   if (fileSize > 5000000) return res.status(422).json({ mgs: 'Gambar terlalu besar!' })

   file.mv(`./public/images/${fileName}`, async (err) => {
      if (err) return res.status(500).json({ msg: err.message })
      try {
         const response = await prisma.speaker.create({
            data: {
               speakerName: name,
               speakerImage: fileName,
               speakerBiography: biography,
               speakerPosition: position,
               urlimage: url,
               status: status
            }
         })
         res.status(200).json({ msg: "Speaker has been created!", response })
      } catch (error) {
         console.log(error)
      }
   })
}

export const updateSpeaker = async (req, res) => {

   const { name, biography, position, status } = req.body;
   const { id } = req.params;

   const getSpeakerById = await prisma.speaker.findFirst({
      where: {
         id: Number(id)
      }
   })

   if (!getSpeakerById) return res.status(404).json({ msg: "Speaker not found!" })
   let fileName = getSpeakerById.speakerImage;

   if (req.files && req.files.file) {

      const file = req.files.file;
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      const newFileName = file.md5 + ext;
      const allowedType = ['.png', '.jpg', '.jpeg'];

      if (!allowedType.includes(ext.toLowerCase())) {
         return res.status(422).json({ msg: 'Invalid image format!' });
      }
      if (fileSize > 5000000) {
         return res.status(422).json({ msg: 'Image is too large!' });
      }

      if (getSpeakerById.speakerImage) {
         const oldImagePath = `./public/images/${getSpeakerById.speakerImage}`
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }
      }

      file.mv(`./public/images/${newFileName}`, (err) => {
         if (err) return res.status(500).json({ msg: err.message });
      });
      fileName = newFileName;

   }

   const url = `${req.protocol}://${req.get("host")}/images/${fileName}`

   try {
      const response = await prisma.speaker.update({
         where: {
            id: Number(id)
         },
         data: {
            speakerName: name ?? getSpeakerById.speakerName,
            speakerBiography: biography ?? getSpeakerById.speakerBiography,
            speakerPosition: position ?? getSpeakerById.speakerPosition,
            speakerImage: fileName ?? getSpeakerById.speakerImage,
            urlimage: url ?? getSpeakerById.urlimage,
            status: status ?? getSpeakerById.status
         }
      })

      if (!response) return res.status(400).json({ msg: "Something Wrong!" })

      res.status(200).json({ msg: "Speaker has been updated!", response })
   } catch (error) {
      console.log(error)
   }
}

export const getSpeakerById = async (req, res) => {
   const { id } = req.params;
   try {
      const result = await prisma.speaker.findFirst({
         where: {
            id: Number(id)
         }
      })
      if (!result) return res.status(404).json({ msg: "Speaker not found!" })
      res.status(200).json(result)
   } catch (error) {
      console.log({ msg: error.message });
   }
}

export const deleteSpeaker = async (req, res) => {
   const { id } = req.params;
   try {
      const response = await prisma.speaker.delete({
         where: {
            id: Number(id)
         }
      })
      if (!response) return res.status(404).json({ msg: "Speaker not found!" })
      res.status(200).json({ msg: "Speaker has been deleted!", response })
   } catch (error) {
      console.error({ msg: error.message })
   }
}