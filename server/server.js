const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("client"));
const player={
  "num":0
};
io.on("connection", (socket) => {
  
  console.log("有玩家連線");
  
  socket.on("move", (data) => {
    socket.broadcast.emit("move", data);
  });
  socket.on("ok", (data) => {
    
    player[player["num"]]=socket.id;
    io.to(player[player["num"]]).emit("私人訊息", player["num"]);
    if(player["num"]==0){
      player["num"]+=1;
    }
  });
  socket.on("start",(data)=>{
    socket.broadcast.emit("start", data);
  });
  socket.on("disconnect", () => {
    for (const name in player) {
        if (player[name] === socket.id) {
            delete player[name];
            console.log(`玩家 ${name} 離線`);
            player["num"]-=1;
            break;
        }
    }
  });
});


server.listen(PORT, () => {
  console.log(`伺服器正在 ${PORT} 埠口運行`);
});