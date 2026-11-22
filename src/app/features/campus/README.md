# Campus Académico (`features/campus`)

Workspace académico interactivo con perfiles duales (**Estudiante** y **Docente**) diseñado bajo la arquitectura visual y de movimiento **Material 3 Expressive** del proyecto (alineado con `telemetry`, `inventory` y `kanban`).

## Arquitectura Visual y UX

- **Capas tonales OKLCH sin marcos wireframe (`border-outline-sub` / box-in-box)**: Contenedores externos en `bg-surface-low` (`rounded-m3-xl`), tarjetas interactivas internas en `bg-surface` / `bg-surface-high` y cero colisiones `class` + `[class]`.
- **Morphing táctil acotado**: Las tarjetas interactivas y botones de asistencia (`P / T / F`, mínimo táctil `44px`) animan sus radios dentro de límites proporcionales (`h/2` máx. `22px`) sin radios extremos `9999px`.
- **Indicadores académicos deterministas y Simulador Ponderado**:
  - **Estudiante**: sesión en curso con fases (`Apertura`, `Desarrollo`, `Cierre`), bloques futuros con franja de preparación, checklist de recursos por sesión en Aula Virtual, filtro de comunicados (*Todos / Sin leer / Prioritarios*) y diálogo **Simulador Ponderado** (`<m3-slider>`) con desglose por curso.
  - **Docente**: selector de sección activa (`FIS-302` / `INF-204`), quórum segmentado, buscador semántico `<search>`, acciones directas de justificación / citación a tutoría, **Deshacer** tras *Marcar Todos Presentes* en `<m3-snackbar>`, filtros en Cola de Revisión (*Todas / Pendientes / Evaluadas*) y creador de nuevas evaluaciones en vivo hacia el estudiante.
- **Diálogos Nativos Top Layer (`<m3-dialog>`) + `dialog-transform` de Dueño Único**: Los 6 diálogos (`Classroom`, `Assignment`, `Grading`, `Announcement`, `Evaluation`, `Simulator`) se montan siempre en el portal de `StageOverlayService` usando `<m3-dialog>` (`showModal()`), coordinación estricta `dialogMorphOwner` (`'trigger' | 'modal' | null`), y aislamiento de `html.vt-campus-swap` para evitar parpadeos de raíz.
- **Rejilla Mission Control (`8 / 4`) y `<m3-tabs variant="primary">`**: Navegación móvil estándar accesible (`ArrowLeft`, `ArrowRight`, `Home`, `End`) y `<m3-fab>` contextual.
