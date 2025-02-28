import express from 'express'
import { AddEvent, DeleteEvent, GetAllEvents, UpdateEvent, GetEventById, AddUserToEvent, checkUserRegistrationEvent, countAllParticipans } from '../controllers/EventController.js'
import AuthMiddleware from '../middleware/AuthMiddleware.js'
const router = express.Router()

router.get('/api/v1/events', GetAllEvents);
router.get('/api/v1/events/:id', GetEventById);
router.post('/api/v1/events', AddEvent);
router.delete('/api/v1/events/:id', DeleteEvent);
router.patch('/api/v1/events/:id', UpdateEvent)
router.post('/api/v1/events/addUser/:userId/:eventId', AddUserToEvent)
router.post('/api/v1/events/checkRegistered/:userId/:eventId', checkUserRegistrationEvent)
router.get('/api/v1/getAllParticipants', countAllParticipans)

// Public API
router.get('/api/v1/public/events', GetAllEvents)
router.get('/api/v1/public/events/:id', GetEventById)

export default router;