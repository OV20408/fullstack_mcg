require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const path = require('path');

const app = express();

// Middlewares básicos de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        ],
        styleSrcElem: [ // Específico para elementos <style> y <link>
          "'self'",
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        ],
        fontSrc: [
          "'self'",
          "data:",
          "https://cdnjs.cloudflare.com" // Para los iconos de Font Awesome
        ],
        imgSrc: ["'self'", "data:", "https:"],
        frameSrc: [
          "https://www.google.com",
          "https://maps.google.com",
          "https://google.com"
        ],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        // ... otras directivas
      }
  }
})); // Headers básicos de seguridad
app.use(express.json({ limit: '1mb' }));

const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://127.0.0.1:5500'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'], // Solo POST para este endpoint
  credentials: false
}));

// Limite de solicitudes
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // Máximo 3 mensajes por IP
  message: {
    success: false,
    error: "Demasiados mensajes enviados. Intenta de nuevo mas tarde."
  },
  standardHeaders: true
});

// Validaciones esenciales para formulario de contacto
const contactValidation = [
  body('nombreCompleto')
    .notEmpty()
    .withMessage('El nombre completo es requerido')
    .isLength({ max: 100 })
    .withMessage('El nombre completo es muy largo')
    .trim(),
    
  body('correoElectronico')
    .isEmail()
    .withMessage('Correo electrónico inválido')
    .normalizeEmail(),
    
  body('telefono')
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .isMobilePhone('any')
    .withMessage('Teléfono inválido'),
    
  body('asunto')
    .notEmpty()
    .withMessage('El asunto es requerido')
    .isLength({ max: 150 })
    .withMessage('El asunto es muy largo')
    .trim(),
    
  body('mensaje')
    .notEmpty()
    .withMessage('El mensaje es requerido')
    .isLength({ min: 0, max: 1000 })
    .withMessage('El mensaje debe tener entre 10 y 1000 caracteres')
    .trim()
];

// Función simple para detectar spam básico
function isSpam(text) {
  const spamPatterns = [
    /\b(viagra|casino|lottery|winner|congratulations)\b/i,
    /(bcc:|cc:|to:)/i, // Headers de email
    /<script|javascript:|onclick/i, // Código malicioso básico
    /http.*http.*http/i, // Múltiples URLs (típico de spam)
    /(.)\1{10,}/i // Caracteres repetidos excesivamente
  ];
  
  return spamPatterns.some(pattern => pattern.test(text));
}

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});


// Endpoint principal
app.post('/send-email', contactLimiter, contactValidation, async (req, res) => {
  try {

    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Por favor revisa los datos ingresados',
        details: errors.array().map(err => err.msg)
      });
    }

    const { nombreCompleto, correoElectronico, telefono, asunto, mensaje } = req.body;

    // Verificación básica de spam
    if (isSpam(`${asunto} ${mensaje} ${nombreCompleto}`)) {
      console.warn(`Posible spam detectado desde IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        error: 'Mensaje no pudo ser enviado. Contacta directamente si es urgente.'
      });
    }

    // Configurar nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    // Formato del email que se recibira
    const emailContent = `
    CONSULTA DE SERVICIO 

    Datos del contacto:
    ━━━━━━━━━━━━━━━━━━━━━
    👤 Nombre Completo: ${nombreCompleto}
    📧 Correo Electrónico: ${correoElectronico}
    📱 Teléfono: ${telefono}

    Asunto: ${asunto}

    Mensaje:
    ${mensaje}

    ━━━━━━━━━━━━━━━━━━━━━
📅 Recibido: ${new Date().toLocaleString('es-ES', { timeZone: 'America/La_Paz' })}
    `.trim();

    await transporter.sendMail({
      from: `${nombreCompleto} <alaschiquitanasuni@gmail.com>`,
      to: process.env.COMPANY_EMAIL, // Email donde quiere recibir los mensajes
      subject: `[CONTACTO WEB] ${asunto}`,
      text: emailContent,
      replyTo: correoElectronico,
    });

    // Log del evento
    console.log(`Mensaje enviado de ${correoElectronico} el ${new Date().toISOString()}`);

    res.json({ 
      success: true, 
      message: "¡Mensaje enviado correctamente! Te contactaremos pronto." 
    });

  } catch (error) {
    console.error('Error enviando email:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error enviando el mensaje. Intenta de nuevo o contacta directamente.'
    });
  }
});

const frontendPath = path.join(__dirname, '../../mgc');
app.use(express.static(frontendPath));


// CATCH-ALL ROUTE - Al final de todo (ARREGLADO)
app.get(/.*/, (req, res, next) => {
  // Si es una petición de archivo estático, pasar al siguiente middleware
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  
  console.log(`📄 Serving index.html for HTML route: ${req.method} ${req.path}`);
  
  const indexPath = path.join(__dirname, '../../mgc/index.html');
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }
  });
});



// Error handler - debe ir al final
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de contacto ejecutándose en puerto ${PORT}`);
  console.log(`📧 Emails se enviarán a: ${process.env.COMPANY_EMAIL}`);
  console.log(`🌐 Orígenes permitidos: ${allowedOrigins.join(', ')}`);
});