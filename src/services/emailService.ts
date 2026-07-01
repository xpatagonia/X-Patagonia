import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';

export interface EmailMessage {
  id: string;
  uid: number;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  text?: string;
  html?: string;
}

export async function fetchEmails(): Promise<EmailMessage[]> {
  if (!process.env.IMAP_HOST || !process.env.IMAP_USER || !process.env.IMAP_PASSWORD) {
    console.warn("IMAP configuration is missing. Using mock data.");
    return [
      {
        id: "1",
        uid: 1,
        subject: "Actualización de Políticas B2B",
        from: "admin@xpatagonia.com",
        date: new Date().toISOString(),
        snippet: "Por favor revise las nuevas políticas de facturación para el Q3...",
        text: "Por favor revise las nuevas políticas de facturación para el Q3. Hemos actualizado los plazos de pago y los requisitos de cumplimiento fiscal.",
      },
      {
        id: "2",
        uid: 2,
        subject: "Nueva solicitud de cotización #RFQ-8921",
        from: "compras@empresa.com",
        date: new Date(Date.now() - 86400000).toISOString(),
        snippet: "Necesitamos cotización para 500 unidades de equipamiento de seguridad...",
        text: "Estimados, necesitamos cotización para 500 unidades de equipamiento de seguridad industrial (cascos, guantes, botas) con entrega antes del 15 de Octubre.",
      }
    ];
  }

  let imapHost = process.env.IMAP_HOST;
  // Sanitize IMAP_HOST if user accidentally pasted a URL (e.g. https://vps-...)
  if (imapHost) {
    imapHost = imapHost.replace(/^https?:\/\//, '').split(':')[0].split('/')[0].trim();
  }
  const imapUser = process.env.IMAP_USER;
  const imapPort = parseInt(process.env.IMAP_PORT || '993', 10);
  
  console.log(`[fetchEmails] Starting fetch. Host: ${imapHost}, Port: ${imapPort}, User: ${imapUser}, Secure: ${imapPort === 993}`);
  
  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: imapPort === 993,
    auth: {
      user: imapUser as string,
      pass: process.env.IMAP_PASSWORD as string
    },
    tls: {
      rejectUnauthorized: false
    },
    logger: false as any,
    // Provide a timeout so Cloud Run doesn't hang indefinitely if blocked by firewall
    connectionTimeout: 10000,
    greetingTimeout: 10000
  });

  const emails: EmailMessage[] = [];
  let connected = false;

  try {
    console.log(`[fetchEmails] Attempting client.connect()...`);
    await client.connect();
    connected = true;
    console.log(`[fetchEmails] Successfully connected to IMAP server.`);
    
    // Select mailbox, normally 'INBOX'
    console.log(`[fetchEmails] Getting lock on INBOX...`);
    const lock = await client.getMailboxLock('INBOX');
    console.log(`[fetchEmails] Lock on INBOX acquired.`);
    try {
      // Fetch latest 20 emails
      console.log(`[fetchEmails] Fetching messages from 1:*...`);
      const messages = await client.fetch('1:*', { envelope: true, source: true }, { uid: true });
      
      // We will collect them and sort them
      const rawMessages: any[] = [];
      let messageCount = 0;
      for await (let message of messages) {
        rawMessages.push(message);
        messageCount++;
      }
      console.log(`[fetchEmails] Fetched ${messageCount} messages in total. Processing last 20.`);
      
      // Process only the last 20 messages for performance
      const recentMessages = rawMessages.slice(-20).reverse();

      for (let message of recentMessages) {
        const parsed = await simpleParser(message.source);
        emails.push({
          id: message.uid.toString(),
          uid: message.uid,
          subject: parsed.subject || '(No Subject)',
          from: parsed.from?.text || 'Unknown',
          date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
          snippet: parsed.text ? parsed.text.substring(0, 100) + '...' : '',
          text: parsed.text,
          html: parsed.html || parsed.textAsHtml,
        });
      }
      console.log(`[fetchEmails] Successfully processed ${emails.length} emails.`);
    } finally {
      console.log(`[fetchEmails] Releasing INBOX lock...`);
      lock.release();
    }
  } catch (error: any) {
    console.error('[fetchEmails] ERROR fetching emails:', error);
    throw new Error(`IMAP Error: ${error.message || 'Fallo al conectar'}. Verifica que en Google Cloud Run estén configuradas las variables de entorno (IMAP_HOST, IMAP_USER, IMAP_PASSWORD, IMAP_PORT) y que el puerto no esté bloqueado.`);
  } finally {
    if (connected) {
      await client.logout();
    }
  }

  return emails;
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const hostRaw = process.env.SMTP_HOST;
  const userRaw = process.env.SMTP_USER;
  const passRaw = process.env.SMTP_PASSWORD;

  if (!hostRaw || !userRaw || !passRaw) {
    const missing = [];
    if (!hostRaw) missing.push('SMTP_HOST');
    if (!userRaw) missing.push('SMTP_USER');
    if (!passRaw) missing.push('SMTP_PASSWORD');
    
    console.warn(`SMTP configuration is missing (${missing.join(', ')}). Simulating email send.`);
    return { messageId: "mock-id-" + Date.now(), mocked: true, missing };
  }

  // Sanitize host if it is a URL
  let smtpHost = hostRaw;
  if (smtpHost) {
    smtpHost = smtpHost.replace(/^https?:\/\//, '').split(':')[0].split('/')[0].trim();
  }

  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  
  console.log(`[sendEmail] Starting send to ${to}. Host: ${smtpHost}, Port: ${smtpPort}, User: ${userRaw}, Secure: ${smtpPort === 465}`);

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: userRaw,
      pass: passRaw,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000
  });

  const info = await transporter.sendMail({
    from: userRaw,
    to,
    subject,
    text,
    html,
  });

  console.log(`[sendEmail] Successfully sent email to ${to}. MessageId: ${info.messageId}`);
  return info;
}
