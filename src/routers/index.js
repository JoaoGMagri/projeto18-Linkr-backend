import express from "express";

import postRoutes from "./posts.routes.js";
import hashtagsRoutes from "./hashtags.routes.js";
import sessionRoutes from "./session.routers.js";

const routes = express.Router();

routes.use(postRoutes).use(hashtagsRoutes).use(sessionRoutes);

export default routes;
