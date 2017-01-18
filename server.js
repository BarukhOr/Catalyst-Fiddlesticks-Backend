/**
 * Created by utibe on 1/13/17.
 */
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const router = require("./routes/index.js");
const cors = require("cors");

// App Setup
app.use(cors());
app.use(morgan("combined")); //'combined' outputs the Apache style logs
app.use(bodyParser.json({type: "*/*"}));
router(app);

// Server Setup
const port = process.env.PORT || 7000;
const server = http.createServer(app);
server.listen(port);
console.log("Magic is happening on port", port);

module.exports = server;
