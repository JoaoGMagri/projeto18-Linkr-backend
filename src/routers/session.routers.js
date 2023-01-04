import { Router } from "express";

import { postSingUp } from "../controllers/session.controllers.js"
import { singUpMD } from "../middleware/singUp.middleware.js";

const router = Router();

router.post("/singup", singUpMD, postSingUp);

export default router;