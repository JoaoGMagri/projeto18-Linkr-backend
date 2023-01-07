import { Router } from "express";

import { postSignUp, postSignIn, deleteLogOut } from "../controllers/session.controllers.js"
import { signUpMD } from "../middleware/signUp.middleware.js";
import { signInMD } from "../middleware/signIn.middleware.js";

const router = Router();

router.post("/signup", signUpMD, postSignUp);
router.post("/signin", signInMD, postSignIn);
router.delete("/logout", deleteLogOut)

export default router;