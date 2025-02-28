import { AddReport, DeleteReport, GetAllReports, UpdateReport, GetReportById } from '../controllers/ReportController.js'
import express from 'express'
import AuthMiddleware from '../middleware/AuthMiddleware.js'

const route = express.Router();

route.get('/api/v1/reports', GetAllReports)
route.post('/api/v1/reports', AddReport)
route.patch('/api/v1/reports/:id', UpdateReport)
route.delete('/api/v1/reports/:id', DeleteReport)
route.get('/api/v1/reports/:id', GetReportById)

// Public API
route.get('/api/v1/public/reports', GetAllReports)

export default route;