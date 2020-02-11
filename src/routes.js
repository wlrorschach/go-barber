import { Router } from 'express';
import multer from 'multer';

import AppointmentController from './app/controllers/AppointmentController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import ScheduleController from './app/controllers/ScheduleController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

/**
 * SESSION
 */
routes.post('/sessions', SessionController.store);

/**
 * USER
 */
routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

/**
 * PROVIDER
 */
routes.get('/providers', ProviderController.index);

routes.get('/providers/:providerId/available', AvailableController.index);

/**
 * FILE
 */
routes.post('/files', upload.single('file'), FileController.store);

/**
 * APPOINTMENT
 */
routes.post('/appointments', AppointmentController.store);

routes.get('/appointments', AppointmentController.index);

routes.delete('/appointments/:id', AppointmentController.delete);

/**
 * SCHEDULE
 */
routes.get('/schedule', ScheduleController.index);

/**
 * NOTIFICATION
 */
routes.get('/notifications', NotificationController.index);

routes.put('/notifications/:id', NotificationController.update);

export default routes;
