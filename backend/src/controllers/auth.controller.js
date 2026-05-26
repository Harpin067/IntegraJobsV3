import * as svc from '../services/auth.service.js';

export async function login(req, res, next) {
  try {
    const result = await svc.login(req.body);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function registrarCandidato(req, res, next) {
  try {
    const result = await svc.registrarCandidato(req.body);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

export async function registrarEmpresa(req, res, next) {
  try {
    const result = await svc.registrarEmpresa(req.body);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}
