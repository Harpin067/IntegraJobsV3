import { prisma } from '../db/prisma.js';
import { httpError } from '../middlewares/error.middleware.js';

/* ─── Helpers ──────────────────────────────────────────────────────────── */

async function resolveCompanyId(req) {
  // El JWT incluye companyId cuando el usuario es EMPRESA.
  // Si por alguna razón no está, lo buscamos en DB.
  if (req.user.companyId) return req.user.companyId;
  const company = await prisma.company.findUnique({ where: { userId: req.user.id }, select: { id: true } });
  if (!company) throw httpError('Perfil de empresa no encontrado', 404);
  return company.id;
}

async function assertOwnership(vacancyId, companyId) {
  const vacancy = await prisma.vacancy.findUnique({
    where: { id: vacancyId },
    select: { id: true, companyId: true },
  });
  if (!vacancy)                        throw httpError('Vacante no encontrada', 404);
  if (vacancy.companyId !== companyId) throw httpError('No autorizado', 403);
  return vacancy;
}

/* ─── Mis vacantes ─────────────────────────────────────────────────────── */

export async function misVacantes(req, res, next) {
  try {
    const companyId = await resolveCompanyId(req);
    const data = await prisma.vacancy.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { applications: true } },
      },
    });
    res.json({ data });
  } catch (err) { next(err); }
}

/* ─── Crear vacante ────────────────────────────────────────────────────── */

export async function crear(req, res, next) {
  try {
    const companyId = await resolveCompanyId(req);

    const {
      titulo, descripcion, requisitos, ubicacion,
      tipoTrabajo, tipoContrato, experiencia,
      contacto, salarioMin, salarioMax,
    } = req.body;

    const data = await prisma.vacancy.create({
      data: {
        companyId,
        titulo,
        descripcion,
        requisitos,
        ubicacion,
        tipoTrabajo,
        tipoContrato,
        experiencia,
        contacto,
        salarioMin:  salarioMin  != null ? Number(salarioMin)  : null,
        salarioMax:  salarioMax  != null ? Number(salarioMax)  : null,
        status:      'activa',
        isApproved:  false,
      },
    });

    res.status(201).json({ data });
  } catch (err) { next(err); }
}

/* ─── Actualizar vacante ───────────────────────────────────────────────── */

export async function actualizar(req, res, next) {
  try {
    const companyId = await resolveCompanyId(req);
    await assertOwnership(req.params.id, companyId);

    const allowed = [
      'titulo', 'descripcion', 'requisitos', 'ubicacion',
      'tipoTrabajo', 'tipoContrato', 'experiencia',
      'contacto', 'salarioMin', 'salarioMax',
    ];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates[field] = (field === 'salarioMin' || field === 'salarioMax')
          ? (req.body[field] != null ? Number(req.body[field]) : null)
          : req.body[field];
      }
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
    }

    const data = await prisma.vacancy.update({
      where: { id: req.params.id },
      data:  updates,
    });

    res.json({ data });
  } catch (err) { next(err); }
}

/* ─── Cambiar status ───────────────────────────────────────────────────── */

export async function cambiarStatus(req, res, next) {
  try {
    const companyId = await resolveCompanyId(req);
    await assertOwnership(req.params.id, companyId);

    const ALLOWED_TRANSITIONS = ['activa', 'pausada', 'cerrada'];
    const { status } = req.body;
    if (!ALLOWED_TRANSITIONS.includes(status)) {
      return res.status(400).json({ error: `Status inválido. Valores aceptados: ${ALLOWED_TRANSITIONS.join(', ')}` });
    }

    const data = await prisma.vacancy.update({
      where: { id: req.params.id },
      data:  { status },
    });

    res.json({ data });
  } catch (err) { next(err); }
}

/* ─── Eliminar vacante ─────────────────────────────────────────────────── */

export async function eliminar(req, res, next) {
  try {
    const companyId = await resolveCompanyId(req);
    await assertOwnership(req.params.id, companyId);

    // Eliminar aplicaciones primero (FK sin cascade en schema)
    await prisma.$transaction([
      prisma.application.deleteMany({ where: { vacancyId: req.params.id } }),
      prisma.vacancy.delete({ where: { id: req.params.id } }),
    ]);

    res.status(204).end();
  } catch (err) { next(err); }
}

/* ─── Detalle público (re-exportado desde public.controller) ──────────── */

export async function detalle(req, res, next) {
  try {
    const data = await prisma.vacancy.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (!data) return res.status(404).json({ error: 'Vacante no encontrada' });
    res.json({ data });
  } catch (err) { next(err); }
}
