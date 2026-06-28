import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A1625] rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-white/10"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-slate-200 dark:border-white/10 pb-8">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">Política de Privacidad</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Última actualización: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose dark:prose-invert prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-purple-600">
            <h2>1. Introducción</h2>
            <p>
              Bienvenido a XPatagonia. Respetamos su privacidad y nos comprometemos a proteger sus datos personales. 
              Esta política de privacidad le informará sobre cómo cuidamos sus datos personales cuando visita nuestra 
              plataforma o interactúa con nuestros servicios (incluyendo WhatsApp Business), y le informará sobre sus 
              derechos de privacidad y cómo la ley lo protege.
            </p>

            <h2>2. Datos que recopilamos</h2>
            <p>Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales sobre usted que hemos agrupado de la siguiente manera:</p>
            <ul>
              <li><strong>Datos de Identidad:</strong> incluye nombre, apellido, nombre de usuario o identificador similar.</li>
              <li><strong>Datos de Contacto:</strong> incluye dirección de facturación, dirección de entrega, dirección de correo electrónico y números de teléfono (incluyendo los utilizados para WhatsApp).</li>
              <li><strong>Datos Técnicos:</strong> incluye dirección de protocolo de Internet (IP), sus datos de inicio de sesión, tipo y versión del navegador, configuración de zona horaria y ubicación.</li>
              <li><strong>Datos de Perfil:</strong> incluye su nombre de usuario y contraseña, compras o pedidos realizados por usted, sus intereses, preferencias, comentarios y respuestas a encuestas.</li>
            </ul>

            <h2>3. Uso de la API de WhatsApp Business</h2>
            <p>
              Nuestra plataforma utiliza la API oficial de WhatsApp Business para comunicarnos con nuestros clientes 
              para enviar notificaciones sobre pedidos, soporte técnico y actualizaciones de servicios.
            </p>
            <ul>
              <li>Los números de teléfono de los clientes solo se utilizarán con su consentimiento previo (opt-in).</li>
              <li>No compartimos la información de sus mensajes de WhatsApp con terceros ajenos a la operación y prestación del servicio.</li>
              <li>Usted puede optar por darse de baja (opt-out) de las comunicaciones de WhatsApp en cualquier momento respondiendo "STOP" o contactando a nuestro soporte.</li>
            </ul>

            <h2>4. Cómo utilizamos sus datos personales</h2>
            <p>Solo usaremos sus datos personales cuando la ley nos lo permita. Más comúnmente, usaremos sus datos personales en las siguientes circunstancias:</p>
            <ul>
              <li>Cuando necesitemos ejecutar el contrato que estamos a punto de celebrar o hemos celebrado con usted.</li>
              <li>Cuando sea necesario para nuestros intereses legítimos (o los de un tercero) y sus intereses y derechos fundamentales no anulen esos intereses.</li>
              <li>Cuando necesitemos cumplir con una obligación legal.</li>
            </ul>

            <h2>5. Seguridad de los datos</h2>
            <p>
              Hemos implementado medidas de seguridad adecuadas para evitar que sus datos personales se pierdan 
              accidentalmente, se utilicen o se acceda a ellos de forma no autorizada, se modifiquen o divulguen. 
              Además, limitamos el acceso a sus datos personales a aquellos empleados, agentes, contratistas y 
              otros terceros que tengan una necesidad comercial de conocerlos.
            </p>

            <h2>6. Sus derechos legales</h2>
            <p>Bajo ciertas circunstancias, usted tiene derechos bajo las leyes de protección de datos en relación con sus datos personales, incluyendo el derecho a:</p>
            <ul>
              <li>Solicitar acceso a sus datos personales.</li>
              <li>Solicitar la corrección de sus datos personales.</li>
              <li>Solicitar la eliminación de sus datos personales.</li>
              <li>Oponerse al procesamiento de sus datos personales.</li>
              <li>Solicitar la restricción del procesamiento de sus datos personales.</li>
              <li>Solicitar la transferencia de sus datos personales.</li>
              <li>Derecho a retirar el consentimiento.</li>
            </ul>

            <h2>7. Contacto</h2>
            <p>
              Si tiene alguna pregunta sobre esta política de privacidad o nuestras prácticas de privacidad, 
              comuníquese con nosotros por correo electrónico a: <strong>xpatagonia.com@gmail.com</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
