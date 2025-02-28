import { AddUser, DeleteUser, GetAllUsers, UpdateUser, GetUserById, getUser } from '../controllers/UserController.js'
import express from 'express'
import AuthMiddleware from '../middleware/AuthMiddleware.js'

const route = express.Router();

route.get('/api/v1/currentUser', getUser);
route.get('/api/v1/users', GetAllUsers);
route.get('/api/v1/users/:id', GetUserById);
route.post('/api/v1/users', AddUser);
route.patch('/api/v1/users/:id', UpdateUser);
route.delete('/api/v1/users/:id', DeleteUser);

export default route;