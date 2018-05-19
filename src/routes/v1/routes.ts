import { Router, Request, Response } from 'express';
import passport from 'passport';
import { UserController } from './controllers/user.controller'
import { AuthenticationController } from './controllers/authentication.controller';

const router: Router = Router();
const authenticationController = new AuthenticationController();
const userController = new UserController();
const version : string = "/v1";

// Authentication and the like
router.post(version + '/login', authenticationController.login);
router.post(version + '/register', authenticationController.register);

// User
router.get(version + '/user', passport.authenticate('jwt', { session: true }), userController.getAll);
router.get(version + '/user/:id', passport.authenticate('jwt', { session: true }), userController.getByID);
router.patch(version + '/user/:id', passport.authenticate('jwt', { session: true }), userController.updateByID);
router.post(version + '/user', passport.authenticate('jwt', { session: true }), userController.create);
router.delete(version + '/user/:id', passport.authenticate('jwt', { session: true }), userController.deleteByID);
router.get(version + '/user/:id/sources', passport.authenticate('jwt', { session: true }), userController.getAllSourcesByUserID);

export const routes: Router = router;
