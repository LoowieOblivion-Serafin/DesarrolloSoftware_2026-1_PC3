# ADR-0001 — TypeScript + Vitest

## Estado
Aceptado.

## Contexto
Necesitamos un lenguaje tipado para implementar los patrones con interfaces explícitas y un framework de pruebas que ejecute rápido sobre ESM nativo.

## Decisión
- **TypeScript 5 con `strict: true`** para forzar tipos correctos en los `ProposalState` y reducir errores de transición.
- **Vitest 2** sobre Node.js 22+, ESM puro, ejecución vía `tsx` para dev.

## Consecuencias
- Tests rápidos (~47s para 45 tests incluido stress de 25k firmas).
- Compatibilidad sin Babel/Jest config.
- Configuración mínima: `tsconfig.json`, `vitest.config.ts`.
