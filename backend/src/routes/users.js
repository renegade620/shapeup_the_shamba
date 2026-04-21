const { Router } = require("express");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { listAgents } = require("../controllers/userController");

const router = Router();

router.get("/agents", authenticate, requireAdmin, listAgents);

module.exports = router;
