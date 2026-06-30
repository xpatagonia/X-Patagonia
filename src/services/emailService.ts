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

  const imapHost = process.env.IMAP_HOST;
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
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("SMTP configuration is missing. Simulating email send.");
    return { messageId: "mock-id-" + Date.now(), mocked: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: parseInt(process.env.SMTP_PORT || '465', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return info;
}
