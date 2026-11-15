# Campus Académico (`features/campus`)

Workspace académico interactivo con perfiles duales (**Estudiante** y **Docente**) diseñado bajo la arquitectura visual y de movimiento **Material 3 Expressive** del proyecto (alineado con `telemetry`, `inventory` y `pos`).

## Arquitectura Visual y UX

- **Capas tonales OKLCH sin marcos wireframe (`border-outline-sub` / box-in-box)**: Contenedores externos en `bg-surface-low` (`rounded-m3-xl`) con tarjetas interactivas internas en `bg-surface` / `bg-surface-high` y acentos en `bg-primary-box`.
- **Morphing táctil acotado**: Las tarjetas interactivas y botones de asistencia (`P / T / F`) animan sus radios dentro de límites proporcionales (`h/2` máx. `20px` en botones compactos, `16px -> 20px -> 24px` en bloques de horario y `24px -> 14px` en filtros KPI) sin radios extremos `9999px`.
- **Indicadores académicos deterministas sin bucles `wavy`**:
  - **Estudiante (`CampusStudentHeroComponent`)**: La sesión en curso (`isActiveNow`) usa `<m3-linear-progress [wavy]="false">` acompañado de 3 fases de clase (`Apertura`, `Desarrollo`, `Cierre`); los bloques programados a futuro omiten la barra vacía de `0%` y muestran una franja compacta de preparación (`Próximo bloque programado` / `Sala y temario listos`).
  - **Docente (`CampusTeacherHeroComponent`)**: Usa `<m3-linear-progress size="lg" color="primary" [wavy]="false">` con `[buffer]` tonal opcional cuando existen tardanzas y resumen numérico compacto (`presentes · tardanzas · faltas`).
- **Modales portales con `dialog-transform`**: Los 4 modales (`CampusClassroomModalComponent`, `CampusAssignmentModalComponent`, `CampusGradingModalComponent`, `CampusAnnouncementModalComponent`) se montan fuera de `#app-stage` mediante `StageOverlayService` para evitar doble blur/scrim y ejecutar View Transitions desde el botón disparador, con gestión de foco en `#modalHeading` (`tabindex="-1"`) y restauración al elemento de origen al cerrar o pulsar `Escape`.
- **Rejilla Mission Control (`8 / 4`) y Navegación Móvil WAI-ARIA**: Scroll fluido único con cabecero de comando, cinta de KPIs, barra móvil `role="tablist"` con soporte de teclado (`ArrowLeft`, `ArrowRight`, `Home`, `End`) y `<m3-fab>` contextual en móviles.
