const socket = io(
    location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://baobaoponpon-2.onrender.com"
);
// 取得畫布與繪圖上下文
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const epsilon =0.00001;
let self="pl0";
let opponent="pl1";
const exampleSb={
  name:"",
  id:"",
  teams:0,
  chimeilas:[],
}
const exampleChimeila={
  name:"",
  teams:0,
  x:canvas.width-90,
  y:canvas.height*0.5,
  vx:0,
  vy:0,
  m:100,
  fk:0.02,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{}
}
let tobyChimeila={
  name:"",
  teams:"pl0",
  x:90,
  y:canvas.height*0.5,
  vx:0,
  vy:0,
  m:100,
  fk:0.02,
  radius:30,
  c:"red",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{}
}
let emsChimeila={
  name:"",
  teams:"pl1",
  x:canvas.width-90,
  y:canvas.height*0.5,
  vx:0,
  vy:0,
  m:100,
  fk:0.02,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{}
}
let toby={
  name:"toby",
  id:"",
  teams:"pl0",
  chimeilas:[tobyChimeila]
}
let ems={
  name:"ems",
  id:"",
  teams:"pl1",
  chimeilas:[emsChimeila]
}
let gameData={
  id:"",
  pl0:toby,
  pl1:ems,
  nowChimeila:null,
  now:"pl0"

};

function complexAbs(z){
  return Math.sqrt(z[0]*z[0]+z[1]*z[1]);
}
function complexAdd(z1,z2){
  return [z1[0]+z2[0],z1[1]+z2[1]];
}
function complexMinus(z1,z2){
  return [z1[0]-z2[0],z1[1]-z2[1]];
}
function complexCross(z1,z2){
  let x=z1[0];
  let y=z1[1];
  let u=z2[0];
  let v=z2[1];
  return [x*u-y*v,x*v+y*u];
}
function complexDivid(z1,z2){
  let x=z1[0];
  let y=z1[1];
  let u=z2[0];
  let v=z2[1];
  let ans=complexCross(z1,[u,-v]);
  ans[0]/=(u*u+v*v);
  ans[1]/=(u*u+v*v);
  return ans;
}
function reflect(z1,z2){
  if(z1[0]==0&&z1[1]==0){
    return [0,0];
  }
  return complexCross(complexCross(complexDivid(z2,z1),z2),[(complexAbs(z1)/complexAbs(z2))*(complexAbs(z1)/complexAbs(z2)),0]);
}
//畫出sea-bao並更新座標(為防止一些神秘的bug，撞牆反彈是在這判斷)
function f(chimeila){
  if(chimeila.x-chimeila.radius<=0){
    chimeila.x=chimeila.radius+epsilon;
    if(chimeila.vx<0) chimeila.vx=-chimeila.vx;
  }
  if(chimeila.x+chimeila.radius>=canvas.width){
    chimeila.x=canvas.width-chimeila.radius-epsilon;
    if(chimeila.vx>0) chimeila.vx=-chimeila.vx;
  }
  if(chimeila.y-chimeila.radius<=0){
    chimeila.y=chimeila.radius+epsilon;
    if(chimeila.vy<0) chimeila.vy=-chimeila.vy;
  }
  if(chimeila.y+chimeila.radius>=canvas.height){
    chimeila.y=canvas.height-chimeila.radius-epsilon;
    if(chimeila.vy>0) chimeila.vy=-chimeila.vy;
  }
  chimeila.x+=chimeila.vx;
  chimeila.y+=chimeila.vy; 
  ctx.beginPath();
  ctx.arc(chimeila.x, chimeila.y, 0.95*chimeila.radius, 0, Math.PI * 2);
  ctx.fillStyle = chimeila.c;
  ctx.fill();
  ctx.closePath();
  if(chimeila.vx==0&&chimeila.vy==0){
    return 0;
  }
  return 1;
}
//更新速度(為防止一些神秘的bug，撞牆反彈是在f判斷)
function g(chimeila){
  let v=complexAbs([chimeila.vx,chimeila.vy]);
  if(chimeila.fk>=v){
    chimeila.vx=0;
    chimeila.vy=0;
  }
  else{
    chimeila.vx=chimeila.vx-chimeila.vx*chimeila.fk/v;
    chimeila.vy=chimeila.vy-chimeila.vy*chimeila.fk/v;
  }
  let bowpow=gameData[self]["chimeilas"];
  for(let i=0;i<bowpow.length;i=i+1){
    if(bowpow[i]===chimeila){
      continue;
    }
    let d=[bowpow[i].x-chimeila.x,bowpow[i].y-chimeila.y];
    if(complexAbs(d)<chimeila.radius+bowpow[i].radius){
      
      let re0=reflect([bowpow[i].vx,bowpow[i].vy],complexCross(d,[0,1]));//從零開始的異世界生活
      let re1=reflect([chimeila.vx,chimeila.vy],complexCross(d,[0,1]));//從壹開始的異世界生活
      let tmp=complexMinus(complexAdd(d,complexMinus([bowpow[i].vx,bowpow[i].vy],re0)),complexMinus([chimeila.vx,chimeila.vy],re1));
      let tmp1=complexMinus(complexAdd(d,complexMinus([chimeila.vx,chimeila.vy],re1)),complexMinus([bowpow[i].vx,bowpow[i].vy],re0));
      if(complexAbs(tmp)>complexAbs(tmp1)){
        continue;
      }
      let bowAns=complexAdd(complexAdd(re0,[bowpow[i].vx,bowpow[i].vy]),complexMinus([chimeila.vx,chimeila.vy],re1));
      
      bowAns=complexDivid(bowAns,[2,0]);
      let chiAns=complexAdd(complexAdd(re1,[chimeila.vx,chimeila.vy]),complexMinus([bowpow[i].vx,bowpow[i].vy],re0));
      chiAns=complexDivid(chiAns,[2,0]);
      
      bowpow[i].vx=bowAns[0];
      bowpow[i].vy=bowAns[1];
      chimeila.vx=chiAns[0];
      chimeila.vy=chiAns[1];
      
    }
  }
  bowpow=gameData[opponent]["chimeilas"];
  for(let i=0;i<bowpow.length;i=i+1){
    if(bowpow[i]===chimeila){
      continue;
    }
    let d=[bowpow[i].x-chimeila.x,bowpow[i].y-chimeila.y];
    if(complexAbs(d)<chimeila.radius+bowpow[i].radius){
      
      let re0=reflect([bowpow[i].vx,bowpow[i].vy],complexCross(d,[0,1]));//從零開始的異世界生活
      let re1=reflect([chimeila.vx,chimeila.vy],complexCross(d,[0,1]));//從壹開始的異世界生活
      let tmp=complexMinus(complexAdd(d,complexMinus([bowpow[i].vx,bowpow[i].vy],re0)),complexMinus([chimeila.vx,chimeila.vy],re1));
      let tmp1=complexMinus(complexAdd(d,complexMinus([chimeila.vx,chimeila.vy],re1)),complexMinus([bowpow[i].vx,bowpow[i].vy],re0));
      if(complexAbs(tmp)>complexAbs(tmp1)){
        continue;
      }
      let bowAns=complexAdd(complexAdd(re0,[bowpow[i].vx,bowpow[i].vy]),complexMinus([chimeila.vx,chimeila.vy],re1));
      
      bowAns=complexDivid(bowAns,[2,0]);
      let chiAns=complexAdd(complexAdd(re1,[chimeila.vx,chimeila.vy]),complexMinus([bowpow[i].vx,bowpow[i].vy],re0));
      chiAns=complexDivid(chiAns,[2,0]);
      
      bowpow[i].vx=bowAns[0];
      bowpow[i].vy=bowAns[1];
      chimeila.vx=chiAns[0];
      chimeila.vy=chiAns[1];
      
    }
  }
    
}
//泡泡!我的泡泡!
//我真會寫註解(得意
const powpow={
  x:canvas.width-90,
  y:canvas.height*0.5,
  vx:0,
  vy:0,
  fk:0.02,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  team:1
};
const bowbow={
  x:90,
  y:canvas.height*0.5,
  vx:0,
  vy:0,
  fk:0.02,
  radius:30,
  c:"red",
  hp:80,
  atk:15,
  team:0
};

socket.on("move", (data)=>{
  gameData=data;
  draw();
});
socket.on("play", (data)=>{
  gameData=data;
  play();
});
function play(){
  
  if(self!=gameData["now"]){
    return;
  }
  canvas.addEventListener("mousedown", choose);
}
function choose(e){
  let rect=canvas.getBoundingClientRect();
  let z=[e.clientX - rect.left,e.clientY - rect.top];
  
  const chi=gameData[self]["chimeilas"];
  for(let i=0;i<chi.length;i+=1){
    
    if(complexAbs(complexMinus(z,[chi[i].x,chi[i].y]))<chi[i].radius){
      
      gameData["nowChimeila"]=chi[i];

      document.addEventListener("mouseup", meow);
      return;
    }
  }
  
}
//喵~~
function meow(e){
  
  let rect=canvas.getBoundingClientRect();
  let z=[e.clientX - rect.left,e.clientY - rect.top];
  
  gameData["nowChimeila"].vx=(gameData["nowChimeila"].x-z[0])/30;
  gameData["nowChimeila"].vy=(gameData["nowChimeila"].y-z[1])/30;
  
  let r=complexAbs([gameData["nowChimeila"].vx,gameData["nowChimeila"].vy]);
  if(r>100){
    gameData["nowChimeila"].vx=100*gameData["nowChimeila"].vx/r;
    gameData["nowChimeila"].vy=100*gameData["nowChimeila"].vy/r;

  }
  

  socket.emit("move", gameData);
  canvas.removeEventListener("mousedown", choose);
  document.removeEventListener("mouseup", meow);
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for(let i=0;i<gameData[self]["chimeilas"].length;i+=1){
    g(gameData[self]["chimeilas"][i]);
  }
  for(let i=0;i<gameData[opponent]["chimeilas"].length;i+=1){
    g(gameData[opponent]["chimeilas"][i]);
  }
  let bo=0;
  for(let i=0;i<gameData[self]["chimeilas"].length;i+=1){
    bo+=f(gameData[self]["chimeilas"][i]);
  }
  for(let i=0;i<gameData[opponent]["chimeilas"].length;i+=1){
    bo+=f(gameData[opponent]["chimeilas"][i]);
  }
  if(bo!=0){
    requestAnimationFrame(draw);
  }
  else{
    socket.emit("roundEnd",gameData);
  }
}

