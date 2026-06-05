# ADR-0003 — Congelamiento: SHA-256 + HMAC

## Contexto
RF-6 requiere congelar criptográficamente el expediente. Solo SHA-256 no garantiza inmutabilidad: cualquier actor que modifique el expediente puede recalcular el hash.

## Decisión
1. Canonicalizar el expediente (`Proposal.canonicalize()`): orden estable de firmas (por DNI), recursos serializados.
2. Calcular SHA-256 sobre la forma canónica → `frozenHash`.
3. Calcular HMAC-SHA-256(frozenHash, secret) → `frozenSignedHash`.
4. `verifyFrozenIntegrity()` recalcula HMAC y compara.

## Consecuencias
- Determinismo: misma propuesta → mismo hash (verificado en CP-32).
- Inmutabilidad: alterar `frozenHash` rompe la verificación (CP-37).
- Limitación: el secreto vive en memoria, suficiente para demo. En producción usar KMS / HSM y rotación.
