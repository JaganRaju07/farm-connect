const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Authentication
router.post("/login", adminController.adminLogin);

// Management Tasks
router.get("/farmers", adminController.listFarmers); // To see all farmers
router.patch("/farmers/:id/verify", adminController.verifyFarmer); // To approve a farmer
router.get("/stats", adminController.getStats); // To see platform growth

module.exports = router;