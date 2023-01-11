import express from "express";

import { usersControllers } from "../controllers/users.controllers.js";

import { authorization } from "../middleware/authorization.middleware.js";

const routes = express.Router();

routes.get("/users/:id", authorization, usersControllers.viewAllPostsByUser);
routes.post("/follow", authorization, usersControllers.follow);
routes.delete("/unfollow/:id", authorization, usersControllers.unfollow);

export default routes;
