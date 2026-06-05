# Voz Ciudadana — Plataforma de Iniciativas Legislativas Ciudadanas

Implementación de referencia de la plataforma digital **Voz del Ciudadano** para automatizar el procesamiento de Iniciativas Legislativas de los Ciudadanos (ILC) bajo límites constitucionales: **25,000 firmas digitales válidas en máximo 90 días**, seguido de congelamiento criptográfico y distribución al Congreso.

## Stack

- TypeScript 5 (`strict`) + Node.js 22+
- Vitest (tests unitarios + integración + cobertura V8)
- Sin dependencias de producción — solo `node:crypto`

## Estructura

```
voz-ciudadana/
├── src/
│   ├── domain/                 # Entidades: Proposal, Signature, Comment, Citizen, Collective
│   ├── patterns/
│   │   ├── behavioral/         # State, Observer, Strategy, Chain of Responsibility
│   │   └── structural/         # Composite, Decorator, Facade, Proxy, Adapter
│   ├── services/               # CryptoService, NotificationObservers, VozCiudadanaFacade
│   └── index.ts                # Demo en consola
├── tests/                      # Suite Vitest (45 tests)
└── docs/
    ├── requisitos.md
    ├── casos-uso.md
    ├── casos-prueba.md
    ├── matriz-trazabilidad.md
    ├── diagramas.md
    └── adr/                    # Architecture Decision Records
```

## Comandos

```bash
npm install
npm test              # Vitest run (45 tests)
npm run coverage      # Cobertura V8
npm run build         # Compilación TypeScript
npm start             # Demo interactiva en consola
```

## Patrones Implementados

| Categoría | Patrón | Ubicación | Rol |
|-----------|--------|-----------|-----|
| Estructural | Facade | `services/VozCiudadanaFacade.ts` | API unificada para subsistemas |
| Estructural | Composite | `patterns/structural/CompositeResource.ts` | Recursos jerárquicos (RF-2) |
| Estructural | Decorator | `patterns/structural/AuditDecorator.ts` | Auditoría + rate-limit firmas |
| Estructural | Proxy | `patterns/structural/SignatureProxy.ts` | Control acceso firmas |
| Estructural | Adapter | `patterns/structural/Adapters.ts` | Integra RENIEC + API Congreso |
| Comportamiento | State | `patterns/behavioral/states/` | Ciclo vida propuesta (RF-5) |
| Comportamiento | Observer | `patterns/behavioral/Observer.ts` | Notificaciones (RF-7) |
| Comportamiento | Strategy | `patterns/behavioral/SignatureValidationStrategy.ts` | Métodos validación firma |
| Comportamiento | Chain of Responsibility | `patterns/behavioral/SignatureValidationChain.ts` | Pipeline validación |

## Resultados de Verificación

- 45/45 tests pasan (`npm test`)
- Build TypeScript sin errores (`npm run build`)
- Demo consola ejecuta flujo completo (`npm start`):
  - Crear propuesta → adjuntar Composite de recursos
  - Activar → recolectar 25,000 firmas → auto-congelar
  - Hash SHA-256 + firma HMAC verificada
  - Distribuir al Congreso (Adapter) → recibir recibo
  - Observers reciben eventos correspondientes
  - Audit log registra cada firma

Ver [`docs/`](./docs/) para requisitos, casos de uso, pruebas y diagramas detallados.
