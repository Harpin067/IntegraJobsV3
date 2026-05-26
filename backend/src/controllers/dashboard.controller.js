import { prisma } from '../db/prisma.js';
import { httpError } from '../middlewares/error.middleware.js';

/* ─── Dashboard Empresa ────────────────────────────────────────────────── */

export async function dashboardEmpresa(req, res, next) {
  try {
    const companyId = req.user.companyId;
    if (!companyId) throw httpError('Perfil de empresa no encontrado en token', 403);

    const [
      totalVacantes,
      vacantesActivas,
      totalAplicaciones,
      aplicacionesPorStatus,
      vacantesMasAplicadas,
      aplicacionesRecientes,
    ] = await Promise.all([

      // Total de vacantes de la empresa
      prisma.vacancy.count({ where: { companyId } }),

      // Vacantes activas y aprobadas
      prisma.vacancy.count({ where: { companyId, status: 'activa', isApproved: true } }),

      // Total de aplicaciones recibidas
      prisma.application.count({
        where: { vacancy: { companyId } },
      }),

      // Conteo de aplicaciones por status
      prisma.application.groupBy({
        by:     ['status'],
        where:  { vacancy: { companyId } },
        _count: { status: true },
      }),

      // Top 5 vacantes con más postulaciones
      prisma.vacancy.findMany({
        where:   { companyId },
        orderBy: { applications: { _count: 'desc' } },
        take:    5,
        select: {
          id: true, titulo: true, status: true, createdAt: true,
          _count: { select: { applications: true } },
        },
      }),

      // Últimas 10 aplicaciones recibidas
      prisma.application.findMany({
        where:   { vacancy: { companyId } },
        orderBy: { createdAt: 'desc' },
        take:    10,
        include: {
          user:    { select: { id: true, nombre: true, apellidos: true, email: true, avatarUrl: true } },
          vacancy: { select: { id: true, titulo: true } },
        },
      }),
    ]);

    // Normaliza el groupBy a un objeto plano
    const statusMap = { nuevo: 0, en_proceso: 0, rechazado: 0, contratado: 0 };
    for (const row of aplicacionesPorStatus) {
      statusMap[row.status] = row._count.status;
    }

    res.json({
      data: {
        metricas: {
          totalVacantes,
          vacantesActivas,
          totalAplicaciones,
          aplicacionesPorStatus: statusMap,
        },
        vacantesMasAplicadas,
        aplicacionesRecientes,
      },
    });
  } catch (err) { next(err); }
}

/* ─── Dashboard Candidato ──────────────────────────────────────────────── */

export async function dashboardCandidato(req, res, next) {
  try {
    const userId = req.user.id;

    const [
      totalPostulaciones,
      postulacionesPorStatus,
      postulacionesRecientes,
      perfil,
    ] = await Promise.all([

      // Total de postulaciones del candidato
      prisma.application.count({ where: { userId } }),

      // Conteo por status
      prisma.application.groupBy({
        by:     ['status'],
        where:  { userId },
        _count: { status: true },
      }),

      // Últimas 5 postulaciones con detalle de vacante
      prisma.application.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        take:    5,
        include: {
          vacancy: {
            select: {
              id: true, titulo: true, ubicacion: true, tipoTrabajo: true,
              company: { select: { nombre: true, logoUrl: true } },
            },
          },
        },
      }),

      // Datos básicos del perfil para mostrar en el dashboard
      prisma.user.findUnique({
        where:  { id: userId },
        select: { nombre: true, apellidos: true, email: true, avatarUrl: true, cvUrl: true },
      }),
    ]);

    const statusMap = { nuevo: 0, en_proceso: 0, rechazado: 0, contratado: 0 };
    for (const row of postulacionesPorStatus) {
      statusMap[row.status] = row._count.status;
    }

    res.json({
      data: {
        perfil,
        metricas: {
          totalPostulaciones,
          postulacionesPorStatus: statusMap,
        },
        postulacionesRecientes,
      },
    });
  } catch (err) { next(err); }
}
