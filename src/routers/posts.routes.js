import express from "express";

import { postControllers } from "../controllers/posts.controllers.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { urlValidation } from "../middleware/posts.middleware.js";

const routes = express.Router();

routes.post("/posts", authorization, urlValidation, postControllers.publishPost);

routes.get("/posts", /* authorization,*/postControllers.listPosts);

routes.post("/:idPost/like", postControllers.like);

routes.post("/:idPost/dislike", postControllers.dislike);

export default routes;
