import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient();
import prisma from '../lib/prisma.js';
import path from 'path'
import fs from 'fs'

// CREATE
export const AddEvent = async (req, res) => {

   if (req.files === null) return res.status(400).json({ msg: 'No file uploaded' })

   const { name,
      place,
      link,
      status,
      descriptions,
      reasons,
      notes,
      date,
      time,
      details,
      speakerId,
      categoryId
   } = req.body;

   const file = req.files.file; // Event Image

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
         const eventResponse = await prisma.event.create({
            data: {
               eventName: name,
               place: place,
               link: link,
               status: status,
               eventImage: fileName,
               url: url,
               descriptions: descriptions,
               reasons: reasons,
               notes: notes,
               date: date,
               time: time,
               details: details,
               categoryId: categoryId ? parseInt(categoryId) : null,
               Speaker: speakerId ? { connect: { id: parseInt(speakerId) } } : undefined
            }
         })

         if (!eventResponse) {
            res.status(400).json({ msg: "Something wrong i can feel it!" })
         }

         res.status(200).json({
            msg: "Event has been created!",
            eventResponse,
         })

      } catch (error) {
         res.status(500).json({ msg: error.message })
      }
   })
}

// READ
export const GetAllEvents = async (req, res) => {

   const page = parseInt(req.query.page) || 0;
   const limit = parseInt(req.query.limit) || 10;
   const search = req.query.search_query || "";
   const status = req.query.status || "";
   const offset = limit * page;

   const totalRows = await prisma.event.count({
      where: {
         ...(status && { status }),
         OR: [
            {
               eventName: {
                  contains: search,
               }
            }
         ]
      }
   });

   const totalPage = Math.ceil(totalRows / limit);

   const result = await prisma.event.findMany({
      where: {
         ...(status && { status }),
         OR: [
            {
               eventName: {
                  contains: search,
               }
            }
         ]
      },
      skip: offset,
      take: limit,
      orderBy: {
         id: 'desc'
      },
      include: {
         Speaker: true,
         EventUser: {
            include: {
               User: true
            }
         }
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
export const UpdateEvent = async (req, res) => {

   const { id } = req.params;
   const { name,
      place,
      link,
      status,
      descriptions,
      reasons,
      notes,
      date,
      time,
      details,
      speakerId
   } = req.body;

   const event = await prisma.event.findFirst({
      where: {
         id: Number(id)
      }
   })
   let eventImage = event.eventImage;

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

      if (event.eventImage) {
         const oldImagePathEvent = `./public/images/${event.eventImage}`;
         if (fs.existsSync(oldImagePathEvent)) {
            fs.unlinkSync(oldImagePathEvent);
         }
      }

      file.mv(`./public/images/${newFileName}`, (err) => {
         if (err) return res.status(500).json({ msg: err.message });
      });

      eventImage = newFileName;

   }

   const url = `${req.protocol}://${req.get("host")}/images/${eventImage}`

   let speakerUpdate = undefined;

   if (speakerId) {
      speakerUpdate = parseInt(speakerId);
   } else if (event.Speaker?.length > 0) {
      speakerUpdate = event.Speaker[0].id;
   }

   try {

      const updateEvent = await prisma.event.update({
         data: {
            eventName: name ?? event.eventName,
            place: place ?? event.place,
            link: link ?? event.link,
            status: status ?? event.status,
            descriptions: descriptions ?? event.descriptions,
            reasons: reasons ?? event.reasons,
            notes: notes ?? event.notes,
            date: date ?? event.date,
            time: time ?? event.time,
            details: details ?? event.details,
            eventImage: eventImage ?? event.eventImage,
            url: url ?? event.url,
            Speaker: speakerUpdate ? { set: [{ id: speakerUpdate }] } : { set: [] }

         }, where: {
            id: Number(id)
         }
      })

      if (!updateEvent) return res.status(400).json({ msg: "Update event or update speaker is invalid!" })

      res.status(200).json({ msg: "Event has been updated!", updateEvent })

   } catch (error) {
      console.log(error)
   }

}

// DELETE
export const DeleteEvent = async (req, res) => {
   const { id } = req.params;
   try {
      const response = await prisma.event.delete({
         where: { id: Number(id) }
      })
      if (!response) return res.status(404).json({ msg: "Event not found!" })
      res.status(200).json({ msg: "Event has been deleted", response })
   } catch (error) {
      res.status(500).json({ msg: error.message })
   }
}

// GET EVENT BY ID
export const GetEventById = async (req, res) => {
   const { id } = req.params;
   try {
      const response = await prisma.event.findFirst({
         where: {
            id: Number(id)
         },
         include: {
            Speaker: true,
            EventUser: {
               include: {
                  User: true
               },
            }
         }
      })
      const participantCount = response.EventUser.length;

      res.status(200).json({ ...response, participantCount })
   } catch (error) {
      res.status(500).json({ msg: error.message })
   }
}

export const AddUserToEvent = async (req, res) => {
   const { userId, eventId } = req.params;

   const userIdNum = Number(userId);
   const eventIdNum = Number(eventId);

   try {
      // Pastikan user dan event ada
      const isUserExist = await prisma.user.findUnique({
         where: { id: userIdNum }
      });

      const isEventExist = await prisma.event.findUnique({
         where: { id: eventIdNum }
      });

      if (!isUserExist || !isEventExist) {
         return res.status(404).json({ msg: "User or Event not found!" });
      }

      const existingEntry = await prisma.eventUser.findFirst({
         where: {
            userId: userIdNum,
            eventId: eventIdNum
         }
      });

      if (existingEntry) {
         return res.status(400).json({ msg: "User already registered for this event" });
      }

      const newEventUser = await prisma.eventUser.create({
         data: {
            userId: userIdNum,
            eventId: eventIdNum
         }
      });

      const responseHistoryUser = await prisma.history.create({
         data: {
            userId: userIdNum,
            eventId: eventIdNum
         }
      });

      if (!newEventUser || !responseHistoryUser) return res.status(400).json({ msg: "Something wrong with with AddEventUser or Response history user" })

      return res.status(201).json({
         msg: "Register success",
         eventUser: newEventUser
      });

   } catch (error) {
      return res.status(500).json({ msg: error.message });
   }
};


export const checkUserRegistrationEvent = async (req, res) => {
   const { userId, eventId } = req.params;
   try {
      const existingEntry = await prisma.eventUser.findFirst({
         where: {
            userId: Number(userId),
            eventId: Number(eventId)
         }
      })

      if (!existingEntry) return res.status(404).json({ msg: 'Not registered' })

      res.status(200).json({ msg: 'Registered', existingEntry });
   } catch (error) {
      res.status(500).json({ msg: error.message });
   }
}

export const countAllParticipans = async (req, res) => {
   try {
      const response = await prisma.eventUser.groupBy({
         by: ['userId']
      })
      if (!response) return res.status(404).json({ msg: "Not found!" })
      res.status(200).json(response.length);
   } catch (error) {
      console.log(error)
   }
}

