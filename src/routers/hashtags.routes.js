import express from "express";

import { postControllers } from "../controllers/posts.controllers.js";
import { hashtagsControllers } from "../controllers/hashtags.controllers.js";

import { authorization } from "../middleware/authorization.middleware.js";

const routes = express.Router();

routes.get("/hashtags", hashtagsControllers.viewAll);

routes.get("/hashtag/:hashtag", authorization, postControllers.viewByHashtag);

export default routes;
