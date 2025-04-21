const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://febluxury.com',
    'https://www.febluxury.com',
    'https://www.febluxury.com/api/send-receipt-email',
    'https://febluxury.com/api/send-receipt-email'

  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400 // CORS preflight cache for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Specific handling for the email receipt endpoint
app.options('/api/send-receipt-email', cors(corsOptions)); // Handle preflight for specific route
app.post('/api/send-receipt-email', cors(corsOptions), async (req, res) => {
  // Your existing email receipt handling code
  // ...
});
