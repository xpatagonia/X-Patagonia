export async function sendWhatsAppMessage(to: string, message: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId || token.includes('your-whatsapp')) {
    throw new Error("La configuración de WhatsApp no está completa o es inválida. Configura WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID en las variables de entorno.");
  }

  if (phoneNumberId === process.env.WHATSAPP_APP_ID) {
    throw new Error("Estás usando el Identificador de la Aplicación (App ID) en lugar del Identificador de Número de Teléfono (Phone Number ID). Por favor revisa el panel de Meta for Developers > WhatsApp > API Setup y actualiza WHATSAPP_PHONE_NUMBER_ID.");
  }

  // Asegurar que el número tenga el formato correcto (sin '+' ni espacios)
  const cleanTo = to.replace(/[^0-9]/g, '');

  const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanTo,
    type: "text",
    text: {
      preview_url: false,
      body: message
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp API Error:", data);

    if (data.error?.code === 133010) {
      const isArgentina = cleanTo.startsWith('549');
      let extraInfo = '';
      if (isArgentina) {
        extraInfo = ` Nota para Argentina: Intenta registrar y enviar al número SIN el '9' (ej: 54${cleanTo.substring(3)}).`;
      }
      throw new Error(`Error #133010: El número ${cleanTo} no está registrado en ESTA aplicación. Los números de prueba deben agregarse individualmente a cada nueva App en el panel de Meta. Agrégalo en "API Setup" > "To".${extraInfo}`);
    }

    if (data.error?.message?.includes("Unsupported post request. Object with ID")) {
      throw new Error(`Error: El ID ${phoneNumberId} no existe o no tienes permisos. Asegúrate de estar usando el "Identificador de número de teléfono" (Phone number ID) y NO el "Identificador de la aplicación" ni el "Identificador de cuenta de WhatsApp Business". También verifica que el token (WHATSAPP_ACCESS_TOKEN) corresponda a la misma aplicación.`);
    }

    throw new Error(data.error?.message || "Error al enviar el mensaje de WhatsApp");
  }

  return data;
}

export function verifyWhatsAppWebhook(mode: string | undefined, token: string | undefined, challenge: string | undefined) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return challenge;
  }
  throw new Error("Token de verificación inválido");
}
