import { prisma } from '../db/prisma.js';
import { pool } from '../db/db.js';
import { httpError } from '../middlewares/error.middleware.js';

const APP_STATUS_VALUES = ['nuevo', 'en_proceso', 'rechazado', 'contratado'];

/* ─── CANDIDATO: postularse ────────────────────────────────────────────── */

export async function postular(req, res, next) {
  try {
    const userId    = req.user.id;
    const vacancyId = req.params.vacancyId;

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      select: { id: true, status: true, isApproved: true },
    });
    if (!vacancy || vacancy.status !== 'activa' || !vacancy.isApproved) {
      throw httpError('Vacante no disponible para postulaciones', 404);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cvUrl: true },
    });

    const data = await prisma.application.create({
      data: {
        vacancyId,
        userId,
        cvSnapshot: user?.cvUrl ?? 'sin-cv',
        mensaje:    req.body.mensaje ?? null,
        status:     'nuevo',
      },
      include: {
        vacancy: { select: { titulo: true, ubicacion: true } },
      },
    });

    res.status(201).json({ data });
  } catch (err) {
    // Unique constraint: ya postulado
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya te has postulado a esta vacante' });
    }
    next(err);
  }
}

/* ─── CANDIDATO: mis postulaciones ────────────────────────────────────── */

export async function misPostulaciones(req, res, next) {
  try {
    const data = await prisma.application.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        vacancy: {
          select: {
            id: true, titulo: true, ubicacion: true,
            tipoTrabajo: true, tipoContrato: true, status: true,
            company: { select: { nombre: true, logoUrl: true } },
          },
        },
      },
    });
    res.json({ data });
  } catch (err) { next(err); }
}

/* ─── EMPRESA: listar aplicantes de una vacante ────────────────────────── */

export async function listarPorVacante(req, res, next) {
  try {
    const companyId = req.user.companyId;
    if (!companyId) throw httpError('Perfil de empresa no encontrado en token', 403);

    // Verificar propiedad de la vacante
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: req.params.vacancyId },
      select: { id: true, companyId: true, titulo: true },
    });
    if (!vacancy)                        throw httpError('Vacante no encontrada', 404);
    if (vacancy.companyId !== companyId) throw httpError('No autorizado', 403);

    const data = await prisma.application.findMany({
      where:   { vacancyId: req.params.vacancyId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true, nombre: true, apellidos: true,
            email: true, telefono: true, avatarUrl: true, cvUrl: true,
          },
        },
      },
    });

    res.json({
      data: {
        vacante:     { id: vacancy.id, titulo: vacancy.titulo },
        aplicantes:  data,
        total:       data.length,
      },
    });
  } catch (err) { next(err); }
}

/* ─── EMPRESA: cambiar status de una aplicación ────────────────────────── */

export async function cambiarStatusAplicacion(req, res, next) {
  try {
    const companyId = req.user.companyId;
    if (!companyId) throw httpError('Perfil de empresa no encontrado en token', 403);

    const { status } = req.body;
    if (!APP_STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        error: `Status inválido. Valores aceptados: ${APP_STATUS_VALUES.join(', ')}`,
      });
    }

    // Verificar que la aplicación pertenece a una vacante de esta empresa
    const application = await prisma.application.findUnique({
      where: { id: req.params.applicationId },
      include: { vacancy: { select: { companyId: true } } },
    });
    if (!application)                                    throw httpError('Aplicación no encontrada', 404);
    if (application.vacancy.companyId !== companyId)     throw httpError('No autorizado', 403);

    const data = await prisma.application.update({
      where: { id: req.params.applicationId },
      data:  { status },
      include: {
        user: { select: { id: true, nombre: true, apellidos: true, email: true } },
      },
    });

    const STATUS_LABELS = {
      nuevo:      'Nueva postulación',
      en_proceso: 'En proceso',
      rechazado:  'No seleccionado',
      contratado: '¡Contratado!',
    };
    await pool.query(
      `INSERT INTO notifications (id, user_id, mensaje)
       VALUES (gen_random_uuid(), $1, $2)`,
      [data.user.id, `El estado de tu postulación ha cambiado a: ${STATUS_LABELS[status] ?? status}`]
    );

    res.json({ data });
  } catch (err) { next(err); }
}
