# Matriz de Trazabilidad — Voz Ciudadana

| RF | Caso de Uso | Casos de Prueba | Patrón principal | Archivo fuente |
|----|-------------|-----------------|------------------|----------------|
| RF-1 | CU-01 | CP-31 | Facade | `services/VozCiudadanaFacade.ts` |
| RF-2 | CU-01 | CP-10, CP-11, CP-12, CP-13 | Composite | `patterns/structural/CompositeResource.ts` |
| RF-3 | CU-03 | CP-01, CP-03, CP-04, CP-20-22, CP-33 | Proxy + Chain + Strategy | `patterns/structural/SignatureProxy.ts`, `patterns/behavioral/SignatureValidationChain.ts` |
| RF-4 | CU-04 | CP-08 (rechazo en Frozen) | State | `patterns/behavioral/states/` |
| RF-5 | CU-02, CU-05, CU-06 | CP-02, CP-05, CP-06, CP-07, CP-08, CP-36 | State | `patterns/behavioral/states/` |
| RF-6 | CU-06, CU-08 | CP-07, CP-23, CP-24, CP-32, CP-37 | Crypto + Facade | `services/CryptoService.ts` |
| RF-7 | CU-02, CU-06, CU-07 | CP-14, CP-15, CP-16, CP-17 | Observer | `patterns/behavioral/Observer.ts`, `services/NotificationObservers.ts` |
| RF-8 | CU-07 | CP-29, CP-30, CP-31, CP-35 | Adapter | `patterns/structural/Adapters.ts` |
| RF-9 | CU-03 | CP-25, CP-26, CP-34 | Decorator | `patterns/structural/AuditDecorator.ts` |
| RF-10 | CU-03 | CP-27 | Decorator | `patterns/structural/AuditDecorator.ts` |

## Cobertura RNF

| RNF | Evidencia |
|-----|-----------|
| RNF-1 | CP-07, CP-24, CP-37: hash + HMAC + verificación |
| RNF-2 | CP-27: rate-limit; chain corta temprano |
| RNF-3 | CP-25, CP-26, CP-34: audit log con OK y ERROR |
| RNF-4 | 45 tests, ≥80% cobertura objetivo (configurado en `vitest.config.ts`) |
| RNF-5 | Capas `domain/` ↔ `patterns/` ↔ `services/` |
| RNF-6 | CP-32: hash determinístico |
