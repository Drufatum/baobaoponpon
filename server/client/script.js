const socket = io(
    location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://baobaoponpon-1.onrender.com"
);
// 取得畫布與繪圖上下文
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const epsilon =0.00001
const rect = canvas.getBoundingClientRect();

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
//畫出sea-bow並更新座標(為防止一些神秘的bug，撞牆反彈是在這判斷)
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
function g(t){
  let chimeila=bowpow[t];
  let v=complexAbs([chimeila.vx,chimeila.vy]);
  if(chimeila.fk>=v){
    chimeila.vx=0;
    chimeila.vy=0;
  }
  else{
    chimeila.vx=chimeila.vx-chimeila.vx*chimeila.fk/v;
    chimeila.vy=chimeila.vy-chimeila.vy*chimeila.fk/v;
  }
  for(let i=0;i<t;i=i+1){
    
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
  fk:0.03,
  radius:30,
  c:"blue"
};
const bowbow={
  x:90,
  y:canvas.height*0.5,
  vx:0,
  vy:0,
  fk:0.01,
  radius:30,
  c:"red"
};
const bowpow=[powpow,bowbow];
let nowChimeilaId=0;
//喵~~
function meow(e){
  let z=[(e.clientX - rect.left),(e.clientY - rect.top)];
  const nowChimeila=bowpow[nowChimeilaId];
  
  nowChimeila.vx=(nowChimeila.x-z[0])/30;
  nowChimeila.vy=(nowChimeila.y-z[1])/30;
  let r=complexAbs([nowChimeila.vx,nowChimeila.vy]);
  if(r>100){
    nowChimeila.vx=100*nowChimeila.vx/r;
    nowChimeila.vy=100*nowChimeila.vy/r;

  }
  socket.emit("move", [nowChimeilaId,nowChimeila.vx,nowChimeila.vy]);
  canvas.removeEventListener("mousedown", choose);
  document.removeEventListener("mouseup", meow);
  pl[1]=1-pl[1];
  draw();
}
function choose(e){
  let z=[e.clientX - rect.left,e.clientY - rect.top];
  for(let i=0;i<2;i+=1){
    
    if(complexAbs(complexMinus(z,[bowpow[i].x,bowpow[i].y]))<bowpow[i].radius){
      nowChimeilaId=i;
      document.addEventListener("mouseup", meow);
      return;
    }
  }
  
}
function play(){
  if(pl[0]!=pl[1]){
    return;
  }
  canvas.addEventListener("mousedown", choose);
}
function draw() {
  // 清空畫面（否則會留下殘影）
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //更新速度
  
  g(0);
  g(1);
  // 畫出小球
  let bo=0;
  bo+=f(powpow);
  bo+=f(bowbow);
  if(bo!=0){
    requestAnimationFrame(draw);
  }
  else{
    play();
  }
}

// 啟動動畫
const pl=[0,0];
socket.on("私人訊息", (data) => {
  pl[0]=data;
  if(data==1){
    socket.emit("start",0);
    
  }
  
  draw();
  
});

socket.on("start", (data) => {
  if(myId[0]==data[0]){
    pl[0]=0;
    
  }
  else{
    
    pl[0]=1;
  }
  
  draw();
  
});
socket.on("move", (data) => {
  
  nowChimeilaId=data[0];
  const nowChimeila=bowpow[nowChimeilaId];
  nowChimeila.vx=data[1];
  nowChimeila.vy=data[2];
  canvas.removeEventListener("mousedown", choose);
  document.removeEventListener("mouseup", meow);
  pl[1]=1-pl[1];
  draw();
  
});