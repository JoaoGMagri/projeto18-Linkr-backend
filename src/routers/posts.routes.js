import express from "express";

import { postControllers } from "../controllers/posts.controllers.js";
import { authorization } from "../middleware/authorization.middleware.js";
import {
  deleteValidation,
  urlValidation,
} from "../middleware/posts.middleware.js";

const routes = express.Router();

routes.post(
  "/posts",
  authorization,
  urlValidation,
  postControllers.publishPost
);

routes.get("/posts", authorization, postControllers.listPosts);

routes.get(
  "/posts/likes/:post",
  authorization,
  postControllers.viewLikesByPost
);

routes.post("/:idPost/like", authorization, postControllers.like);

routes.post("/:idPost/dislike", authorization, postControllers.dislike);

routes.delete(
  "/posts/:idPost",
  // authorization,
  deleteValidation,
  postControllers.deletePost
);

export default routes;
