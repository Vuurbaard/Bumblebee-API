import { Router } from 'express';
import express from 'express';
import passport from 'passport';
import path from 'path';

import { UserController } from './controllers/user.controller'
import { AuthenticationController } from './controllers/authentication.controller';
import { SourceController } from './controllers/source.controller';
import { WordController } from './controllers/word.controller';
import { FragmentController } from './controllers/fragment.controller';
import { AudioController } from './controllers/audio.controller';
import { VoiceBoxController } from './controllers/voicebox.controller';
import { AppController } from './controllers/app.controller';

const router: Router = Router();
const authenticationController = new AuthenticationController();
const userController = new UserController();
const sourceController = new SourceController();
const wordController = new WordController();
const fragmentController = new FragmentController();
const audioController = new AudioController();
const voiceboxController = new VoiceBoxController();
const appController = new AppController();

const version: string = "/v1";


// Authentication and the like
router.post(version + '/login', authenticationController.login);
router.post(version + '/register', authenticationController.register);

// User
router.use(version + '/user', passport.authenticate('jwt', { session: true}));
router.get(version + '/user', userController.getAll);
router.get(version + '/user/:id', userController.getByID);
router.patch(version + '/user/:id', userController.updateByID);
router.post(version + '/user', userController.create);
router.delete(version + '/user/:id',  userController.deleteByID);
router.get(version + '/user/:id/sources', userController.getAllSourcesByUserID);

// Sources
router.get(version + '/source', sourceController.getAll);
router.get(version + '/source/:id', sourceController.getByID);
router.patch(version + '/source/:id', passport.authenticate('jwt', { session: true }), sourceController.updateByID);
router.post(version + '/source/', passport.authenticate('jwt', { session: true }), sourceController.create);
router.delete(version + '/source/:id', passport.authenticate('jwt', { session: true }), sourceController.deleteByID);

// Word
router.get(version + '/word', wordController.getAll);
router.get(version + '/word/:id', wordController.getByID);
router.patch(version + '/word/:id', passport.authenticate('jwt', { session: true }), wordController.updateByID);
router.post(version + '/word/', passport.authenticate('jwt', { session: true }), wordController.create);
router.delete(version + '/word/:id', passport.authenticate('jwt', { session: true }), wordController.deleteByID);

// Fragment
router.get(version + '/fragment', fragmentController.getAll);
router.get(version + '/fragment/:id', fragmentController.getByID);
router.patch(version + '/fragment/:id', passport.authenticate('jwt', { session: true }), fragmentController.updateByID);
router.post(version + '/fragment/', passport.authenticate('jwt', { session: true }), fragmentController.create);
router.delete(version + '/fragment/:id', passport.authenticate('jwt', { session: true }), fragmentController.deleteByID);

// App
router.get(version + '/app', passport.authenticate('jwt', { session: true }), appController.getAll);
router.get(version + '/app/:id', passport.authenticate('jwt', { session: true }), appController.getByID);
router.patch(version + '/app/:id', passport.authenticate('jwt', { session: true }), appController.updateByID);
router.post(version + '/app/', passport.authenticate('jwt', { session: true }), appController.create);
router.delete(version + '/app/:id', passport.authenticate('jwt', { session: true }), appController.deleteByID);

// Audio
router.post(version + '/audio/download', passport.authenticate('jwt', { session: true }), audioController.download)
router.use(version + '/audio/youtube', express.static(path.join(__dirname, '../../audio/youtube')));
router.use(version + '/audio/temp', express.static(path.join(__dirname, '../../audio/temp')));
router.use(version + '/audio/generate/:id', voiceboxController.generate);

// Text to speech
router.post(version + '/tts', voiceboxController.tts)


export const routes: Router = router;
