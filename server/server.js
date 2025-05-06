const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("client"));
let rooms=[];
let num=[0];
const exampleRoom={
  name:"",
  creatorId:"",
}

io.on("connection", (socket) => {
  
  console.log("有玩家連線");
  
  io.to(socket.id).emit("yourId",socket.id);
  io.to(socket.id).emit("catchI", rooms,num[0]);
  
  
  socket.on("catchI",(data,n)=>{
    rooms=data;
    num[0]=n;
    io.emit("catchI",data,num[0]);
  });
  socket.on("createRoom",(data)=>{
    const room={
      name:data,
      creatorId:socket.id,
    }
    num[0]+=1;
    rooms.push(room);
    io.emit("catchI", rooms,num[0]);
  });
  socket.on("clear",(data)=>{
    let n=0;
    for(let i=0;i<num[0];i+=1){
      if(rooms[i]["creatorId"]==socket.id){
        n+=1;
        continue;
      }
      rooms[i-n]=rooms[i];
      
    }
    num[0]-=n;
    rooms.splice(num[0]);
    io.emit("catchI",rooms,num[0]);
  });
  socket.on("disconnect", () => {
    let n=0;
    for(let i=0;i<num[0];i+=1){
      if(rooms[i]["creatorId"]==socket.id){
        n+=1;
        continue;
      }
      rooms[i-n]=rooms[i];
      
    }
    num[0]-=n;
    rooms.splice(num[0]);
    io.emit("catchI",rooms,num[0]);
  });

  //下面這坨欠改
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
  

});


server.listen(PORT, () => {
  console.log(`伺服器正在 ${PORT} 埠口運行`);
});
//cd desktop/baobaoponpon/baobaoponpon/server/&& node server.js