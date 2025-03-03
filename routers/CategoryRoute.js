import { getAllCategory, addCategory, getCategoryById } from '../controllers/CategoryController.js'
import express from 'express'
const route = express.Router();

route.get('/api/v1/categories', getAllCategory)
route.post('/api/v1/categories', addCategory)
route.get('/api/v1/categories/:id', getCategoryById)

export default route