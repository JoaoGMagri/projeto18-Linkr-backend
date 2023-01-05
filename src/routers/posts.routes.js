import express from "express";

import { postControllers } from "../controllers/posts.controllers.js";
import { urlValidation } from "../middleware/posts.middleware.js";

const routes = express.Router();

routes.post("/posts", urlValidation, postControllers.publishPost);

routes.post("/:idPost/like", postControllers.like);

routes.post("/:idPost/dislike", postControllers.dislike);

routes.get("/posts", postControllers.listPosts);

routes.delete("/posts", postControllers.deletePost);

export default routes;
