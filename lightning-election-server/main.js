var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var lightning_elections = require("./lightningElections");
// var db = require("./db.js");

const broadcast = (err, to, msg) => {
  if (err) {
    return;
  }
  console.log(msg.subject);
  io.emit(`yo_${to}`, msg);
};

const handleRequests = envelope => {
  console.warn(envelope);
  if (!!envelope.subject) {
    if (envelope.subject.indexOf("Election") >= 0) {
      lightning_elections.handleRequests(envelope, broadcast);
    } else {
      switch (envelope.subject) {
        case "PING!":
          io.emit("messageChannel", "PONG!");
          break;
        default:
          break;
      }
    }
  }
};

const onConnection = socket => {
  socket.on("yo_election_server", handleRequests);
};

/**
 *
 * Server Starts here:
 */

io.on("connection", onConnection);

http.listen(3030, function() {
  console.log("listening on *:3030");
});

/**
 *
 * Message Protocol:
 *
 * subject: string,
 * payload: object.
 * from: string,
 *
 */
