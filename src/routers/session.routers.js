import { Router } from "express";

import { postSingUp, postSingIn } from "../controllers/session.controllers.js"
import { singUpMD } from "../middleware/singUp.middleware.js";
import { singInMD } from "../middleware/singIn.middleware.js";

const router = Router();

router.post("/signup", singUpMD, postSingUp);
router.post("/signin", singInMD, postSingIn);

export default router;