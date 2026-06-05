# Diagramas — Voz Ciudadana

## 1. Diagrama de Estados (State Pattern)

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Active : activate()
    Active --> Frozen : firma #25,000 (auto)
    Active --> Expired : t > 90 días
    Frozen --> Distributed : distributeToCongress()
    Expired --> [*]
    Distributed --> [*]

    Draft : addComment OK\nattachResource OK\naddSignature ✖
    Active : addSignature OK\naddComment OK\nattachResource ✖
    Frozen : todo ✖ excepto distribute
    Expired : todo ✖
    Distributed : todo ✖
```

## 2. Casos de Uso

```mermaid
graph LR
    C[Colectivo] -->|crea| CU01[CU-01 Crear propuesta]
    C -->|activa| CU02[CU-02 Activar]
    Ciud[Ciudadano] -->|firma| CU03[CU-03 Firmar]
    Ciud -->|comenta| CU04[CU-04 Comentar]
    Sys((Sistema)) -->|monitorea| CU05[CU-05 Expirar]
    Sys -->|al umbral| CU06[CU-06 Congelar]
    Sys -->|envía| CU07[CU-07 Distribuir]
    Cong[Congreso] -->|recibe| CU07
    Aud[Auditor] -->|valida| CU08[CU-08 Verificar integridad]
```

## 3. Flujo de firma — Secuencia (Proxy + Chain + Decorator)

```mermaid
sequenceDiagram
    autonumber
    participant U as Ciudadano
    participant F as VozCiudadanaFacade
    participant RL as RateLimitDecorator
    participant AD as AuditDecorator
    participant PX as SignatureProxy
    participant CH as ValidationChain
    participant CS as CoreSignatureService
    participant P as Proposal (Active)
    participant OBS as Observers

    U->>F: sign(proposalId, sig)
    F->>RL: submit(p, sig)
    RL->>RL: checkRateLimit(dni)
    RL->>AD: submit(p, sig)
    AD->>PX: submit(p, sig)
    PX->>CH: handle({proposal, signature})
    CH-->>PX: {ok:true}
    PX->>CS: submit(p, sig)
    CS->>P: addSignature(sig)
    P->>OBS: notify(SIGNATURE_ADDED)
    alt count == 25000
        P->>OBS: notify(THRESHOLD_REACHED)
        F->>F: freezeProposal(id)
        F->>P: freeze(hash, signedHash)
        P->>OBS: notify(FROZEN)
    end
    AD->>AD: log(OK)
```

## 4. Composite — Recursos

```mermaid
classDiagram
    class ResourceComponent {
        <<abstract>>
        +name: string
        +sizeBytes() number
        +count() number
        +describe(indent) string
        +serialize() SerializedResource
    }
    class DocumentLeaf { -bytes: number }
    class VideoLeaf { -bytes: number }
    class LinkLeaf { +uri: string }
    class FolderComposite {
        -children: ResourceComponent[]
        +add(c)
        +remove(c)
        +containsCycle(c) bool
    }
    ResourceComponent <|-- DocumentLeaf
    ResourceComponent <|-- VideoLeaf
    ResourceComponent <|-- LinkLeaf
    ResourceComponent <|-- FolderComposite
    FolderComposite o--> ResourceComponent : children
```

## 5. Facade — Composición de subsistemas

```mermaid
graph TB
    UI[Cliente / Demo Consola] --> F[VozCiudadanaFacade]
    F --> RL[RateLimitDecorator]
    RL --> AD[AuditDecorator]
    AD --> PX[SignatureProxy]
    PX --> CH[ValidationChain]
    CH --> RP[RENIECPort Adapter]
    PX --> CSS[CoreSignatureService]
    F --> CRY[CryptoService]
    F --> CP[CongressPort Adapter]
    F --> PR[(Proposals)]
    PR --> ST[ProposalState]
    PR --> OB[Observers]
```
