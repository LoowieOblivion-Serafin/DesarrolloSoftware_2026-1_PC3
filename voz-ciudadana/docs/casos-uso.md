# Casos de Uso — Voz Ciudadana

## Actores

- **Colectivo Civil**: crea y administra propuestas.
- **Ciudadano**: firma propuestas y comenta.
- **Oficina del Congreso**: recibe expedientes congelados.
- **Sistema**: ejecuta validaciones, transiciones y criptografía.

## CU-01 — Crear propuesta normativa

- **Actor**: Colectivo Civil
- **Precondición**: Colectivo registrado.
- **Flujo principal**:
  1. Colectivo invoca `createProposal(id, title, body, owner)`.
  2. Sistema crea `Proposal` en estado `Draft`.
  3. Colectivo adjunta recursos vía Composite (`attachResource`).
- **Postcondición**: Propuesta existe en estado `Draft`.

## CU-02 — Activar propuesta

- **Actor**: Colectivo Civil
- **Precondición**: Propuesta en `Draft`.
- **Flujo**:
  1. Colectivo invoca `activateProposal(id)`.
  2. Sistema marca `activatedAt = now` y transita a `Active`.
  3. Observers reciben evento `STATE_CHANGED`.

## CU-03 — Firmar propuesta

- **Actor**: Ciudadano
- **Precondición**: Propuesta en `Active`, dentro de 90 días.
- **Flujo principal**:
  1. Ciudadano envía firma con DNI + método (DNI/RENIEC).
  2. Proxy ejecuta Chain: Format → Duplicate → Blacklist → RENIEC.
  3. Decorator de rate-limit verifica frecuencia.
  4. Sistema añade firma, registra en audit log, notifica observers.
  5. Si firma == 25,000: sistema congela automáticamente.
- **Flujo alternativo**:
  - 3a. DNI inválido: rechazo con `Format`.
  - 3b. DNI duplicado: rechazo con `Duplicate`.
  - 3c. DNI bloqueado: rechazo con `Blacklist`.
  - 3d. DNI no encontrado en RENIEC: rechazo con `RENIEC`.

## CU-04 — Comentar / sugerir modificación

- **Actor**: Ciudadano
- **Precondición**: Propuesta en `Draft` o `Active`.
- **Flujo**: Sistema añade `Comment` (kind = OPINION | MODIFICATION_SUGGESTION).

## CU-05 — Expirar por plazo vencido

- **Actor**: Sistema
- **Precondición**: 90+ días transcurridos sin alcanzar umbral.
- **Flujo**: Al intentar firmar, sistema detecta `deadlineReached`, transita a `Expired`, notifica.

## CU-06 — Congelar expediente

- **Actor**: Sistema (automático)
- **Precondición**: 25,000 firmas alcanzadas en estado `Active`.
- **Flujo**:
  1. Sistema canonicaliza expediente (orden estable de firmas + recursos).
  2. Calcula SHA-256 + HMAC.
  3. Marca propuesta como `Frozen` con `frozenHash`, `frozenSignedHash`, `frozenAt`.
  4. Notifica observers (`FROZEN`).

## CU-07 — Distribuir al Congreso

- **Actor**: Sistema / Oficina del Congreso
- **Precondición**: Propuesta en `Frozen`, integridad verificada.
- **Flujo**:
  1. Sistema construye `CongressEnvelope`.
  2. `CongressPort` (Adapter SOAP) envía envelope.
  3. Recibe recibo, transiciona a `Distributed`, notifica.

## CU-08 — Verificar integridad

- **Actor**: Auditor / Oficina del Congreso
- **Flujo**: `verifyFrozenIntegrity(id)` recalcula HMAC(frozenHash, secret) y compara.
