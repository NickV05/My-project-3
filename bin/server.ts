import app from "../dist/app.js";
import http from "http";
import debugLib from "debug";

const debug = debugLib("server:server");
require("dotenv").config();

function normalizePort(val: string): number | string | false {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val; 
  if (port >= 0) return port; 
  return false;
}


const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);


const server = http.createServer(app);


server.listen(port, (err?: NodeJS.ErrnoException) => {
  if (err) {
    console.error("Error in server setup:", err);
    process.exit(1);
  }
  console.log(`Server listening on port ${port}`);
});


server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") throw error;

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
  debug(`Listening on ${bind}`);
});