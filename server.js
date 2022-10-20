const express = require("express");
const helmet = require("helmet");
const port = 8080;
const app = express();

app.use(express.static(__dirname + "/public"));
app.use(helmet());

const socketio = require("socket.io");

const expressServer = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = socketio(expressServer, {
  cors: {
    origin: "*",
  },
});

module.exports = {
  app,
  io,
};
