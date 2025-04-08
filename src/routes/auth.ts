import {registerUser} from "../controllers/auth/register";
import express from 'express';
import {verifyEmail} from "../controllers/auth/verify.email";


const authRouter = express.Router();

authRouter.post('/register',registerUser);
authRouter.post('/verify-email',verifyEmail);

export default authRouter;
