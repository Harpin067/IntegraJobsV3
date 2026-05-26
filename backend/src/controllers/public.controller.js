import { prisma } from '../db/prisma.js';

export async function getVacantes(req, res) {
  try {
    const {
      q, ubicacion, tipoTrabajo, tipoContrato, experiencia,
      salarioMin, salarioMax, page = 1, limit = 20,
    } = req.query;

    const where = { status: 'activa', isApproved: true };

    if (q) {
      where.OR = [
        { titulo:      { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (ubicacion)    where.ubicacion    = { contains: ubicacion,    mode: 'insensitive' };
    if (tipoTrabajo)  where.tipoTrabajo  = tipoTrabajo;
    if (tipoContrato) where.tipoContrato = tipoContrato;
    if (experiencia)  where.experiencia  = experiencia;
    if (salarioMin)   where.salarioMin   = { gte: Number(salarioMin) };
    if (salarioMax)   where.salarioMax   = { lte: Number(salarioMax) };

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      prisma.vacancy.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.vacancy.count({ where }),
    ]);

    console.log(`[public/vacantes] total=${total}, devolviendo=${data.length}`);

    return res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('[public/vacantes] Error:', error);
    return res.status(500).json({ error: 'Error interno al obtener vacantes' });
  }
}

export async function getVacanteById(req, res) {
  try {
    const vacante = await prisma.vacancy.findFirst({
      where: { id: req.params.id, status: 'activa', isApproved: true },
      include: { company: true },
    });

    if (!vacante) {
      return res.status(404).json({ error: 'Vacante no encontrada' });
    }

    console.log(`[public/vacantes/:id] id=${req.params.id} encontrada`);
    return res.json({ data: vacante });
  } catch (error) {
    console.error('[public/vacantes/:id] Error:', error);
    return res.status(500).json({ error: 'Error interno al obtener la vacante' });
  }
}

export async function getStats(_req, res) {
  try {
    const [usuarios, empresas, vacantes, solicitudes] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.vacancy.count(),
      prisma.application.count(),
    ]);

    const payload = {
      totalUsuarios:    usuarios,
      totalEmpresas:    empresas,
      totalVacantes:    vacantes,
      totalSolicitudes: solicitudes,
    };

    console.log('[public/stats] Stats calculados en Backend:', payload);

    return res.json({ data: payload });
  } catch (error) {
    console.error('[public/stats] Error al calcular stats:', error);
    return res.status(500).json({ error: 'Error interno al contar stats' });
  }
}
