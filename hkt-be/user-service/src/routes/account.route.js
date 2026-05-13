const router = require("express").Router();
const ctrl = require("../controllers/accountController");
const {
  verifyToken,
  requireRole,
} = require("../middlewares/auth.middleware.js");

router.post("/", ctrl.register);
router.get("/myinfor", verifyToken, ctrl.getMyAccount);
router.get("/username/:username", ctrl.getByUsername);
router.get("/:id", ctrl.getById);
router.get("/", verifyToken, requireRole("ADMIN"), ctrl.getAll);

router.post("/admin/add", verifyToken, requireRole("ADMIN"), ctrl.addByAdmin);
router.put(
  "/admin/update/:id",
  verifyToken,
  requireRole("ADMIN"),
  ctrl.updateByAdmin,
);
router.delete(
  "/admin/delete/:id",
  verifyToken,
  requireRole("ADMIN"),
  ctrl.deleteByAdmin,
);
router.post(
  "/meetings/create",
  verifyToken,
  requireRole("ADMIN"),
  ctrl.createMeeting,
);

module.exports = router;
