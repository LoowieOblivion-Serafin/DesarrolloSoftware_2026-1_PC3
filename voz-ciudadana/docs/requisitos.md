# Requisitos — Voz Ciudadana

## Contexto

El Legislativo de la República requiere la plataforma digital "Voz del Ciudadano" para automatizar el procesamiento de Iniciativas Legislativas de los Ciudadanos (ILC). Los colectivos civiles crean propuestas normativas y recolectan firmas. Al alcanzar **25,000 firmas válidas** dentro de **90 días**, el sistema congela criptográficamente el archivo y lo envía a la Oficina del Congreso.

## Glosario

| Término | Definición |
|---------|------------|
| ILC | Iniciativa Legislativa de los Ciudadanos |
| Colectivo | Organización civil registrada que crea propuestas |
| Firmante | Ciudadano con DNI válido que apoya una propuesta |
| Expediente | Conjunto formal de propuesta + firmas + recursos |
| Congelamiento | Cierre criptográfico que vuelve inmutable el expediente |

## Requisitos Funcionales (RF)

| ID | Requisito | Patrón clave |
|----|-----------|--------------|
| RF-1 | Gestión de propuestas (ILC): crear, editar, almacenar | Facade |
| RF-2 | Adjuntar recursos de soporte jerárquicos (docs, videos, links, carpetas) | Composite |
| RF-3 | Recolectar firmas con validación de identidad (DNI + RENIEC + duplicados + blacklist) | Proxy + Chain + Strategy |
| RF-4 | Permitir comentarios y sugerencias de modificación durante estado Active | State |
| RF-5 | Control de plazos (90 días) y umbral (25,000 firmas) con transiciones automáticas de estado | State |
| RF-6 | Congelamiento criptográfico (SHA-256 sobre forma canónica + HMAC para verificación) | Decorator + Facade |
| RF-7 | Notificar a colectivo, Congreso y ciudadanos sobre hitos | Observer |
| RF-8 | Distribuir expediente congelado a la Oficina del Congreso vía API externa | Adapter |
| RF-9 | Auditoría completa de cada firma (OK/ERROR) con motivo | Decorator |
| RF-10 | Rate-limit anti-spam por DNI | Decorator |

## Requisitos No Funcionales (RNF)

| ID | Requisito | Implementación |
|----|-----------|----------------|
| RNF-1 | Integridad criptográfica del expediente congelado | SHA-256 + HMAC, `verifyFrozenIntegrity()` |
| RNF-2 | Escalabilidad: soportar ráfagas de firmas | Rate-limit + Chain temprano, validación O(1) por DNI |
| RNF-3 | Trazabilidad: log auditable de cada firma | `AuditDecorator` con timestamp ISO-8601 |
| RNF-4 | Testabilidad: ≥80% líneas, ≥75% ramas | Vitest + coverage V8 |
| RNF-5 | Mantenibilidad: separación dominio / patrones / servicios | Arquitectura por capas |
| RNF-6 | Determinismo: misma propuesta → mismo hash | `Proposal.canonicalize()` con orden estable |

## Reglas de Negocio (RN)

- **RN-1**: Un DNI no puede firmar dos veces la misma propuesta.
- **RN-2**: Una propuesta en estado `Draft` no acepta firmas.
- **RN-3**: Al alcanzar la firma número 25,000 la propuesta debe congelarse automáticamente.
- **RN-4**: Una propuesta congelada o expirada no acepta más firmas, comentarios ni modificaciones.
- **RN-5**: Al exceder 90 días desde activación sin alcanzar el umbral, la propuesta transiciona a `Expired`.
- **RN-6**: Solo propuestas en `Frozen` pueden distribuirse al Congreso.
- **RN-7**: El hash congelado debe poder verificarse con la firma HMAC asociada.
