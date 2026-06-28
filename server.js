const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8081;
const dataDir = path.join(__dirname, 'data');
const messagesFile = path.join(dataDir, 'messages.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.static(path.join(__dirname, '.')));

function ensureMessagesFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, '[]', 'utf8');
  }
}

function loadMessages() {
  ensureMessagesFile();
  try {
    return JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
  } catch (error) {
    return [];
  }
}

function saveMessages(messages) {
  ensureMessagesFile();
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf8');
}

app.get('/api/messages', (req, res) => {
  const messages = loadMessages();
  res.json({ messages });
});

app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const messages = loadMessages();
  const updated = messages.filter((message) => message.id !== id);

  if (updated.length === messages.length) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  saveMessages(updated);
  res.json({ success: true, message: 'Message deleted successfully.' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  const messageEntry = {
    id: Date.now().toString(),
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  };

  try {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: `"${name}" <${email}>`,
        to: process.env.CONTACT_RECIPIENT || 'amermonica1018@gmail.com',
        subject: `New message from ${name} via contact form`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, '<br/>')}</p>`,
      });
    } else {
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        await transporter.sendMail({
          from: `"${name}" <${email}>`,
          to: process.env.CONTACT_RECIPIENT || 'amermonica1018@gmail.com',
          subject: `New message from ${name} via contact form`,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, '<br/>')}</p>`,
        });
      } catch (smtpError) {
        console.warn('SMTP unavailable, saving message locally instead.', smtpError.message);
      }
    }

    const messages = loadMessages();
    messages.unshift(messageEntry);
    saveMessages(messages);

    return res.json({ success: true, message: 'Your message was sent successfully.' });
  } catch (error) {
    console.error('Contact API error:', error);
    const messages = loadMessages();
    messages.unshift(messageEntry);
    saveMessages(messages);
    return res.json({ success: true, message: 'Your message was saved successfully. We will follow up soon.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
