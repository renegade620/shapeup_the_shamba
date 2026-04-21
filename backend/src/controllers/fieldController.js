const prisma = require("../config/prisma");
const { withStatus, withStatusMany } = require("../services/statusService");

// always load updates for status computation
const FIELD_INCLUDE = {
  assignedAgent: { select: { id: true, name: true, email: true } },
  updates: { orderBy: { createdAt: "desc" }, take: 10 },
};

/**
 * GET /api/v1/fields
 * Admin: all fields. Agent: only assigned fields.
 */
async function listFields(req, res, next) {
  try {
    const where =
      req.user.role === "ADMIN" ? {} : { assignedAgentId: req.user.id };

    const fields = await prisma.field.findMany({
      where,
      include: FIELD_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    res.json(withStatusMany(fields));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/fields/:id
 */
async function getField(req, res, next) {
  try {
    const field = await prisma.field.findUnique({
      where: { id: req.params.id },
      include: {
        ...FIELD_INCLUDE,
        updates: { orderBy: { createdAt: "desc" }, include: { agent: { select: { id: true, name: true } } } },
      },
    });

    if (!field) return res.status(404).json({ error: "Field not found." });

    // Agents may only view their own fields
    if (req.user.role === "AGENT" && field.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json(withStatus(field));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/fields  [Admin only]
 * Body: { name, cropType, plantingDate, assignedAgentId? }
 */
async function createField(req, res, next) {
  try {
    const { name, cropType, plantingDate, assignedAgentId } = req.body;
    if (!name || !cropType || !plantingDate) {
      return res.status(400).json({ error: "name, cropType, and plantingDate are required." });
    }

    const field = await prisma.field.create({
      data: {
        name,
        cropType,
        plantingDate: new Date(plantingDate),
        assignedAgentId: assignedAgentId || null,
      },
      include: FIELD_INCLUDE,
    });

    res.status(201).json(withStatus(field));
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/fields/:id  [Admin only]
 * Partial update — supports reassigning agent, updating stage, etc.
 */
async function updateField(req, res, next) {
  try {
    const { name, cropType, plantingDate, stage, assignedAgentId } = req.body;

    const field = await prisma.field.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(cropType && { cropType }),
        ...(plantingDate && { plantingDate: new Date(plantingDate) }),
        ...(stage && { stage }),
        ...(assignedAgentId !== undefined && { assignedAgentId }),
      },
      include: FIELD_INCLUDE,
    });

    res.json(withStatus(field));
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/fields/:id  [Admin only]
 */
async function deleteField(req, res, next) {
  try {
    await prisma.field.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/fields/summary  [Admin only]
 * Returns counts by status for the dashboard stat cards.
 */
async function getFieldSummary(req, res, next) {
  try {
    const fields = await prisma.field.findMany({ include: { updates: true } });
    const statused = fields.map(withStatus);

    const summary = {
      total: statused.length,
      active: statused.filter((f) => f.status === "ACTIVE").length,
      atRisk: statused.filter((f) => f.status === "AT_RISK").length,
      completed: statused.filter((f) => f.status === "COMPLETED").length,
    };

    res.json(summary);
  } catch (err) {
    next(err);
  }
}

module.exports = { listFields, getField, createField, updateField, deleteField, getFieldSummary };
