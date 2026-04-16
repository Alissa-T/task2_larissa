const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail SMTP
// Note: For Gmail, you MUST use an "App Password" (Senha de App) instead of your regular password.
// Provide EMAIL_USER and EMAIL_PASS inside the project's .env file.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envia um email assincronamente.
 * 
 * @param {string} to - Destinatário
 * @param {string} subject - Assunto
 * @param {string} text - Corpo do email (texto puro)
 * @param {string} html - Corpo do email (HTML rico opcional)
 * @returns {Promise<boolean>} Retorna true caso sucesso
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ [Email Service] Credenciais do Gmail ausentes no .env (EMAIL_USER e EMAIL_PASS). O email não será enviado.');
      return false;
    }
    
    if (!to) {
      console.warn('⚠️ [Email Service] Destinatário vazio. O email não será enviado.');
      return false;
    }

    const mailOptions = {
      from: `"Financeiro Alerta" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ [Email Service] Email enviado para ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ [Email Service] Erro ao enviar email:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
};
