# ADR-0002 — Patrón State para ciclo de vida de Proposal

## Contexto
Una propuesta tiene cinco estados: Draft, Active, Frozen, Expired, Distributed. Cada uno acepta operaciones distintas y bloquea otras. Las transiciones son críticas (RF-5).

## Alternativas
1. `if/switch` sobre un enum dentro de `Proposal` — alto acoplamiento, fácil de violar.
2. Máquina de estados externa con tablas — más complejo de seguir.
3. **State Pattern** — cada estado es una clase con sus reglas.

## Decisión
Usar State Pattern: `ProposalState` interfaz + 5 clases concretas.

## Consecuencias
- Cada regla aislada y testeable.
- Añadir un nuevo estado requiere solo una clase.
- Las operaciones inválidas lanzan excepciones explícitas con mensaje del estado origen.
- Riesgo: `Proposal` y los estados se referencian mutuamente — mitigado usando imports tipo `import type`.
