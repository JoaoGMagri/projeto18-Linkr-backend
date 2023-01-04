import express from "express";

import { postControllers } from "../controllers/posts.controllers";
import { hashtagsControllers } from "../controllers/hashtags.controllers";

const routes = express.Router();

routes.get("/hashtags", hashtagsControllers.viewAll);

routes.post("/hashtag/:hashtag", postControllers.viewByHashtag);

export default routes;
