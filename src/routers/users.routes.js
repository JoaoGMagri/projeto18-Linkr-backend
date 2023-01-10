import express from "express";

import { usersControllers } from "../controllers/users.controllers.js";

import { authorization } from "../middleware/authorization.middleware.js";

const routes = express.Router();

routes.get("/users/:id", authorization, usersControllers.viewAllPostsByUser);

export default routes;
