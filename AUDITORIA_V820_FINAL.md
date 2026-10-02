# Auditoría V8.20 — PiscinaSur

Rama de trabajo: `fix/v820-auditoria-final`.

## Regla de seguridad
- `main` y producción no se modifican hasta validar Preview.
- La V8.20 original es la única base.
- No usar loaders, HTML paralelo ni inyección de parches.
- Eliminar código sólo cuando esté comprobado como duplicado u obsoleto.

## Correcciones obligatorias
1. Tipo de obra independiente de `tipoProyecto`: Piscina / Jacuzzi / Piscina + Jacuzzi.
2. Jacuzzi deja de ser un adicional para evitar doble contabilización.
3. Jacuzzi 2,5×2,5: MO fija $2.000.000 + materiales por geometría.
4. Jacuzzi 3×3: MO fija $2.700.000 + materiales por geometría; anticipo maestros $1.350.000 y saldo $1.350.000.
5. Losa estructural: 20 cm.
6. Jacuzzi 3×3: exterior 3,4×3,4; losa 2,312 m³; muros 2,56×H; asiento 2,50 m³; a H=1,20 total 7,884 m³.
7. Jacuzzi 2,5×2,5: exterior 2,9×2,9; losa 1,682 m³; muros 2,16×H; asiento 2,00 m³.
8. Piscina + Jacuzzi calcula ambos por separado y consolida una sola cotización/PDF.
9. Mantener cálculo/PDF/historial/interfaz existente salvo cambios expresamente necesarios.

## Pruebas antes de integrar
- Piscina normal: sin regresiones.
- Jacuzzi 2,5×2,5.
- Jacuzzi 3×3 a profundidad 1,20 m = 7,884 m³ estructurales.
- Piscina + Jacuzzi sin doble cobro.
- IVA aplicado una sola vez.
- PDF y WhatsApp conservan funcionamiento.
- Historial conserva tipo de obra.

## Limpieza
Retirar únicamente después de verificar referencias: lógica antigua de Jacuzzi como adicional, loaders/inyecciones de integración y código de pruebas sin flujo activo. No retirar funciones compartidas por cálculo, PDF, historial o interfaz.