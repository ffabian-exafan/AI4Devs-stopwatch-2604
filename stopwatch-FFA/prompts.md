Prompt
Eres un ingeniero front-end senior con profunda experiencia en JavaScript vanilla, arquitectura CSS y desarrollo de interfaces orientado a UX. Tu tarea es implementar una aplicación de Cronómetro + Temporizador Regresivo en una sola página usando únicamente HTML, CSS y JavaScript vanilla — sin frameworks, sin librerías externas.
Te comparto 3 imágenes de referencia visual que debes replicar con la máxima fidelidad posible:

📷 selectType.png → Vista 1: Pantalla de selección de modo
📷 stopwatch.png → Vista 2: Interfaz del cronómetro
📷 countdown.png → Vista 3: Interfaz del temporizador regresivo

Estas imágenes son la fuente de verdad del diseño. Cada decisión visual (colores, tamaños, disposición, tipografía, bordes, espaciado) debe extraerse directamente de ellas. No inventes ni supongas estilos que no estén reflejados en las imágenes.

Estructura de Ficheros

index.html — proporcionado (estructura base con <h1>, enlaces a styles.css y script.js)
script.js — proporcionado (vacío, toda la lógica va aquí)
styles.css — debes crearlo desde cero

No modifiques la estructura HTML más allá de lo estrictamente necesario. Toda la construcción del DOM debe realizarse de forma programática desde JavaScript.

Flujo de la Aplicación
La app tiene tres vistas, renderizadas dinámicamente. Solo una vista es visible a la vez. Las transiciones entre vistas son inmediatas.

Vista 1 — Selector de Modo → replicar selectType.png
Analiza la imagen selectType.png y replica exactamente:

La división en dos paneles iguales lado a lado
El panel izquierdo con texto "Stopwatch" y la flecha verde hacia arriba con su estilo exacto (grosor del borde, degradado, color)
El panel derecho con texto "Countdown" y la flecha roja hacia abajo con su estilo exacto
El fondo de cada panel (observa la diferencia sutil entre ambos en la imagen)
La barra azul marino en la parte inferior, su altura y color exactos
La tipografía, tamaño y peso del texto de los títulos


Vista 2 — Cronómetro → replicar stopwatch.png
Analiza la imagen stopwatch.png y replica exactamente:

El display: forma, color de fondo (#E8EAFF o el que se aprecie), radio de esquinas, borde
Los dígitos HH:MM:SS en su fuente, tamaño, peso y color exactos
Los milisegundos 000 en su posición inferior derecha dentro del display, tamaño reducido
El botón Start: color verde exacto, tamaño, radio de esquinas, borde oscuro, tipografía
El botón Clear: color rojo exacto, mismo tamaño y estilo que Start
La disposición de ambos botones (separados, alineados, con el espaciado visible en la imagen)
La barra azul marino inferior con el botón Back (flecha izquierda + texto), igual que en selectType.png

Comportamiento:

Cuenta hacia arriba desde 00:00:00.000, actualizando cada ~10ms
Start cambia a Stop mientras corre
Clear detiene y reinicia a 00:00:00 / 000
Back vuelve a Vista 1 y reinicia el cronómetro


Vista 3 — Countdown → replicar countdown.png
Analiza la imagen countdown.png y replica exactamente:

El mismo display que en stopwatch.png
El teclado numérico: dos filas de 6 botones cada una

Fila superior: 5 | 6 | 7 | 8 | 9 | Set
Fila inferior: 0 | 1 | 2 | 3 | 4 | Clear


Color verde brillante para todos los dígitos y para Set, extrae el tono exacto de la imagen
Color gris claro para Clear, extrae el tono exacto de la imagen
Tamaño, radio de esquinas, borde oscuro y espaciado entre botones tal como aparecen en la imagen
La barra azul marino inferior con el botón Back, idéntica a las otras vistas

Comportamiento:

Los dígitos se acumulan de derecha a izquierda en formato HHMMSS (máximo 6 dígitos)
Set inicia la cuenta regresiva con el tiempo introducido
Al llegar a 00:00:00.000 el display parpadea en rojo 3 veces y se detiene
Clear borra la entrada y resetea el display a 00:00:00 / 000
Back vuelve a Vista 1


Requisitos de Calidad de Código

Todos los elementos del DOM creados con document.createElement en script.js
CSS en styles.css con nombres de clase BEM o claramente con namespace
Sin inyección de innerHTML con datos controlados por el usuario
Lógica del cronómetro con performance.now() para precisión, sin deriva de setInterval
Separación limpia de responsabilidades:

renderSelector() → Vista 1
renderStopwatch() → Vista 2
renderCountdown() → Vista 3
Módulo de lógica de timer independiente del renderizado


El código debe ser legible, comentado en los puntos clave, y sin dead code


Instrucción Final

Antes de escribir una sola línea de código, examina detenidamente las 3 imágenes proporcionadas. Extrae de ellas todos los valores visuales (colores con cuentagotas mental, proporciones, tipografías, espaciados). El resultado final debe ser visualmente indistinguible de las imágenes de referencia.