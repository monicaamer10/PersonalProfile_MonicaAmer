const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/message');
const nodemailer = require('nodemailer');

// ============================================
// ENVIRONMENT CHECK
// ============================================
const isProduction = process.env.NODE_ENV === 'production';
console.log(`📡 API running in ${process.env.NODE_ENV || 'development'} mode`);

// ============================================
// FILE STORAGE SETUP
// ============================================
const dataDir = path.join(__dirname, '..', 'data');
const messagesFile = path.join(dataDir, 'messages.json');

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
    return JSON.parse(fs.readFileSync(messagesFile, 'utf8')) || [];
  } catch (error) {
    return [];
  }
}

function saveMessages(messages) {
  ensureMessagesFile();
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf8');
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

console.log(`💾 Database: ${isDatabaseReady() ? 'MongoDB' : 'File Storage'}`);

// ============================================
// GET: All messages (for admin)
// ============================================
router.get('/messages', async (req, res) => {
  try {
    if (isDatabaseReady()) {
      const messages = await Message.find().sort({ createdAt: -1 });
      return res.json({ messages, source: 'mongodb' });
    }

    const messages = loadMessages();
    return res.json({ messages, source: 'file' });
  } catch (error) {
    console.error('GET /messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DELETE: Remove a message by ID
// ============================================
router.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseReady()) {
      await Message.findByIdAndDelete(id);
    } else {
      const messages = loadMessages();
      const filteredMessages = messages.filter(msg => msg.id !== id);
      saveMessages(filteredMessages);
    }

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST: Save contact message
// ============================================
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Please fill in all fields.' });
    }

    const messageData = {
      name,
      email,
      message,
      createdAt: new Date(),
    };

    let savedMessage;

    if (isDatabaseReady()) {
      const newMessage = new Message(messageData);
      savedMessage = await newMessage.save();
    } else {
      const messages = loadMessages();
      messages.unshift({
        id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...messageData,
      });
      saveMessages(messages);
      savedMessage = messages[0];
    }

    // Send email notification (optional)
    try {
      await sendEmailNotification(name, email, message);
    } catch (emailError) {
      console.warn('Email notification failed:', emailError.message);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully!',
      data: savedMessage,
      source: isDatabaseReady() ? 'mongodb' : 'file'
    });
  } catch (error) {
    console.error('POST /contact error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EMAIL NOTIFICATION FUNCTION
// ============================================
async function sendEmailNotification(name, email, message) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured, skipping notification');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'amermonica1018@gmail.com',
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>📨 New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
        <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
      `,
    });

    console.log('✅ Email notification sent');
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

// ============================================
// GET: Profile data
// ============================================
router.get('/profile', (req, res) => {
  res.json({
    name: 'Monica R. Amer',
    age: 21,
    course: 'Bachelor of Science in Computer Science',
    university: 'DMMMSU – SLUC',
    yearLevel: '4th Year',
    location: 'San Benito Sur, Aringay, La Union',
    skills: [
      'HTML', 'CSS', 'JavaScript', 'Python', 'SQL',
      'Git', 'GitHub', 'MS Office', 'Communication', 'Teamwork'
    ],
    languages: ['English', 'Filipino', 'Iloco'],
    education: [
      {
        level: 'College',
        school: 'DMMMSU – SLUC',
        years: '2023 – Present',
        description: 'Bachelor of Science in Computer Science'
      },
      {
        level: 'Senior High School',
        school: 'Aringay National High School',
        years: '2021 – 2023',
        description: 'STEM Strand'
      },
      {
        level: 'Junior High School',
        school: 'Aringay National High School',
        years: '2017 – 2021'
      },
      {
        level: 'Elementary',
        school: 'Aringay Central Elementary School',
        years: '2011 – 2017'
      }
    ],
    experience: [
      {
        title: 'OJT Trainee',
        company: 'Mayor\'s Office, LGU Aringay',
        date: 'May 4 – June 16, 2026'
      },
      {
        title: 'SPES Trainee',
        company: 'Mayor\'s Office, LGU Aringay',
        date: 'May 30 – June 30, 2025'
      },
      {
        title: 'SPES Trainee',
        company: 'HRMO Office, LGU Aringay',
        date: 'June 3 – July 1, 2024'
      },
      {
        title: 'SPES Trainee',
        company: 'Mayor\'s Office, LGU Aringay',
        date: 'July 17 – August 17, 2023'
      },
      {
        title: 'OJT Trainee',
        company: 'MSWDO, LGU Aringay',
        date: 'April 17 – May 4, 2023'
      }
    ],
    certifications: [
      'JavaScript Essentials 1 - Cisco Networking Academy (2026)',
      'SPES 2025 - Municipality of Aringay',
      'SPES 2024 - Municipality of Aringay',
      'SPES 2023 - Municipality of Aringay',
      'OJT Certificate - MSWDO Aringay (2023)'
    ],
    techStack: [
      'HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Git', 'GitHub', 'Python'
    ]
  });
});

module.exports = router;