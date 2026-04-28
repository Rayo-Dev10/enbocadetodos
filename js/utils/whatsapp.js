import { formatCOP } from "./currency.js";

function cleanCurrency(value) {
  return formatCOP(value).replace(/\u00A0/g, " ");
}

export function buildWhatsAppUrl({ cart, deliveryAddress, business }) {
  const lines = [
    "🍽️ *NUEVO PEDIDO*",
    `🏪 *${business.name.toUpperCase()}*`,
    "",
    "🧾 *Detalle:*",
    ""
  ];

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.subtotal * item.quantity;
    total += itemTotal;

    lines.push(`*${index + 1}) ${item.quantity}x ${item.productName}*`);

    if (item.protein) {
      lines.push(`🥩 Proteína: ${item.protein}`);
    }

    if (item.finish) {
      lines.push(`🥑 Terminación: ${item.finish}`);
    }

    if (item.sauces.length) {
      lines.push(`🫙 Salsas: ${item.sauces.join(", ")}`);
    }

    if (item.additions.length) {
      lines.push(`➕ Extras: ${item.additions.map((addition) => addition.name).join(", ")}`);
    }

    lines.push(`💵 Subtotal: ${cleanCurrency(itemTotal)}`);
    lines.push("");
  });

  lines.push("━━━━━━━━━━━━━━━━━━━━");
  lines.push(`💰 *TOTAL: ${cleanCurrency(total)}*`);
  lines.push("");
  lines.push(`📍 *ENTREGAR EN:* ${deliveryAddress}`);
  lines.push("✅ Quedo atento(a). ¡Gracias!");

  const params = new URLSearchParams({ text: lines.join("\n") });
  return `https://wa.me/${business.whatsappNumber}?${params.toString()}`;
}
