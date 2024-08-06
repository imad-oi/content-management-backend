const express = require('express');
const connectDB = require('./config/database');


/* Routes */
const textRoutes = require('./routes/textRoutes');
const crawlerRoutes = require('./routes/crawlerRoutes');
/* end of routes  */


require('dotenv').config();

const app = express();
connectDB();

app.use(express.json());

// use text routes
app.use('/api/text', textRoutes)

// use crawler routes
app.use('/api/', crawlerRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));