import { Router, Request, Response } from 'express';
import { UsersController } from './controllers/users.controller'

const router: Router = Router();
const usersController = new UsersController();

router.get('/v1/users', usersController.getAll);
router.get('/v1/users/:id', usersController.getByID);

export const v1: Router = router;
