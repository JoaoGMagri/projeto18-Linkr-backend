import express from "express";

import postRoutes from "./posts.routes";

const routes = express.Router();

routes.use(postRoutes);

export default routes;
