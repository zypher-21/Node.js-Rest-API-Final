require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConnection');
const PORT = process.env.PORT || 3000;

// connect DB
connectDB();

// Custom Middleware Logger
app.use(logger);

// CORS
app.use(cors(corsOptions));

// Cookie Parser
app.use(cookieParser());

// Built-in Middleware for express.js
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Built-in Middleware for json
app.use(express.json());

// Serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

// Routes
app.use("/", require("./routes/root"));
app.use('/states', require('./routes/api/states'));

// 404 Route for un-defined
app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
      res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
      res.json({ error: "404 Not Found" });
    } else {
      res.type("txt").send("404 Not Found");
    }
  });

  // Error logger
  app.use(errorHandler);

mongoose.connection.once("open", () => {
    console.log("Connected to mongoDB");
    app.listen(PORT, () => console.log(`Server is listing on port ${PORT}`));
  });