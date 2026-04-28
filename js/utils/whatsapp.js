import { formatCOP } from "./currency.js";

export function buildWhatsAppUrl({ cart, deliveryAddress, business }) {
  const lines = [
    `*NUEVO PEDIDO - ${business.name.toUpperCase()}*`,
    ""
  ];

  let total = 0;

  cart.forEach((item) => {
    const itemTotal = item.subtotal * item.quantity;
    total += itemTotal;

    lines.push(`${item.quantity}x ${item.productName}`);
    if (item.protein) {
      lines.push(`Proteina: ${item.protein}`);
    }
    if (item.finish) {
      lines.push(`Terminacion: ${item.finish}`);
    }
    if (item.sauces.length) {
      lines.push(`Salsas: ${item.sauces.join(", ")}`);
    }
    if (item.additions.length) {
      lines.push(`Extras: ${item.additions.map((addition) => addition.name).join(", ")}`);
    }
    lines.push(`Subtotal: ${formatCOP(itemTotal)}`);
    lines.push("");
  });

  lines.push("------------------------------");
  lines.push(`*TOTAL: ${formatCOP(total)}*`);
  lines.push("");
  lines.push(`*ENTREGAR EN:* ${deliveryAddress}`);

  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}
