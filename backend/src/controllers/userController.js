const prisma = require("../config/prisma");

/**
 * GET /api/v1/users/agents  [Admin only]
 * Returns all users with role AGENT — used when assigning fields in the UI.
 */
async function listAgents(req, res, next) {
  try {
    const agents = await prisma.user.findMany({
      where: { role: "AGENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    res.json(agents);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAgents };
