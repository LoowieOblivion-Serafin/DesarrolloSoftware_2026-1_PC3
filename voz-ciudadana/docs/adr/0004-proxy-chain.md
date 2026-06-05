# ADR-0004 — Proxy + Chain of Responsibility para validación de firmas

## Contexto
Una firma debe pasar varias validaciones independientes: formato de DNI, no duplicado, no en blacklist, existir en RENIEC. Mezclar lógicas en un solo método dificulta agregar/quitar reglas.

## Decisión
- **Chain of Responsibility**: cada validación es un `ValidationHandler`. La cadena corta temprano (fail-fast).
- **Proxy** (`SignatureProxy`) intercepta `submit`, ejecuta la cadena y solo invoca el servicio core si pasa.
- **Decoradores** (Audit, RateLimit) envuelven el Proxy para responsabilidades transversales.

## Consecuencias
- Cada validación testeable por separado (`chain.test.ts`).
- Orden de la cadena explícito y modificable (`buildDefaultChain`).
- Composición clara: `RateLimit → Audit → Proxy → Chain → Core`.
- Performance: cadena O(k) donde k = número de handlers, todos O(1) salvo RENIEC (depende del adaptador).
