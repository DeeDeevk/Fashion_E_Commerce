const router = require("express").Router();
const ctrl = require("../controllers/addressController");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/:accountId", ctrl.getAddress);
router.post("/add", verifyToken, ctrl.addAddress);
router.put("/update", verifyToken, ctrl.updateAddress);
router.delete("/:id", verifyToken, ctrl.deleteAddress);

module.exports = router;
