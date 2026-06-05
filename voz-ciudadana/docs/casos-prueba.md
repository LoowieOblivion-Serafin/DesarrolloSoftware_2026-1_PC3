# Casos de Prueba — Voz Ciudadana

> 45 tests automatizados pasando. Ejecutar `npm test`.

## CP-01 — Draft rechaza firmas
- **Archivo**: `tests/state.test.ts`
- **Precondición**: Propuesta nueva en `Draft`.
- **Acción**: `p.addSignature(sig)`.
- **Esperado**: Excepción contiene `/Draft/`.

## CP-02 — Activación transiciona Draft → Active
- **Archivo**: `tests/state.test.ts`
- **Acción**: `p.activate()`.
- **Esperado**: `state.name === 'Active'`, `activatedAt !== null`.

## CP-03 — Firmas válidas se acumulan en Active
- **Archivo**: `tests/state.test.ts`
- **Esperado**: `signatureCount() === 1` tras una firma.

## CP-04 — DNI duplicado rechazado
- **Archivo**: `tests/state.test.ts`, `tests/chain.test.ts`
- **Esperado**: Excepción `/duplicad|ya firmó/`.

## CP-05 — Expiración tras 90+ días
- **Archivo**: `tests/state.test.ts`
- **Tiempo simulado**: `start + 91 días`.
- **Esperado**: Excepción + transición a `Expired`.

## CP-06 — No congelar sin umbral
- **Archivo**: `tests/state.test.ts`
- **Esperado**: Excepción `/25,000/`.

## CP-07 — Congelar al alcanzar 25,000 firmas
- **Archivo**: `tests/facade.integration.test.ts`
- **Esperado**: `state.name === 'Frozen'`, `frozenHash !== null`, `verifyFrozenIntegrity === true`.

## CP-08 — Frozen rechaza firmas/comentarios
- **Archivo**: `tests/state.test.ts`

## CP-09 — Frozen → Distributed
- **Archivo**: `tests/state.test.ts`, `tests/facade.integration.test.ts`

## CP-10 — Composite: tamaño recursivo
- **Archivo**: `tests/composite.test.ts`

## CP-11 — Composite: detecta ciclos
- **Archivo**: `tests/composite.test.ts`
- **Esperado**: Excepción `/Ciclo/`.

## CP-12 — Composite: cuenta hojas recursivamente
- **Archivo**: `tests/composite.test.ts`

## CP-13 — Composite: serialización
- **Archivo**: `tests/composite.test.ts`

## CP-14 — Observer: STATE_CHANGED en activación
- **Archivo**: `tests/observer.test.ts`

## CP-15 — Observer: Congress solo recibe FROZEN/DISTRIBUTED
- **Archivo**: `tests/observer.test.ts`

## CP-16 — Observer: detach detiene notificaciones
- **Archivo**: `tests/observer.test.ts`

## CP-17 — Observer: Citizen recibe THRESHOLD_REACHED
- **Archivo**: `tests/observer.test.ts`

## CP-18 — Strategy: DNI RENIEC válido
- **Archivo**: `tests/strategy.test.ts`

## CP-19 — Strategy: estrategia no registrada lanza
- **Archivo**: `tests/strategy.test.ts`

## CP-20 — Chain: formato inválido primero
- **Archivo**: `tests/chain.test.ts`

## CP-21 — Chain: blacklist bloquea
- **Archivo**: `tests/chain.test.ts`

## CP-22 — Chain: RENIEC rechaza
- **Archivo**: `tests/chain.test.ts`

## CP-23 — Crypto: SHA-256 determinístico
- **Archivo**: `tests/crypto.test.ts`

## CP-24 — Crypto: HMAC verify positivo y negativo
- **Archivo**: `tests/crypto.test.ts`

## CP-25 — Decorator: audit OK
- **Archivo**: `tests/decorator.test.ts`

## CP-26 — Decorator: audit ERROR re-lanza
- **Archivo**: `tests/decorator.test.ts`

## CP-27 — Decorator: rate-limit bloquea excesos
- **Archivo**: `tests/decorator.test.ts`

## CP-28 — Adapter: LegacyRENIEC traduce
- **Archivo**: `tests/adapter.test.ts`

## CP-29 — Adapter: SOAP Congreso genera XML
- **Archivo**: `tests/adapter.test.ts`

## CP-30 — Adapter: Congreso rechaza → excepción
- **Archivo**: `tests/adapter.test.ts`

## CP-31 — Integración: flujo feliz end-to-end
- **Archivo**: `tests/facade.integration.test.ts`

## CP-32 — Integración: hash determinístico entre instancias
- **Archivo**: `tests/facade.integration.test.ts`

## CP-33 — Integración: proxy rechaza formato inválido
- **Archivo**: `tests/facade.integration.test.ts`

## CP-34 — Integración: audit log con OK + ERROR
- **Archivo**: `tests/facade.integration.test.ts`

## CP-35 — Integración: no distribuir sin congelar
- **Archivo**: `tests/facade.integration.test.ts`

## CP-36 — Integración: expira al pasar 90+ días
- **Archivo**: `tests/facade.integration.test.ts`

## CP-37 — Integración: integridad falla con hash manipulado
- **Archivo**: `tests/facade.integration.test.ts`
