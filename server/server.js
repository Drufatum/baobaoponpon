const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("client"));
let rooms=[];
const exampleRoom={
  name:"",
  creatorId:"",
};
const exampleGame={
  id:"exampleId",
  pl1:"",
  pl2:"",

};
const games={
  exampleId:exampleGame
};

const theString="abcdefghijklmnopqrstuvwxyx0123456789abcdefghijklmnopqrstuvwxyz";
function randomId(len){
  const a=[];
  const s=theString;
  for(let i=0;i<len;i+=1){
    a.push(s[Math.floor(Math.random()*s.length)]);
  }
  return a.join("");
}
function clear(id){
  let n=0;
  let num=rooms.length;
  for(let i=0;i<num;i+=1){
    if(rooms[i]["creatorId"]==id){
      n+=1;
      continue;
    }
    rooms[i-n]=rooms[i];
    
  }
  rooms.splice(num-n);
  io.emit("catchI",rooms);
};

io.on("connection", (socket) => {
  
  console.log("有玩家連線");
  
  io.to(socket.id).emit("yourId",socket.id);
  io.to(socket.id).emit("catchI", rooms);
  
  
  socket.on("catchI",(data)=>{
    rooms=data;
    io.emit("catchI",data);
  });
  socket.on("createRoom",(data)=>{
    const room={
      name:data,
      creatorId:socket.id,
    }
    rooms.push(room);
    io.emit("catchI", rooms);
  });
  socket.on("clear",(data)=>clear(socket.id));
  socket.on("disconnect", () => clear(socket.id));
  socket.on("match",(data)=>{
    clear(socket.id);
    clear(data["creatorId"]);
    let gameId=randomId(9);
    let game={
      id:gameId,
      pl1:data["creatorId"],
      pl2:socket.id,
    };
    let another=io.sockets.sockets.get(data["creatorId"]);
    socket.join(gameId);
    another.join(gameId);
    socket.on("move", (data) => {
      io.to(gameId).emit("move", data);
    });
    another.on("move", (data) => {
      io.to(gameId).emit("move", data);
    });
    let roundCheck=0;
    socket.on("roundEnd", (data) => {
      if(roundCheck==0){
        roundCheck=1;
      }
      else{
        if(data["now"]=="pl0"){
          data["now"]="pl1";
        }
        else{
          data["now"]="pl0";
        }
        io.to(gameId).emit("play", data);
        roundCheck=0;
      }
      
    });
    another.on("roundEnd", (data) => {
      if(roundCheck==0){
        roundCheck=1;
      }
      else{
        if(data["now"]=="pl0"){
          data["now"]="pl1";
        }
        else{
          data["now"]="pl0";
        }
        io.to(gameId).emit("play", data);
        roundCheck=0;
      }
    });
    let readyCheck=0;
    socket.on("ready", (data) => {
      if(readyCheck==0){
        readyCheck=1;
      }
      else{
        io.to(gameId).emit("move", data);
        readyCheck=0;
      }
      
    });
    another.on("ready", (data) => {
      if(readyCheck==0){
        readyCheck=1;
      }
      else{
        
        io.to(gameId).emit("move", data);
        readyCheck=0;
      }
    });
    games[gameId]=game;
    io.to(gameId).emit("gameStart",[data["creatorId"],socket.id]);
    
  });
  

});


server.listen(PORT, () => {
  console.log(`伺服器正在 ${PORT} 埠口運行`);
});
//cd desktop/baobaoponpon/baobaoponpon/server/&& node server.js