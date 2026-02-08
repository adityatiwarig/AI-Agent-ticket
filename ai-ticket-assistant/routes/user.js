import express from "express";
import {
  getUsers,
  login,
  signup,
  updateUser,
  logout,
} from "../controllers/user.js";

import { authenticate } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/users", authenticate, isAdmin, getUsers);
router.post("/update-user", authenticate, isAdmin, updateUser);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
