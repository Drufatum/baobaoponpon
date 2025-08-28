const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static("newClient"));
io.on("connection", (socket) => {
    io.to(socket.id).emit("hi",socket.id);
})

server.listen(PORT, () => {
  console.log(`伺服器正在 ${PORT} 埠口運行`);
});
//cd desktop/baobaoponpon/baobaoponpon/server/&& node newServer.js