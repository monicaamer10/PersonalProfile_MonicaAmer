const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');

// GET: All messages (for admin)
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Save contact message
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Save to database
    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    // Send email notification (optional)
    // await sendEmail(name, email, message);

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully!',
      data: newMessage 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Profile data
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
    ]
  });
});

module.exports = router;