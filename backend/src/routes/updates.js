const { Router } = require("express");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { recentUpdates } = require("../controllers/updateController");

const router = Router();

// GET /api/v1/updates/recent — admin activity feed
router.get("/recent", authenticate, requireAdmin, recentUpdates);

module.exports = router;
