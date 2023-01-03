import express from "express";

import { postControllers } from "../controllers/posts.controllers";

const routes = express.Router();

routes.post("/:idPost/like", postControllers.like);

routes.post("/:idPost/dislike", postControllers.dislike);

export default routes;
