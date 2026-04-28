export const BUSINESS = {
  name: "En Boca de Todos",
  whatsappNumber: "573013068968",
  whatsappDisplay: "+57 301 306 8968",
  city: "Colombia",
  deliveryHint: "Pago y coordinacion final por WhatsApp."
};

export const PROTEIN_OPTIONS = [
  "Pollo desmechado",
  "Res desmechada"
];

export const SAUCES = [
  "Cilantro",
  "Pimenton ahumado",
  "Aguacate",
  "Humo",
  "Ahumada picante",
  "Tradicionales"
];

export const ADDITION_GROUPS = [
  {
    id: "group-a",
    label: "Extras del grupo A",
    price: 2000,
    note: "$2.000 c/u",
    items: [
      "Champiñones",
      "Chorizo",
      "Salchicha",
      "Queso rallado",
      "Tocineta",
      "Trozos de aguacate"
    ]
  },
  {
    id: "group-b",
    label: "Extras del grupo B",
    price: 4000,
    note: "$4.000 c/u",
    items: [
      "Carne molida",
      "Chicharron",
      "Desmechada extra",
      "Mollejas"
    ]
  }
];

export const PRODUCTS = [
  {
    id: "clasica",
    name: "Arepa Clasica Full",
    price: 11000,
    tagline: "Entrada segura",
    description: "Base potente con queso, jamon, maicitos y una terminacion fresca para elegir.",
    image: "./assets/img/clasica.svg",
    requiresProtein: true,
    finishOptions: [
      "Pico de gallo",
      "Guacamole"
    ],
    included: [
      "1 proteina a eleccion",
      "Queso",
      "Jamon",
      "Maicitos",
      "2 salsas de la casa"
    ]
  },
  {
    id: "mixta",
    name: "Arepa Mixta",
    price: 14000,
    tagline: "La mas balanceada",
    description: "Pollo y res con platanito maduro, bastante queso y el contraste justo de cremoso y crocante.",
    image: "./assets/img/mixta.svg",
    requiresProtein: false,
    finishOptions: [
      "Pico de gallo",
      "Guacamole"
    ],
    included: [
      "Pollo y res",
      "Platanito maduro",
      "Queso",
      "Jamon",
      "Maicitos",
      "Salsas de la casa"
    ]
  },
  {
    id: "especial",
    name: "La Especial",
    price: 17000,
    tagline: "La que resuelve el hambre",
    description: "La mas cargada de la casa: doble proteina, chicharron, mollejas, codorniz y platanito.",
    image: "./assets/img/especial.svg",
    requiresProtein: false,
    finishOptions: [
      "Pico de gallo",
      "Guacamole"
    ],
    included: [
      "Pollo y res",
      "Chicharron",
      "Mollejas",
      "Huevos de codorniz",
      "Platanito maduro",
      "Salsas de la casa"
    ]
  }
];
