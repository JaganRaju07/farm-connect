const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Authentication (Public)
router.post("/login", adminController.adminLogin);

// Management Tasks (Protected: Requires Admin Role)
router.use(auth, roleAuth(["admin", "super_admin", "moderator"]));

router.get("/farmers", adminController.listFarmers);
router.patch("/farmers/:id/verify", adminController.verifyFarmer);
router.get("/stats", adminController.getStats);

module.exports = router;
