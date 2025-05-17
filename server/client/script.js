const socket = io(
    location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://baobaoponpon-2.onrender.com"
);
// 取得畫布與繪圖上下文
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const epsilon =0.00001;





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
  if(chimeila.death===true){
    return 0;
  }
  chimeila.birth=false;
  if(chimeila.x-chimeila.radius<=0){
    
    chimeila.birth=true;
    if(chimeila.vx<0) chimeila.vx=-chimeila.vx;
  }
  if(chimeila.x+chimeila.radius>=canvas.width){
    
    chimeila.birth=true;
    if(chimeila.vx>0) chimeila.vx=-chimeila.vx;
  }
  if(chimeila.y-chimeila.radius<=0){
    
    chimeila.birth=true;
    if(chimeila.vy<0) chimeila.vy=-chimeila.vy;
  }
  if(chimeila.y+chimeila.radius>=canvas.height){
    
    chimeila.birth=true;
    if(chimeila.vy>0) chimeila.vy=-chimeila.vy;
  }
  chimeila.x+=chimeila.vx;
  chimeila.y+=chimeila.vy; 
  ctx.beginPath();
  ctx.arc(chimeila.x, chimeila.y, chimeila.radius, 0, Math.PI * 2);
  ctx.fillStyle = chimeila.teams=="pl0"?"blue":"red";
  ctx.fill();
  
  const img = new Image();
  img.src=chimeila.img;
  ctx.drawImage(img,chimeila.x-chimeila.radius,chimeila.y-chimeila.radius,2*chimeila.radius,2*chimeila.radius);
  ctx.closePath();
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";

  ctx.fillText(`${chimeila.hp}`, chimeila.x-chimeila.radius/2, chimeila.y+chimeila.radius+20);
  ctx.fillText(`${chimeila.atk}`, chimeila.x+chimeila.radius/2, chimeila.y+chimeila.radius+20);
  if(chimeila.vx==0&&chimeila.vy==0){
    
    return 0;
  }
  return 1;
}
//更新速度(為防止一些神秘的bug，撞牆反彈是在f判斷)
function g(chimeila){
  if(chimeila.death===true){
    return;
  }
  let v=complexAbs([chimeila.vx,chimeila.vy]);
  if(chimeila.fk>=v){
    chimeila.vx=0;
    chimeila.vy=0;
  }
  else{
    chimeila.vx=chimeila.vx-chimeila.vx*chimeila.fk/v;
    chimeila.vy=chimeila.vy-chimeila.vy*chimeila.fk/v;
  }
  //bowpow純歷史遺毒
  //這裡寫"pl0"，而非self，是為了讓雙方以完全相同的順序判斷，否則會出現細微誤差，然後蝴蝶效應崩崩崩
  let bowpow=gameData["pl0"]["chimeilas"];
  for(let i=0;i<bowpow.length;i=i+1){
    if(bowpow[i].death===true){
      continue;
    }
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
      pon(chimeila,bowpow[i]);
      let bowAns=complexAdd(complexAdd(re0,[bowpow[i].vx,bowpow[i].vy]),complexMinus([chimeila.vx,chimeila.vy],re1));
      
      bowAns=complexDivid(bowAns,[2,0]);
      let chiAns=complexAdd(complexAdd(re1,[chimeila.vx,chimeila.vy]),complexMinus([bowpow[i].vx,bowpow[i].vy],re0));
      chiAns=complexDivid(chiAns,[2,0]);
      if(chimeila.birth===true){
        bowAns[0]*=1.5;
        bowAns[1]*=1.5;
      }
      if(bowpow[i].birth===true){
        
        chiAns[0]*=1.5;
        chiAns[1]*=1.5;
      }
      if(bowpow[i].birth!==true){
        bowpow[i].vx=bowAns[0];
        bowpow[i].vy=bowAns[1];
      }
      if(chimeila.birth!==true){
        chimeila.vx=chiAns[0];
        chimeila.vy=chiAns[1];
      }
    }
  }
  //bowpow純歷史遺毒

  bowpow=gameData["pl1"]["chimeilas"];
  for(let i=0;i<bowpow.length;i=i+1){
    if(bowpow[i].death===true){
      continue;
    }
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
      pon(chimeila,bowpow[i]);
      let bowAns=complexAdd(complexAdd(re0,[bowpow[i].vx,bowpow[i].vy]),complexMinus([chimeila.vx,chimeila.vy],re1));
      
      bowAns=complexDivid(bowAns,[2,0]);
      let chiAns=complexAdd(complexAdd(re1,[chimeila.vx,chimeila.vy]),complexMinus([bowpow[i].vx,bowpow[i].vy],re0));
      chiAns=complexDivid(chiAns,[2,0]);
      if(chimeila.birth===true){
        bowAns[0]*=1.5;
        bowAns[1]*=1.5;
      }
      if(bowpow[i].birth===true){
        
        chiAns[0]*=1.5;
        chiAns[1]*=1.5;
      }
      if(bowpow[i].birth!==true){
        bowpow[i].vx=bowAns[0];
        bowpow[i].vy=bowAns[1];
      }
      if(chimeila.birth!==true){
        chimeila.vx=chiAns[0];
        chimeila.vy=chiAns[1];
      }
      
    }
  }
    
}
socket.on("initInformation",(data)=>{
  gameData=data;
  gameData["pl0"]["chimeilas"].forEach(elem => {
    let tmp=chimeilaInformation(elem);
    tmp.style.top=`${elem.numberInTeams*100/3}%`;
    tmp.style.left="0%";
    tmp.style.width="100%";
    document.getElementById("blueChimeilas").appendChild(tmp);
  });
  gameData["pl1"]["chimeilas"].forEach(elem => {
    let tmp=chimeilaInformation(elem);
    tmp.style.top=`${elem.numberInTeams*100/3}%`;
    tmp.style.left="0%";
    tmp.style.width="100%";
    document.getElementById("redChimeilas").appendChild(tmp);
  });
  
  requestAnimationFrame(draw);
})
socket.on("move", (data)=>{
  gameData=data;
  requestAnimationFrame(draw);
});
socket.on("play", (data)=>{
  gameData=data;
  play();
});
function play(){
  
  if(self!=gameData["now"]){
    document.getElementById("round").textContent="opponent";
    return;
  }
  canvas.addEventListener("mousedown", choose);
  canvas.addEventListener("touchstart", choose);
  
}
function choose(e){
  let rect=canvas.getBoundingClientRect();
  let z=[e.clientX - rect.left,e.clientY - rect.top];
  const chi=gameData[self]["chimeilas"];
  for(let i=0;i<chi.length;i+=1){
    
    if(chi[i].death!==true && complexAbs(complexMinus(z,[chi[i].x,chi[i].y]))<chi[i].radius){
      
      gameData["nowChimeila"]=chi[i];

      document.addEventListener("mouseup", meow);
      document.addEventListener("touchend", meow);
      return;
    }
  }
  
}
//喵~~
function meow(e){
  
  let rect=canvas.getBoundingClientRect();
  let z=[(e.clientX || e.changedTouches.clientX) - rect.left,(e.clientY || e.changedTouches.clientY) - rect.top] ;
  
  gameData["nowChimeila"].vx=(gameData["nowChimeila"].x-z[0])/30;
  gameData["nowChimeila"].vy=(gameData["nowChimeila"].y-z[1])/30;
  
  let r=complexAbs([gameData["nowChimeila"].vx,gameData["nowChimeila"].vy]);
  if(r>100){
    gameData["nowChimeila"].vx=100*gameData["nowChimeila"].vx/r;
    gameData["nowChimeila"].vy=100*gameData["nowChimeila"].vy/r;

  }
  

  socket.emit("move", gameData);
  canvas.removeEventListener("touchstart", choose);
  document.removeEventListener("mouseup", meow);
  canvas.removeEventListener("mousedown", choose);
  document.removeEventListener("touchend", meow);
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for(let i=0;i<gameData["pl0"]["chimeilas"].length;i+=1){
    
    g(gameData["pl0"]["chimeilas"][i]);
  }
  for(let i=0;i<gameData["pl1"]["chimeilas"].length;i+=1){
    g(gameData["pl1"]["chimeilas"][i]);
  }
  let bo=0;
  for(let i=0;i<gameData["pl0"]["chimeilas"].length;i+=1){
    bo+=f(gameData["pl0"]["chimeilas"][i]);
  }
  for(let i=0;i<gameData["pl1"]["chimeilas"].length;i+=1){
    bo+=f(gameData["pl1"]["chimeilas"][i]);
  }
  if(bo!=0){
    requestAnimationFrame(draw);
  }
  else{
    if(gameData.winner!==""){
      win();
      
      return;
    }
    injuryTime=false;
    //復活
    if(graveyard.length!=0){
      injuryTime=true;
      let elem=graveyard.shift();
      elem.x=elem.teams=="pl0"?-commonBao.radius:canvas.width+elem.radius;
      elem.y=canvas.height/gameData[elem.teams].chimeilas.length/2*(1+2*elem.numberInTeams);
      elem.vx=elem.teams=="pl0"?Math.sqrt(8*commonBao.radius*elem.fk):-Math.sqrt(8*commonBao.radius*elem.fk);
      elem.birth=true;
      gameData[elem.teams].chimeilas[elem.numberInTeams]=elem;
      requestAnimationFrame(draw);
    }
    else{
      gameData.now=(gameData.now=="pl0"?"pl1":"pl0");
    
      socket.emit("roundEnd",gameData);
    }
  }
}
function pon(toby,ems){
  if(injuryTime===true){
    return;
  }
  if(toby.teams==gameData.now){
    if(ems.teams!=gameData.now){
      ems.hp-=toby.atk;
    }
  }
  if(toby.teams!=gameData.now){
    if(ems.teams==gameData.now){
      toby.hp-=ems.atk;
    }
  }
  if(toby.hp<=0){
    die(toby);
  }
  if(ems.hp<=0){
    die(ems);
  }
}
function die(chimeila){
  let ghost={};
  for(let i in chimeila.relive){
    ghost[i]=chimeila.relive[i];
  }
  ghost["relive"]=chimeila.relive;
  ghost["teams"]=chimeila["teams"];
  ghost["numberInTeams"]=chimeila.numberInTeams;
  chimeila.death=true;
  publish(chimeila.teams);
  graveyard.push(ghost);
}
//輸入是死亡吸血鬼的teams
function publish(pl){
  let book=document.createElement("img");
  book.src="./img/book.jpg";
  book.classList.add("book");
  
  if(pl=="pl1"){
    gameData["pl0"].score+=1;
    book.style.top=`${20*(5-gameData["pl0"].score)}%`;
    document.getElementById("leftBookShelf").appendChild(book);
    if(gameData["pl0"].score==5 && gameData.winner===""){
      gameData.winner="pl0";
      injuryTime=true;
    }
  }
  if(pl=="pl0"){
    gameData["pl1"].score+=1;
    book.style.top=`${20*(5-gameData["pl1"].score)}%`;
    document.getElementById("rightBookShelf").appendChild(book);
    if(gameData["pl1"].score==5 && gameData.winner===""){
      gameData.winner="pl1";
      injuryTime=true;
    }
  }
  

}
function win(){
  if(gameData.winner==self){
    alert("win");
  }
  else{
    alert("lose");
  }
  document.getElementById("game").style.display="None";
  document.getElementById("menu").style.display="block";
  socket.emit("gameover",gameData);
}

//bug:合成，復活卡牆裡
//不講武德，隨時傷害判定
