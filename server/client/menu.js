let myId="";
//catchI是捉i的意思
function catchI(data){
    document.querySelectorAll(".room").forEach(elem=>{
        document.getElementById("room").removeChild(elem);
    });
    for(let i=0;i<data.length;i+=1){
        if(data[i]["creatorId"]==myId){
            const cancel=document.createElement("button");
            document.getElementById("room").appendChild(cancel);
            cancel.textContent="cancel";
            cancel.classList.add("room");
            cancel.addEventListener("click",()=>{
                for(let j=i;j<data.length-1;j++){
                    for(let k in data[j]){
                        data[j][k]=data[j+1][k];
                    }
                }
                data.pop();
                socket.emit("catchI",data);
            });
        }
        else{
            const button=document.createElement("button");
            document.getElementById("room").appendChild(button);
            button.textContent=data[i]["name"];
            button.classList.add("room");
            button.addEventListener("click",()=>{
                socket.emit("match",data[i]);
            });
        }
    }
};
//可莉
function clear(){
    socket.emit("clear","bomb");
}
document.getElementById("createRoom").addEventListener("click",()=>{
    let name="genshin";
    socket.emit("createRoom",name);
});
document.getElementById("clear").addEventListener("click",clear);
socket.on("yourId",(data)=>{
    myId=data;
});
socket.on("catchI",catchI);
socket.on("gameStart",(data)=>{

  if(data[0]==myId){
    self="pl1";
    opponent="pl0";
  }
  if(data[0]!=myId){
    document.body.style.backgroundColor="rgba(248, 145, 145, 0.85)";
    
  }
  else{
    document.body.style.backgroundColor="rgba(154, 212, 249, 0.85)";
    
  }
  document.querySelectorAll(".select").forEach(elem=>{
    elem.style.display="block";
  });
  document.querySelectorAll(".menu").forEach(elem=>{
    elem.style.display="None";
  });
  const final=new Set();
  let submit=document.createElement("button");
  submit.textContent="sure";
  submit.id="submit";
  submit.addEventListener("click",()=>{
    socket.emit("ready",gameData);
    
    document.querySelectorAll(".game").forEach(elem=>{
        elem.style.display="block";
    });
    document.querySelectorAll(".select").forEach(elem=>{
        elem.style.display="None";
    });
    
  })
  submit.style.display="None";
  allChimeilas.forEach(elem=>{
    const button=document.createElement("button");
    button.textContent=elem["name"];
    
    button.addEventListener("click",()=>{
        if(final.has(elem)){
            final.delete(elem);
            button.style.color="black";
            submit.style.display="None";
            document.getElementById(select).removeChild(document.getElementById("submit"));
        }
        else{
            if(final.size<3){
                final.add(elem);
                button.style.color="red";
                if(final.size==3){
                    submit.style.display="block";
                    

                }
            }
        }
    });
    document.getElementById("select").appendChild(button);
  
  })
  document.getElementById("select").appendChild(submit);
  
  
  
  
});
/*
目前缺匹配成功到對局中間的轉場，預期效果如下(總經原還在追我!?)
以上面那個socket.on開始，data內為[creatorId,playerId](可以自己去server.js改掉，這我測試用的而已)
選海豹、決定先後手，伺服器端應判斷兩人是否皆準備完成(我淺判過了)
伺服器端emit("move",gameData)
let gameData={
  id:"",
  pl0:toby,
  pl1:ems,
  nowChimeila:null,
  now:"pl0"
}
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
*/