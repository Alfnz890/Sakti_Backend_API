import { addSpeaker, getAllSpeakers, updateSpeaker, getSpeakerById } from '../controllers/SpeakerController.js'
import express from 'express';
const router = express.Router();

router.get('/api/v1/speaker', getAllSpeakers);
router.post('/api/v1/speaker', addSpeaker)
router.patch('/api/v1/speaker/:id', updateSpeaker)
router.get('/api/v1/speaker/:id', getSpeakerById)

export default router;