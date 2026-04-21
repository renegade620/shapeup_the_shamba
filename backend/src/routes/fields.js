const { Router } = require("express");
const { authenticate, requireAdmin } = require("../middleware/auth");
const {
  listFields,
  getField,
  createField,
  updateField,
  deleteField,
  getFieldSummary,
} = require("../controllers/fieldController");
const {
  listUpdates,
  createUpdate,
} = require("../controllers/updateController");

const router = Router();

// All field routes require authentication
router.use(authenticate);

router.get("/summary", requireAdmin, getFieldSummary);  // must come before /:id
router.get("/", listFields);
router.get("/:id", getField);
router.post("/", requireAdmin, createField);
router.patch("/:id", requireAdmin, updateField);
router.delete("/:id", requireAdmin, deleteField);

// Nested updates routes
router.get("/:fieldId/updates", listUpdates);
router.post("/:fieldId/updates", createUpdate);

module.exports = router;
