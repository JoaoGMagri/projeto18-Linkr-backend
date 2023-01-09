import express from "express";

import postRoutes from "./posts.routes.js";
import hashtagsRoutes from "./hashtags.routes.js";
import sessionRoutes from "./session.routers.js";
import usersRoutes from "./users.routes.js";

const routes = express.Router();

routes.use(postRoutes).use(hashtagsRoutes).use(sessionRoutes).use(usersRoutes);

export default routes;
