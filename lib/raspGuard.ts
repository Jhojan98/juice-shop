/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 *
 * RASP académico (Taller WAAP Fase 4): puerto 1:1 del rasp_agent.py del PDF.
 * - raspMiddleware: inspección global de parámetros ya decodificados (req.query/body).
 * - isSqlInjection: guard para la consulta SQL FINAL ya concatenada, con visibilidad
 *   del valor real antes de ejecutarse (contexto de ejecución). Usado en routes/login.ts.
 */
import { type Request, type Response, type NextFunction } from 'express'

import logger from './logger'

// Mismo patrón del PDF: (\bUNION\b|\bOR\b\s+1=1|--|;\s*DROP\b)
const SQLI_PATTERN = /(\bUNION\b|\bOR\b\s+1=1|--|;\s*DROP\b)/i

export function isSqlInjection (finalQuery: string): boolean {
  return SQLI_PATTERN.test(finalQuery)
}

function flatten (value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return String(value)
  }
}

export function raspMiddleware (req: Request, res: Response, next: NextFunction): void {
  if (process.env.RASP_ENABLED === '0') {
    next()
    return
  }
  const parts = [
    flatten(req.query),
    flatten(req.body),
    flatten(req.params)
  ]
  const haystack = parts.join(' ')
  if (SQLI_PATTERN.test(haystack)) {
    logger.warn(`RASP: petición bloqueada en middleware global: ${req.method} ${req.path}`)
    res.status(403).json({ status: 'blocked', reason: 'Operacion bloqueada por RASP' })
    return
  }
  next()
}
