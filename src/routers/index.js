import express from "express";

import postRoutes from "./posts.routes";
import hashtagsRoutes from "./hashtags.routes";

const routes = express.Router();

routes.use(postRoutes).use(hashtagsRoutes);

export default routes;
