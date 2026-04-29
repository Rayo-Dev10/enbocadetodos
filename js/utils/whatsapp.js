import { formatCOP } from "./currency.js";

function cleanCurrency(value) {
  return formatCOP(value).replace(/\u00A0/g, " ");
}

export function buildWhatsAppMessage({ cart, deliveryAddress, business }) {
  const lines = [
    "*NUEVO PEDIDO*",
    `*${business.name.toUpperCase()}*`,
    "",
    "*Detalle:*",
    ""
  ];

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.subtotal * item.quantity;
    total += itemTotal;

    lines.push(`*${item.quantity}x ${item.productName}*`);

    if (item.protein) {
      lines.push(`- *Proteína:* _${item.protein}_`);
    }

    if (item.finish) {
      lines.push(`- *Terminación:* _${item.finish}_`);
    }

    if (item.sauces.length) {
      lines.push(`- *Salsas:* _${item.sauces.join(", ")}_`);
    }

    if (item.additions.length) {
      lines.push(`- *Extras:* _${item.additions.map((addition) => addition.name).join(", ")}_`);
    }

    lines.push(`- *Subtotal:* ${cleanCurrency(itemTotal)}`);
    lines.push("");
  });

  lines.push("━━━━━━━━━━━━━━━━━━━━");
  lines.push(`*TOTAL: ${cleanCurrency(total)}*`);
  lines.push("");
  lines.push(`*ENTREGAR EN:* ${deliveryAddress}`);

  return lines.join("\n");
}

export function buildWhatsAppTargets(payload) {
  const message = buildWhatsAppMessage(payload);
  const encodedMessage = encodeURIComponent(message);
  const encodedNumber = encodeURIComponent(payload.business.whatsappNumber);
  const httpsUrl = `https://wa.me/${payload.business.whatsappNumber}?text=${encodedMessage}`;
  const apiUrl = `https://api.whatsapp.com/send?phone=${encodedNumber}&text=${encodedMessage}`;
  const schemeUrl = `whatsapp://send?phone=${encodedNumber}&text=${encodedMessage}`;
  const intentUrl = `intent://send/?phone=${encodedNumber}&text=${encodedMessage}#Intent;scheme=whatsapp;S.browser_fallback_url=${encodeURIComponent(httpsUrl)};end`;

  return {
    message,
    httpsUrl,
    apiUrl,
    schemeUrl,
    intentUrl
  };
}
