import { Router, Request, Response } from 'express';
import passport from 'passport';
import { UserController } from './controllers/user.controller'

const router: Router = Router();
const userController = new UserController();
const version : string = "/v1";

// User
router.get(this.version + '/user', passport.authenticate('jwt', { session: true }), userController.getAll);
router.get(this.version + '/user/:id', passport.authenticate('jwt', { session: true }), userController.getByID);
router.patch(this.version + '/user/:id', passport.authenticate('jwt', { session: true }), userController.updateByID);
router.post(this.version + '/user', passport.authenticate('jwt', { session: true }), userController.create);
router.delete(this.version + '/user/:id', passport.authenticate('jwt', { session: true }), userController.deleteByID);
router.get(this.version + '/user/self', passport.authenticate('jwt', { session: true }), userController.self);
router.patch(this.version + '/user/self', passport.authenticate('jwt', { session: true }), userController.updateSelf);
router.get(this.version + '/user/:id/sources', passport.authenticate('jwt', { session: true }), userController.getAllSourcesByUserID);

export const routes: Router = router;
