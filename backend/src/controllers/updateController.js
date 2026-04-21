const prisma = require("../config/prisma");

/**
 * GET /api/v1/fields/:fieldId/updates
 * Admin: all updates for a field.
 * Agent: only if field is assigned to them.
 */
async function listUpdates(req, res, next) {
  try {
    const field = await prisma.field.findUnique({
      where: { id: req.params.fieldId },
    });
    if (!field) return res.status(404).json({ error: "Field not found." });

    if (req.user.role === "AGENT" && field.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const updates = await prisma.fieldUpdate.findMany({
      where: { fieldId: req.params.fieldId },
      orderBy: { createdAt: "desc" },
      include: { agent: { select: { id: true, name: true } } },
    });

    res.json(updates);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/fields/:fieldId/updates  [Agent or Admin]
 * Body: { stage, notes? }
 * Also advances the field's own stage to match.
 */
async function createUpdate(req, res, next) {
  try {
    const { stage, notes } = req.body;
    if (!stage) return res.status(400).json({ error: "stage is required." });

    const field = await prisma.field.findUnique({
      where: { id: req.params.fieldId },
    });
    if (!field) return res.status(404).json({ error: "Field not found." });

    // Agents may only update their own fields
    if (req.user.role === "AGENT" && field.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    // Run both writes in a transaction — keeps field.stage consistent with updates
    const [update] = await prisma.$transaction([
      prisma.fieldUpdate.create({
        data: {
          fieldId: req.params.fieldId,
          agentId: req.user.id,
          stage,
          notes: notes || null,
        },
        include: { agent: { select: { id: true, name: true } } },
      }),
      prisma.field.update({
        where: { id: req.params.fieldId },
        data: { stage },
      }),
    ]);

    res.status(201).json(update);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/updates/recent  [Admin only]
 * Returns the latest N updates across all fields — for the admin activity feed.
 */
async function recentUpdates(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const updates = await prisma.fieldUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        agent: { select: { id: true, name: true } },
        field: { select: { id: true, name: true, cropType: true } },
      },
    });
    res.json(updates);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUpdates, createUpdate, recentUpdates };
