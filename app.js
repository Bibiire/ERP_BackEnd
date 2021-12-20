const express = require('express');
const connectDb = require('./config/db');
var cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// connect db
connectDb();

app.use(cors());

// init Middleware - body parser
app.use(express.json({extended: false}))
 
app.get('/', (req, res) => res.send('API Running'));

// Define Route 
app.use('/api/user', require('./routes/api/users') )
app.use('/api/auth', require('./routes/api/auth') )
app.use('/api/departments', require('./routes/api/departments') )
app.use('/api/requests', require('./routes/api/requisitions') )

app.listen(PORT, () => console.log(`Server Running At Port : ${PORT}`));
