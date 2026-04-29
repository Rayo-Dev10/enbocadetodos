# Prompt Maestro para Reconstruir "En Boca de Todos"

## Cómo usar este archivo

Entrega este documento completo a un agente de IA con capacidad de editar archivos en un workspace local. El agente debe inspeccionar primero el directorio existente y reconstruir el proyecto respetando la arquitectura, el árbol de archivos, la lógica funcional y la experiencia de usuario descritas aquí. Si algún archivo ya existe, debe corregirlo o completarlo; si falta, debe crearlo.

Este prompt está diseñado con prácticas de prompting consistentes con la documentación oficial de OpenAI, Anthropic y DeepSeek: objetivo explícito, contexto suficiente, restricciones claras, formato de salida definido, delimitadores estructurados, criterios de aceptación y verificación final.

---

## Prompt listo para usar

<rol>
Eres un agente senior de frontend y PWA especializado en HTML, CSS y JavaScript vanilla con módulos ES. Tu trabajo es reconstruir por completo una aplicación web progresiva de pedidos de arepas llamada "En Boca de Todos", manteniendo el directorio, la lógica, el flujo del usuario y la intención visual del proyecto actual.
</rol>

<objetivo>
Reconstruye el proyecto para que funcione como una PWA instalable, mobile-first, en español Colombia (`es-CO`), con carrito persistente, personalización de productos, resumen del pedido y envío de la orden por WhatsApp. Debes respetar la arquitectura modular actual y evitar desviarte a frameworks, backends o herramientas innecesarias.
</objetivo>

<modo_de_trabajo>
1. Inspecciona primero el workspace real.
2. Compara lo que existe contra este contrato.
3. Crea o corrige archivos directamente.
4. Verifica funcionamiento básico antes de terminar.
5. Si necesitas asumir algo menor, asúmelo y documéntalo al final.
6. Solo pregunta al usuario si un bloqueo real impide continuar.
</modo_de_trabajo>

<restricciones_no_negociables>
- Usa únicamente HTML, CSS y JavaScript vanilla con módulos ES.
- No uses React, Vue, Svelte, jQuery, TypeScript, bundlers ni dependencias externas.
- Conserva rutas relativas en todos los assets y módulos.
- Todo el texto visible al usuario debe quedar en UTF-8 limpio, sin mojibake.
- El idioma es español Colombia. Cuida tildes, signos y copy natural.
- No inventes nuevas secciones de negocio que no estén pedidas.
- No agregues formularios largos, registro, pagos en línea ni backend.
- No vacíes el carrito automáticamente después de intentar abrir WhatsApp.
- No incluyas el bloque "Pedido rápido".
- No incluyas el texto "El flujo está pensado primero para mobile, pero responde bien también en escritorio."
- No prometas aperturas imposibles de forzar en todos los navegadores; implementa una estrategia de mejor esfuerzo para WhatsApp y deja el comportamiento robusto.
</restricciones_no_negociables>

<resultado_esperado>
Debes dejar un proyecto funcional que:
- Muestre un catálogo de arepas.
- Permita personalizar cada producto.
- Permita pedir varias unidades iguales o personalizar cada unidad de forma distinta.
- Mantenga el carrito en `localStorage`.
- Muestre `Ordenar ahora` tan pronto haya productos en el carrito.
- Pida el lugar de entrega en un modal centrado si aún no existe.
- Arme un mensaje bonito para WhatsApp con tildes correctas y emojis contextuales.
- Sea instalable como PWA.
- Oculte el botón de instalar cuando la app ya está instalada o corriendo en modo standalone.
- Se vea bien en móviles pequeños, móviles grandes, tablets de 7 a 11 pulgadas, portátiles y escritorio.
</resultado_esperado>

<arbol_del_proyecto>
La estructura objetivo es esta:

```text
/
├─ index.html
├─ manifest.json
├─ sw.js
├─ package.json
├─ plan.md
├─ prompt.md
├─ css/
│  └─ styles.css
├─ js/
│  ├─ app.js
│  ├─ data.js
│  ├─ components/
│  │  ├─ catalog.js
│  │  ├─ cart.js
│  │  ├─ checkout.js
│  │  └─ productModal.js
│  └─ utils/
│     ├─ currency.js
│     ├─ storage.js
│     └─ whatsapp.js
└─ assets/
   ├─ icons/
   │  ├─ apple-touch-icon.png
   │  ├─ favicon.svg
   │  ├─ icon-192.png
   │  └─ icon-512.png
   └─ img/
      ├─ clasica.svg
      ├─ especial.svg
      └─ mixta.svg
```

Si los PNG no existen todavía, puedes generarlos o dejar placeholders válidos, pero debes respetar exactamente esos nombres y rutas.
</arbol_del_proyecto>

<stack_y_principios_tecnicos>
- `package.json` mínimo con proyecto privado y `type: "module"`.
- `index.html` como app shell.
- `manifest.json` y `sw.js` para PWA.
- `css/styles.css` con todo el estilo global.
- `js/app.js` como orquestador principal de estado y eventos.
- Componentes de UI renderizados como strings HTML desde módulos separados.
- Utilidades aisladas para moneda, persistencia y WhatsApp.
- Nada de acoplamiento innecesario entre componentes.
</stack_y_principios_tecnicos>

<copy_y_locale>
Todos los textos deben quedar bien escritos en español Colombia. Corrige cualquier texto roto que encuentres en referencias previas y normalízalo.

Ejemplos de cadenas que deben existir limpias:
- `Instalar`
- `Ver pedido`
- `Ordenar ahora`
- `Lugar de entrega`
- `¿Dónde entregamos tu pedido?`
- `PWA lista para pedir`
- `Carrito`
- `Menú`
- `Arma tu arepa ideal`
- `Sin conexión puedes revisar el pedido, pero no enviarlo por WhatsApp todavía.`

Debes usar caracteres reales, no secuencias dañadas tipo `Ã³`, `Ã±`, `Â¿`, `ðŸ...`.
</copy_y_locale>

<datos_del_negocio>
Define exactamente estos datos base en `js/data.js`:

```js
BUSINESS = {
  name: "En Boca de Todos",
  whatsappNumber: "573013068968",
  whatsappDisplay: "+57 301 306 8968",
  city: "Colombia",
  deliveryHint: "Pago y coordinación final por WhatsApp."
}
```

Proteínas:
- `Pollo desmechado`
- `Res desmechada`

Salsas:
- `Cilantro`
- `Pimentón ahumado`
- `Aguacate`
- `Humo`
- `Ahumada picante`
- `Tradicionales`

Extras grupo A, precio por unidad: `2000`
- `Champiñones`
- `Chorizo`
- `Salchicha`
- `Queso rallado`
- `Tocineta`
- `Trozos de aguacate`

Extras grupo B, precio por unidad: `4000`
- `Carne molida`
- `Chicharrón`
- `Desmechada extra`
- `Mollejas`

Productos:

1. `clasica`
- Nombre: `Arepa Clásica Full`
- Precio: `11000`
- Tagline: `Entrada segura`
- Descripción: `Base potente con queso, jamón, maicitos y una terminación fresca para elegir.`
- Imagen: `./assets/img/clasica.svg`
- `requiresProtein: true`
- Terminaciones: `Pico de gallo`, `Guacamole`
- Incluye:
  - `1 proteína a elección`
  - `Queso`
  - `Jamón`
  - `Maicitos`
  - `2 salsas de la casa`

2. `mixta`
- Nombre: `Arepa Mixta`
- Precio: `14000`
- Tagline: `La más balanceada`
- Descripción: `Pollo y res con platanito maduro, bastante queso y el contraste justo de cremoso y crocante.`
- Imagen: `./assets/img/mixta.svg`
- `requiresProtein: false`
- Terminaciones: `Pico de gallo`, `Guacamole`
- Incluye:
  - `Pollo y res`
  - `Platanito maduro`
  - `Queso`
  - `Jamón`
  - `Maicitos`
  - `Salsas de la casa`

3. `especial`
- Nombre: `La Especial`
- Precio: `17000`
- Tagline: `La que resuelve el hambre`
- Descripción: `La más cargada de la casa: doble proteína, chicharrón, mollejas, codorniz y platanito.`
- Imagen: `./assets/img/especial.svg`
- `requiresProtein: false`
- Terminaciones: `Pico de gallo`, `Guacamole`
- Incluye:
  - `Pollo y res`
  - `Chicharrón`
  - `Mollejas`
  - `Huevos de codorniz`
  - `Platanito maduro`
  - `Salsas de la casa`
</datos_del_negocio>

<contrato_de_estado>
En `js/app.js` centraliza el estado en un objeto equivalente a este:

```js
state = {
  cart: [],
  activeProductId: null,
  modalDraft: null,
  productFlow: null,
  deliveryAddress: "",
  currentView: "menu",
  installPrompt: null,
  toastTimer: null,
  activeLayer: null,
  lastFocusedElement: null
}
```

Requisitos de estado:
- `cart` guarda líneas del pedido.
- Cada línea del carrito debe contener:
  - `id`
  - `productId`
  - `productName`
  - `basePrice`
  - `protein`
  - `finish`
  - `sauces[]`
  - `additions[]` con objetos `{ name, price }`
  - `subtotal`
  - `quantity`
  - `mergeable`
- `productFlow` se usa cuando el usuario quiere personalizar varias unidades diferentes del mismo producto.
</contrato_de_estado>

<reglas_de_negocio>
1. Si el producto requiere proteína, debe obligar a elegir una.
2. La terminación debe elegir entre `Pico de gallo` y `Guacamole`.
3. Las salsas son opcionales y sin costo adicional.
4. Los extras suman al subtotal según el grupo.
5. Si `quantity > 1` y `splitItems === false`, agrega una sola línea mergeable con esa cantidad.
6. Si `quantity > 1` y `splitItems === true`, inicia un flujo por unidad.
7. En personalización por unidad, cada nueva arepa debe empezar limpia desde cero. No reutilices la personalización anterior como base.
8. Los ítems solo se deben fusionar en el carrito si su huella de configuración es la misma y `mergeable !== false`.
9. Los ítems creados desde personalización individual deben quedar con `mergeable: false`.
10. El carrito se debe persistir con `localStorage`.
11. La clave de almacenamiento debe ser `ebdt_cart`.
</reglas_de_negocio>

<flujo_principal>
1. El usuario entra y ve una landing simple con branding, CTA a `Ver menú` y CTA a `Ver pedido`.
2. Ve el catálogo de tres arepas como tarjetas visuales.
3. Pulsa `Personalizar` y se abre un modal lateral o sheet con:
   - cantidad
   - toggle `Quiero personalizar cada una diferente`
   - proteína si aplica
   - terminación
   - salsas
   - extras
   - resumen de lo que incluye la base
   - botón principal con subtotal
4. Si elige varias unidades iguales, se agrega una sola línea al carrito con cantidad.
5. Si elige varias unidades distintas, el flujo debe avanzar arepa por arepa mostrando algo como `Arepa 2 de 3`.
6. Cuando termina de agregar productos, debe aparecer de inmediato una barra fija inferior con:
   - `Ver pedido`
   - `Ordenar ahora`
7. El usuario no debe estar obligado a bajar hasta el final de la página para ordenar.
8. Si toca `Ver pedido`, abre el carrito.
9. Si toca `Ordenar ahora` y no hay lugar de entrega, abre un modal centrado que toma foco y pide el lugar de entrega.
10. Ese modal debe tener su propio botón `Ordenar ahora` que lleva a WhatsApp.
11. Si ya existe lugar de entrega válido, `Ordenar ahora` intenta abrir WhatsApp directamente.
</flujo_principal>

<whatsapp>
Implementa la salida a WhatsApp en `js/utils/whatsapp.js` y coordínala desde `js/app.js`.

Requisitos:
- Construye el mensaje en UTF-8 real.
- Usa `encodeURIComponent` o `URLSearchParams` correctamente.
- El mensaje debe tener estética visual clara y emojis contextuales, sin exagerar.
- No agregues una despedida final como `✅ Quedo atento(a). ¡Gracias!`
- Incluye:
  - encabezado del pedido
  - nombre del negocio
  - detalle por línea del carrito
  - proteína si existe
  - terminación si existe
  - salsas si existen
  - extras si existen
  - subtotal por línea
  - total general
  - lugar de entrega

Formato sugerido:

```text
🍽️ *NUEVO PEDIDO*
🏪 *EN BOCA DE TODOS*

🧾 *Detalle:*

*1) 2x Arepa Mixta*
🥩 Proteína: Pollo desmechado
🥑 Terminación: Guacamole
🫙 Salsas: Cilantro, Humo
➕ Extras: Chorizo, Queso rallado
💵 Subtotal: $...

━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL: $...*

📍 *ENTREGAR EN:* ...
```

Debes exponer varios destinos:
- `https://wa.me/...`
- `https://api.whatsapp.com/send?...`
- `whatsapp://send?...`
- `intent://...` para Android Chromium

Implementa apertura de mejor esfuerzo:
- Android Chromium: intenta `intent://` y luego fallback.
- iPhone/iPad: intenta `whatsapp://` y luego fallback web.
- Otros Android: intenta `whatsapp://` y luego fallback web.
- Otros casos: `wa.me`.

Usa un mecanismo razonable de fallback basado en `visibilitychange`, `pagehide` o `blur` para no disparar todos los destinos si uno ya funcionó.

No afirmes que puedes forzar WhatsApp en todos los navegadores. Solo implementa la estrategia más robusta posible con degradación elegante.
</whatsapp>

<pwa>
Debes dejar la app como PWA instalable.

`manifest.json`:
- `id: "./"`
- `start_url: "./"`
- `scope: "./"`
- `display: "standalone"`
- `lang: "es-CO"`
- `background_color: "#130d08"`
- `theme_color: "#ff7a18"`
- iconos en `assets/icons/`

`sw.js`:
- cachea el app shell
- soporta navegación offline devolviendo `index.html`
- usa una versión de caché clara, por ejemplo `ebdt-v1`
- elimina cachés antiguas en `activate`

Instalación:
- escucha `beforeinstallprompt`
- guarda el evento diferido
- muestra el botón `Instalar` solo si la app todavía no está instalada
- ocúltalo si `display-mode: standalone` coincide o si `navigator.standalone === true`
- vuelve a ocultarlo en `appinstalled`
</pwa>

<estructura_html>
`index.html` debe incluir al menos:
- banner offline
- header sticky con marca y botón de carrito
- botón `Instalar`
- hero
- sección de menú
- grid del catálogo
- sección checkout
- barra fija inferior `quick-actions`
- overlay del modal de producto
- overlay del carrito
- overlay centrado del prompt de entrega
- toast de estado

IDs esperados:
- `offlineBanner`
- `installButton`
- `cartButton`
- `cartBadgeHeader`
- `menuSection`
- `scrollMenuButton`
- `heroCartButton`
- `catalogGrid`
- `checkoutSection`
- `quickActions`
- `cartFab`
- `cartBadgeFab`
- `orderNowButton`
- `productOverlay`
- `productSheet`
- `cartOverlay`
- `cartSheet`
- `deliveryOverlay`
- `deliverySheet`
- `toast`
</estructura_html>

<contrato_de_componentes>
Implementa responsabilidades separadas:

`js/components/catalog.js`
- Renderiza las tarjetas del catálogo.
- Cada tarjeta muestra imagen, tagline, nombre, descripción, incluye base, precio y botón `Personalizar`.

`js/components/productModal.js`
- Renderiza el modal de personalización.
- Debe exponer helpers para:
  - renderizar el modal
  - leer el formulario
  - calcular subtotal
  - generar el label del botón principal

`js/components/cart.js`
- Renderiza el carrito vacío y con ítems.
- Debe permitir:
  - aumentar cantidad
  - disminuir cantidad
  - quitar línea
  - vaciar carrito
  - ordenar ahora

`js/components/checkout.js`
- Renderiza un resumen de checkout.
- Debe mantener el textarea de dirección.
- Debe ofrecer `Ordenar ahora` sin obligar a ir al final del sitio.

`js/utils/currency.js`
- Formatea moneda en COP usando `Intl.NumberFormat("es-CO", ...)`.

`js/utils/storage.js`
- Maneja `loadCart`, `saveCart`, `clearCart`.
- Debe tolerar errores de storage sin romper el flujo.

`js/utils/whatsapp.js`
- Construye mensaje y URLs destino para WhatsApp.
</contrato_de_componentes>

<accesibilidad_y_focus>
- Usa `aria-live` donde corresponda para badges y toast.
- Los overlays deben usar `role="dialog"` y `aria-modal="true"`.
- Al abrir un overlay, mueve el foco a un elemento interactivo útil.
- Al cerrar, devuelve el foco al disparador previo.
- Soporta cierre con clic en backdrop cuando aplique.
- Soporta `Escape`.
- Mantén un focus trap básico dentro del overlay activo.
</accesibilidad_y_focus>

<responsive_y_diseno>
La UI debe verse consistente en:
- móviles pequeños
- móviles grandes
- tablets de 7 a 11 pulgadas
- portátiles
- escritorio

Requisitos visuales:
- estética oscura cálida
- acentos naranjas y dorados
- branding artesanal pero limpio
- tarjetas con buen contraste
- CTA visibles y claros
- barra fija inferior elegante y no invasiva

Requisitos de layout:
- `catalog-grid` fluido con `auto-fit` o equivalente
- las tarjetas deben usar una estructura que evite solapamientos del footer
- el footer de cada tarjeta debe poder envolver o apilar el botón cuando la tarjeta se estrecha
- usa container queries o reglas equivalentes para evitar que el botón `Personalizar` se rompa en anchos intermedios
- la barra fija inferior no debe tapar contenido importante
- reserva espacio inferior suficiente en la app shell

No dejes ningún caso donde el botón principal de una card se salga, se monte sobre el borde o se solape con el contenido.
</responsive_y_diseno>

<comportamiento_offline>
- Si no hay conexión, el usuario puede revisar el catálogo y armar el carrito.
- Debe mostrarse un banner explicando que WhatsApp necesita internet para enviar.
- Si el usuario intenta ordenar sin conexión, muestra un toast explicativo y no rompas el estado.
</comportamiento_offline>

<verificaciones_obligatorias>
Antes de terminar:
1. Revisa que todos los imports relativos funcionen.
2. Verifica que el HTML cargue el CSS, el manifest y `js/app.js`.
3. Valida que el service worker apunte a rutas reales.
4. Verifica que el mensaje de WhatsApp preserve tildes y emojis después de codificar la URL.
5. Verifica que el botón `Instalar` se oculte en modo standalone.
6. Verifica que `Ordenar ahora` abra el prompt de entrega cuando falte la dirección.
7. Verifica que la personalización individual empiece limpia en cada unidad.
8. Verifica que no exista el texto `Pedido rápido`.
9. Verifica que no exista el texto `El flujo está pensado primero para mobile, pero responde bien también en escritorio.`
10. Verifica que no haya mojibake en textos visibles.
</verificaciones_obligatorias>

<criterios_de_aceptacion>
Considera el trabajo terminado solo si todo esto es verdadero:
- La app abre y renderiza el catálogo.
- Se puede personalizar cualquier arepa.
- Se puede pedir cantidad mayor a 1.
- Se puede elegir personalizar cada unidad diferente.
- Cada unidad personalizada diferente inicia desde cero.
- El carrito se mantiene al recargar.
- `Ver pedido` y `Ordenar ahora` aparecen cuando ya hay productos.
- Si falta dirección, el prompt de entrega aparece centrado y toma foco.
- El pedido se codifica bien para WhatsApp con acentos correctos.
- La app es instalable.
- El botón `Instalar` desaparece cuando corresponde.
- La interfaz se ve bien en todas las clases de dispositivo indicadas.
</criterios_de_aceptacion>

<formato_de_respuesta_final>
Cuando termines, responde en este formato:

1. Resultado general
2. Archivos creados o modificados
3. Verificaciones ejecutadas
4. Riesgos residuales o pruebas manuales pendientes

No incluyas razonamiento interno largo. Entrega una respuesta breve, concreta y útil.
</formato_de_respuesta_final>

---

## Notas de diseño del prompt

Este prompt usa varias prácticas útiles:
- Rol explícito y objetivo claro.
- Delimitadores estructurados para reducir ambigüedad.
- Restricciones negativas para prevenir regresiones conocidas.
- Datos base concretos para evitar alucinaciones.
- Criterios de aceptación verificables.
- Formato de salida definido.
- Énfasis en inspeccionar primero el workspace real antes de editar.

---

## Referencias oficiales recomendadas

Fuentes útiles para el diseño de este prompt:

- OpenAI Prompting Guide: `https://platform.openai.com/docs/guides/prompting`
- OpenAI Prompt Engineering Guide: `https://developers.openai.com/api/docs/guides/prompt-engineering`
- Anthropic Prompt Engineering Overview: `https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview`
- Anthropic Prompting Best Practices: `https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices`
- DeepSeek JSON Output: `https://api-docs.deepseek.com/guides/json_mode`
- DeepSeek Context Caching: `https://api-docs.deepseek.com/guides/kv_cache`
- DeepSeek Prefix / Structured Prompting references: `https://api-docs.deepseek.com/guides/chat_prefix_completion`

Si alguna URL cambia en el futuro, prioriza siempre la documentación oficial más reciente del proveedor.
