# Plan Critico y Ejecucion - PWA "En Boca de Todos"

## 1. Diagnostico critico del plan anterior

El plan original tenia buena intencion visual, pero mezclaba decisiones de UI, arquitectura y entrega sin resolver varios riesgos de producto y de implementacion. Estos son los puntos ciegos mas importantes:

| Punto ciego | Riesgo real | Correccion aplicada en este plan |
| --- | --- | --- |
| El documento asumía muchos archivos y componentes, pero no definia una estrategia de estado | Con una app pequena, eso suele terminar en variables globales, eventos duplicados y errores al sincronizar modal, carrito y checkout | Centralizar el estado en `js/app.js` y dejar los componentes como renderizadores puros |
| `start_url: /index.html` y referencias absolutas | Rompe despliegues en subcarpetas, GitHub Pages o previews locales | Usar rutas relativas: `./`, `./sw.js`, `./assets/...` |
| Cache-first para todo en el Service Worker | Congela versiones viejas del frontend y complica actualizaciones | App shell precacheado + navegacion con fallback offline + assets con stale-while-revalidate |
| El plan prometia "offline" sin aclarar que WhatsApp necesita red | Mala expectativa de producto: el usuario puede llenar el carrito sin conexion, pero no enviar el pedido | Mostrar estado offline y bloquear solo la salida a WhatsApp |
| Se planteaba limpiar el carrito "tras envio exitoso" | No existe confirmacion confiable desde `wa.me` para saber si el mensaje realmente fue enviado | Mantener el carrito hasta que el usuario decida vaciarlo |
| No se modelaba la eleccion incluida entre pico de gallo o guacamole | Parte del pedido podia perderse en el mensaje final | Agregar una seleccion obligatoria de terminacion en los productos |
| `quantity` aparecia en el modelo, pero no en el flujo | El usuario podia terminar con duplicados o sin poder ajustar cantidades | Implementar stepper `+/-` en el carrito y fusionar configuraciones identicas |
| Se proponian `onclick` inline y muchos componentes acoplados | Peor mantenibilidad, accesibilidad y CSP | Delegacion de eventos y scripts como modulos |
| La fuente dependia de Google Fonts dentro de una PWA offline | La UI podia degradarse sin internet en la primera carga | Usar tipografia local con una jerarquia visual fuerte y sin dependencia critica externa |
| La accesibilidad se mencionaba, pero no se aterrizaba | Modales sin foco controlado, escape roto, validacion opaca | Trap de foco, cierre con `Escape`, `reportValidity()` y etiquetas claras |
| Las pruebas estaban definidas solo como una lista manual | Facil declarar terminado algo que aun no esta estable | Agregar criterios concretos de cierre y verificaciones tecnicas |
| El plan dependia de imagenes IA "despues" | Riesgo de frenar el lanzamiento por assets no esenciales | Usar ilustraciones SVG locales y ligeras desde el primer commit |

## 2. Estrategia corregida

La mejor ruta para este proyecto es una PWA estatica, mobile-first y sin build step. Eso reduce complejidad, acelera despliegue y hace viable terminar el producto completo dentro de este repo.

### Arquitectura propuesta

```text
enbocadetodos/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── components/
│   │   ├── cart.js
│   │   ├── catalog.js
│   │   ├── checkout.js
│   │   └── productModal.js
│   └── utils/
│       ├── currency.js
│       ├── storage.js
│       └── whatsapp.js
├── assets/
│   ├── icons/
│   │   ├── apple-touch-icon.png
│   │   ├── favicon.svg
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── img/
│       ├── clasica.svg
│       ├── especial.svg
│       └── mixta.svg
├── manifest.json
├── package.json
└── sw.js
```

### Principios tecnicos

1. Una sola fuente de verdad para el estado:
   `cart`, `activeProductId`, `deliveryAddress`, `currentView`, `installPrompt`.
2. Componentes sin logica compartida oculta:
   cada componente renderiza HTML a partir de datos y `app.js` orquesta eventos y persistencia.
3. PWA segura para despliegues simples:
   rutas relativas, manifest con `scope` relativo y Service Worker tolerante a subdirectorios.
4. Experiencia honesta:
   el usuario puede preparar el pedido offline, pero solo abrir WhatsApp cuando haya conexion.
5. Persistencia resiliente:
   `localStorage` con `try/catch` para no romper la app si el navegador restringe almacenamiento.

## 3. Plan de construccion

### Fase 1 - Fundacion de la app

- Crear `index.html` con una sola vista principal, overlays para modal y carrito, y seccion dedicada al checkout.
- Definir la identidad visual mobile-first en `css/styles.css`.
- Modelar productos, salsas, extras y datos del negocio en `js/data.js`.

### Fase 2 - Flujo principal de pedido

- Renderizar el catalogo desde datos, sin HTML repetido a mano.
- Construir el modal de personalizacion con:
  proteina cuando aplica, terminacion incluida, salsas y extras.
- Calcular el subtotal en tiempo real.
- Agregar al carrito fusionando configuraciones iguales.

### Fase 3 - Carrito y checkout

- Mostrar carrito en panel lateral con:
  resumen, controles de cantidad, eliminar item y vaciar carrito.
- Implementar checkout como vista hash `#/checkout`.
- Validar direccion con HTML nativo y generar el mensaje para WhatsApp.
- Mantener el carrito despues de abrir WhatsApp para no perder el pedido.

### Fase 4 - Capas PWA

- Crear `manifest.json` con iconos locales.
- Registrar `sw.js` solo en contextos compatibles.
- Precachear app shell y responder offline para navegaciones y assets locales.
- Exponer un boton de instalacion cuando `beforeinstallprompt` este disponible.

### Fase 5 - QA de cierre

- Verificar sintaxis de modulos JS.
- Probar persistencia del carrito.
- Confirmar que el enlace `wa.me` incluya:
  productos, cantidades, extras, total y direccion.
- Revisar que la app siga operativa sin red salvo el paso final hacia WhatsApp.

## 4. Definicion de terminado

No se considera terminado hasta que se cumplan todos estos puntos:

- La pagina muestra las tres arepas con CTA funcional.
- El modal permite personalizar cada pedido y recalcula el precio.
- El carrito persiste al recargar.
- El checkout valida la direccion y genera el enlace correcto a WhatsApp.
- La PWA tiene `manifest`, `service worker`, iconos y soporte de instalacion.
- La app funciona desde una carpeta estatica sin backend ni bundler.

## 5. Resultado esperado

El objetivo no es solo "maquetar" una landing. El entregable correcto es una PWA completa y utilizable para vender: instalable, ligera, clara en mobile y lista para convertir pedidos en mensajes de WhatsApp sin pasos manuales intermedios.
