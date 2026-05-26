import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middlewares/error.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

// ── Controladores ─────────────────────────────────────────────────────────
import * as authCtrl        from '../controllers/auth.controller.js';
import * as vacancyCtrl     from '../controllers/vacancy.controller.js';
import * as applicationCtrl from '../controllers/application.controller.js';
import * as dashboardCtrl   from '../controllers/dashboard.controller.js';
import * as publicCtrl      from '../controllers/public.controller.js';
import * as adminCtrl       from '../controllers/admin.controller.js';
import * as candidatoCtrl   from '../controllers/candidato.controller.js';

// ── Validators existentes (se reutilizan sin cambios) ─────────────────────
import { loginRules, registroCandidatoRules, registroEmpresaRules } from '../validators/auth.validators.js';
import { crearVacanteEmpresaRules, actualizarVacanteEmpresaRules, updatePerfilRules, updateStatusAplicacionRules } from '../validators/empresa.validators.js';
import { actualizarPerfilRules, postularRules, crearAlertaRules, alertaIdRules, crearReviewRules, crearThreadRules, crearReplyRules } from '../validators/candidato.validators.js';

// ── Servicios legacy (foros, recursos, reviews públicos) ──────────────────
import {
  detalleVacante, getRecursos,
  getForoCategories, getForoThreads, getForoThread,
  getEmpresaReviews,
} from '../services/public.service.js';
import { empresaController } from '../controllers/empresa.controller.js';

const api = Router();

/* ══════════════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════════════ */
api.post('/auth/login',               loginRules,               validate, authCtrl.login);
api.post('/auth/registro/candidato',  registroCandidatoRules,   validate, authCtrl.registrarCandidato);
api.post('/auth/registro/empresa',    registroEmpresaRules,     validate, authCtrl.registrarEmpresa);

/* ══════════════════════════════════════════════════════════════════
   PÚBLICO
══════════════════════════════════════════════════════════════════ */
api.get('/public/stats',   publicCtrl.getStats);
api.get('/public/vacantes', publicCtrl.getVacantes);
api.get('/public/vacantes/:id', publicCtrl.getVacanteById);
api.get('/public/recursos', async (req, res, next) => {
  try { res.json({ data: await getRecursos(req.query.tipo ?? null) }); } catch (err) { next(err); }
});
api.get('/public/foros', async (_req, res, next) => {
  try { res.json({ data: await getForoCategories() }); } catch (err) { next(err); }
});
api.get('/public/foros/threads/:threadId', async (req, res, next) => {
  try { res.json({ data: await getForoThread(req.params.threadId) }); } catch (err) { next(err); }
});
api.get('/public/foros/:categoryId/threads', async (req, res, next) => {
  try { res.json({ data: await getForoThreads(req.params.categoryId) }); } catch (err) { next(err); }
});
api.get('/public/empresas/:companyId/reviews', async (req, res, next) => {
  try { res.json({ data: await getEmpresaReviews(req.params.companyId) }); } catch (err) { next(err); }
});

/* ══════════════════════════════════════════════════════════════════
   CANDIDATO
══════════════════════════════════════════════════════════════════ */
const candidato = Router();
candidato.use(requireAuth, requireRole('CANDIDATO'));

// Perfil
candidato.get('/perfil',          candidatoCtrl.getPerfil);
candidato.put('/perfil',          actualizarPerfilRules, validate, candidatoCtrl.actualizarPerfil);
candidato.post('/perfil/avatar',  upload.single('avatar'), candidatoCtrl.subirAvatar);
candidato.post('/perfil/cv',      upload.single('cv'),     candidatoCtrl.subirCv);

// Dashboard
candidato.get('/dashboard',       dashboardCtrl.dashboardCandidato);

// Postulaciones
candidato.post('/postulaciones/:vacancyId', postularRules, validate, applicationCtrl.postular);
candidato.get('/postulaciones',             applicationCtrl.misPostulaciones);

// Alertas
candidato.get('/alertas/matches',           candidatoCtrl.getAlertaMatches);
candidato.get('/alertas',                   candidatoCtrl.getAlertas);
candidato.post('/alertas',                  crearAlertaRules, validate, candidatoCtrl.crearAlerta);
candidato.patch('/alertas/:id/toggle',      alertaIdRules, validate, candidatoCtrl.toggleAlerta);
candidato.delete('/alertas/:id',            alertaIdRules, validate, candidatoCtrl.eliminarAlerta);

// Reviews
candidato.get('/reviews',                   candidatoCtrl.misReviews);
candidato.post('/reviews/:companyId',       crearReviewRules, validate, candidatoCtrl.crearReview);

// Foros
candidato.post('/foros/threads',                    crearThreadRules, validate, candidatoCtrl.crearThread);
candidato.post('/foros/threads/:threadId/replies',  crearReplyRules,  validate, candidatoCtrl.crearReply);

api.use('/candidato', candidato);

/* ══════════════════════════════════════════════════════════════════
   EMPRESA
══════════════════════════════════════════════════════════════════ */
const empresa = Router();
empresa.use(requireAuth, requireRole('EMPRESA'));

// Dashboard
empresa.get('/dashboard',         dashboardCtrl.dashboardEmpresa);

// Perfil
empresa.get('/perfil',            empresaController.getPerfil);
empresa.put('/perfil',            updatePerfilRules, validate, empresaController.updatePerfil);
empresa.post('/perfil/logo',      upload.single('logo'), empresaController.uploadLogo);

// Vacantes (CRUD completo vía vacancy.controller)
empresa.get('/vacantes',                      vacancyCtrl.misVacantes);
empresa.post('/vacantes',                     crearVacanteEmpresaRules, validate, vacancyCtrl.crear);
empresa.put('/vacantes/:id',                  actualizarVacanteEmpresaRules, validate, vacancyCtrl.actualizar);
empresa.patch('/vacantes/:id/status',         vacancyCtrl.cambiarStatus);
empresa.delete('/vacantes/:id',               vacancyCtrl.eliminar);

// ATS — aplicaciones
empresa.get('/vacantes/:vacancyId/aplicaciones',        applicationCtrl.listarPorVacante);
empresa.patch('/aplicaciones/:applicationId/status',    updateStatusAplicacionRules, validate, applicationCtrl.cambiarStatusAplicacion);

api.use('/empresa', empresa);

/* ══════════════════════════════════════════════════════════════════
   ADMIN
══════════════════════════════════════════════════════════════════ */
const admin = Router();
admin.use(requireAuth, requireRole('SUPERADMIN'));

admin.get('/stats',                             adminCtrl.getChartStats);
admin.get('/usuarios',                          adminCtrl.listarUsuarios);
admin.patch('/usuarios/:userId/toggle',         adminCtrl.toggleUsuario);
admin.get('/empresas',                          adminCtrl.listarEmpresas);
admin.get('/empresas/pendientes',               adminCtrl.empresasPendientes);
admin.patch('/empresas/:companyId/verificar',   adminCtrl.verificarEmpresa);
admin.get('/recursos',                          adminCtrl.listarRecursos);
admin.post('/recursos',                         adminCtrl.crearRecurso);
admin.put('/recursos/:resourceId',              adminCtrl.actualizarRecurso);
admin.patch('/recursos/:resourceId/toggle',     adminCtrl.toggleRecurso);
admin.delete('/recursos/:resourceId',           adminCtrl.eliminarRecurso);
admin.get('/valoraciones',                      adminCtrl.listarValoraciones);
admin.patch('/valoraciones/:reviewId/aprobar',  adminCtrl.aprobarValoracion);
admin.get('/foros/categorias',                  adminCtrl.listarForoCategorias);
admin.post('/foros/categorias',                 adminCtrl.crearForoCategoria);
admin.delete('/foros/categorias/:categoryId',   adminCtrl.eliminarForoCategoria);

api.use('/admin', admin);

export default api;
