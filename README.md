# Prototipo de búsqueda y reserva de canchas deportivas

## Descripción

Proyecto académico de la asignatura Interacción Humano-Computador.
El prototipo permite buscar canchas deportivas, consultar sus
características, seleccionar un horario y confirmar una reserva simulada.

## Integrantes

- Milena Andrews
- Víctor Cáceres

## Tecnologías

- HTML
- CSS
- JavaScript

## Ejecución

1. Descargar los archivos del proyecto.
2. Mantener index.html, styles.css y app.js en la misma carpeta.
3. Abrir index.html en un navegador.

No requiere instalar dependencias.

## Pantallas

1. Inicio y búsqueda.
2. Resultados.
3. Detalle de cancha.
4. Selección de horario.
5. Resumen de reserva.
6. Confirmación.

## Alcance y limitaciones

- Los recintos, precios y horarios son ficticios.
- No se realizan pagos ni reservas reales.
- No existe conexión con un servidor.
- Las reservas se guardan en el navegador cuando este permite
  el almacenamiento local.
- No se incluye una pantalla de historial de reservas.

## Reiniciar las reservas de prueba

Ejecutar en la consola del navegador:

localStorage.removeItem("ihc-reservas-v1");
location.reload();
