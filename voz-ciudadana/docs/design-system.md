# Sistema de Diseño — Voz Ciudadana

Este documento detalla el **Design System** institucional desarrollado para la plataforma digital **Voz del Ciudadano** del Estado Peruano, alineado con los estándares de diseño centrado en el ciudadano, Gobierno Digital del Perú, Material Design 3 y pautas WCAG 2.2 nivel AA.

---

## 📸 Mockup de Alta Fidelidad (Vista Desktop)

A continuación se presenta el diseño visual premium a nivel ministerial propuesto para la plataforma:

![Voz Ciudadana Desktop Mockup](C:/Users/elmas/.gemini/antigravity/brain/d16bf873-2d04-4b01-acb5-04989dfb363f/voz_ciudadana_desktop_mockup_1780676056475.png)

---

## 🎨 Principios de Diseño e Identidad

El diseño transmite:
1.  **Confianza y Seguridad**: Logrado mediante tipografía robusta, estructuración clara y el uso de Azul Oscuro Institucional.
2.  **Transparencia**: Evidenciado en el Dashboard de Datos Abiertos que muestra estadísticas y logs de auditoría en vivo.
3.  **Accesibilidad Universal**: Diseñado bajo estándares WCAG 2.2 AA con alto contraste nativo, controles para agrandar texto y navegación por teclado fluida.
4.  **Patriotismo e Identidad**: Empleo del Rojo Bicentenario y el Escudo Nacional.

---

## 🛠️ Tokens del Sistema de Diseño

### 1. Paleta de Colores Oficial

| Token | Propósito | Color Hex | Color RGB |
|---|---|---|---|
| `primary` | Rojo Institucional Perú | `#D91A2A` | `rgb(217, 26, 42)` |
| `primary-hover` | Rojo Perú Brillante | `#EF4444` | `rgb(239, 68, 68)` |
| `bg-dark` | Azul Confianza / Seguridad | `#0F214A` | `rgb(15, 33, 74)` |
| `bg-base` | Fondo Gris Claro Limpio | `#F8FAFC` | `rgb(248, 250, 252)` |
| `bg-card` | Fondo Tarjeta Blanco Puro | `#FFFFFF` | `rgb(255, 255, 255)` |
| `border-gray` | Bordes y Separadores | `#E2E8F0` | `rgb(226, 232, 240)` |
| `text-main` | Texto Principal Carbón | `#1E293B` | `rgb(30, 41, 59)` |
| `text-muted` | Texto Secundario / Leyendas | `#64748B` | `rgb(100, 116, 139)` |
| `success` | Verde Verificación RENIEC | `#10B981` | `rgb(16, 185, 129)` |

### 2. Tipografía
*   **Fuente Principal**: `Outfit`, sans-serif (para títulos corporativos y badges).
*   **Fuente Secundaria**: `Inter` o system-ui (para textos de lectura y formularios).
*   **Escala de Tamaños**:
    *   Títulos Hero: `2.25rem` (36px), peso `800`.
    *   Títulos de Tarjetas: `1.25rem` (20px), peso `600`.
    *   Texto de Lectura: `0.925rem` (14.8px), peso `400`.
    *   Subtextos y Leyendas: `0.8rem` (12.8px), peso `500`.

---

## 🧱 Componentes Reutilizables

### Header Gubernamental
*   **Controles de Accesibilidad**: Botones de Alto Contraste (modo claro/oscuro) y Tamaño de Letra (Chica, Mediana, Grande).
*   **Escarapela/Escudo**: Indicador visual de portal oficial gob.pe.
*   **Selector de Idiomas**: Soporte visual para `Español`, `Quechua` y `English`.

### Hero Section
*   Buscador inteligente prominente para iniciativas legislativas ciudadanas.
*   Indicadores rápidos con el estado actual del portal (tiempo real).

### Dashboard de Datos Abiertos (Transparencia)
*   **Integridad Criptográfica**: Visualizador interactivo del hash SHA-256 e HMAC del expediente para verificación externa.
*   **Consola de Auditoría**: Tabla ordenada con la bitácora de firmas procesadas por el decorador de auditoría.
*   **Observadores de Eventos**: Paneles separados que muestran las notificaciones de los observadores del colectivo, del congreso y del ciudadano.

---

## ♿ Estándares de Accesibilidad (WCAG 2.2 AA)
*   **Navegación**: Enfoque visual claro (`:focus-visible`) para navegación por teclado (Tabulator).
*   **Contraste**: Relación mínima de contraste de 4.5:1 para textos regulares y 3:1 para textos grandes.
*   **Texto Adaptable**: Escalabilidad dinámica del tamaño de letra mediante clases css controladas por JavaScript sin romper la cuadrícula flex/grid.
