# Clínica & Triaje (`features/clinic`)

Estación de emergencias y soporte clínico diseñada bajo arquitectura **Calm Clinical** y **Material 3 Expressive** (alineada con `kanban`, `campus`, `telemetry` y `pos`).

## Arquitectura Visual y UX (2 Niveles Sin Fatiga)

- **Separación de Vistas con `<m3-tabs variant="primary">`**:
  - **Mesa de Triaje & Guardia**: izquierda serena con leading avatar circular Manchester (`N1`–`N5`) sin barras rígidas al borde, punto vivo reservado para códigos activos, progreso inline de protocolo, 5 filtros en 1 sola línea y selector de ordenamiento (`Prioridad`, `SLA`, `Reciente`); derecha simétrica enfocada en **Resumen Ejecutivo con vitales semánticos, barra de código, transición Fade Through entre pacientes + Asignación Rápida de Camas** con resaltado del box actual sin salir de la mesa.
  - **Mapa Operativo de Boxes**: vista ancha con transición **Fade Through** desde la Mesa de Triaje de las 3 unidades (`Shock Trauma Bay`, `Observación Rápida`, `Tópico & Procedimientos`) con acceso directo **`Historia`** por cada box ocupado que abre el modal clínico **sin abandonar el mapa de camas**.
- **Historia Clínica Completa en `<m3-dialog size="xl">` (`ClinicChartModalComponent`)**:
  - Coreografía con los 3 patrones M3 de movimiento: entra por **Container Transform** (`dialog-transform`) desde Triaje o Boxes, navega entre 3 vistas pares homogéneas mediante una barra cápsula curva (`clinic-chart-tab-track`) con indicador deslizante calibrado (`medium1` 250ms + `spring-standard-fast-spatial-curve`, contenido con `overflow: hidden`) (**`Clínica & Protocolo` | `Monitor & Vitales` | `Evolución & Órdenes`**) y transición **Lateral** en unísono sin fade (`m3LateralIn` / `clinicLateralPrevIn`, `medium1` 250ms) sobre un escenario acotado de alto estable (`clinic-chart-stage`), y entra/sale del sub-nivel `Reevaluar Vitales` mediante **Forward & Backward** (`m3ForwardIn` / `m3BackwardIn`, `medium2` 300ms).
- **Top Layer Nativo & Undo Reversible**:
  - Modales (`Admisión`, `Historia Clínica Amplia`, `Egreso Clínico` y `Bitácora de Egresos`) con `<m3-dialog>` (`.showModal()`), coordinación *single-owner* (`dialogMorphOwner`), aislamiento `vt-clinic-swap` y `<m3-snackbar actionLabel="Deshacer">` para revertir egresos o cambios de box.
