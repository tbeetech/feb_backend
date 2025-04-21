const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://febluxury.com',
    'https://www.febluxury.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'Authorization'],
  credentials: true,
  maxAge: 86400 // CORS preflight cache for 24 hours
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle email receipt endpoint
app.use('/api/send-receipt-email', emailRoutes);
