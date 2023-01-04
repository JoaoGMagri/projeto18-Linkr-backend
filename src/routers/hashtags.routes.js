import express from "express";

import { postControllers } from "../controllers/posts.controllers.js";
import { hashtagsControllers } from "../controllers/hashtags.controllers.js";

const routes = express.Router();

routes.get("/hashtags", hashtagsControllers.viewAll);

routes.post("/hashtags", hashtagsControllers.create);

routes.get("/hashtag/:hashtag", postControllers.viewByHashtag);

export default routes;
