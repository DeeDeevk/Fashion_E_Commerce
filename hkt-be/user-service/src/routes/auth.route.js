const router = require("express").Router();
const ctrl = require("../controllers/authController");

// POST /auth/login
router.post("/login", ctrl.login);

// POST /auth/introspect
router.post("/introspect", ctrl.introspect);

// POST /auth/forgot-password
router.post("/forgot-password", ctrl.forgotPassword);

// POST /auth/reset-password
router.post("/reset-password", ctrl.resetPassword);

module.exports = router;
