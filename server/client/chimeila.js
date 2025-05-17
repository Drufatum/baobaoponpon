let myName="";

let self="";
let opponent="";
let injuryTime=false;
let gameData={
  id:"",
  pl0:{},
  pl1:{},
  nowChimeila:null,
  winner:"",
  now:"pl0"
};
const commonBao={
  name:"common bao",
  teams:null,
  numberInTeams:NaN,
  x:NaN,
  y:NaN,
  vx:0,
  vy:0,
  m:100,
  fk:0.04,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{},
  relive:"self,but not self.who i am?it is a question.",
  death:false,
  birth:false,
  img:"./img/fly.png"
};
const bubbleBao={
  name:"bubble bao",
  teams:null,
  numberInTeams:NaN,
  x:NaN,
  y:NaN,
  vx:0,
  vy:0,
  m:100,
  fk:0.04,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{},
  relive:"self,but not self.who i am?it is a question.",
  death:false,
  birth:false,
  img:"./img/bubble.png"
};
const bronyaBao={
  name:"bronya bao",
  teams:null,
  numberInTeams:NaN,
  x:NaN,
  y:NaN,
  vx:0,
  vy:0,
  m:100,
  fk:0.04,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{},
  relive:"self,but not self.who i am?it is a question.",
  death:false,
  birth:false,
  img:"./img/fly.png"
};
const flyBao={
  name:"fly bao",
  teams:null,
  numberInTeams:NaN,
  x:NaN,
  y:NaN,
  vx:0,
  vy:0,
  m:100,
  fk:0.04,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{},
  relive:"self,but not self.who i am?it is a question.",
  death:false,
  birth:false,
  img:"./img/fly.png"
};



const exampleMap={
    width:888,
    height:555,
    numOfChimeila:3
    
};
const allChimeilas=[commonBao,bubbleBao,bronyaBao,flyBao];
function startPosition(chimeila,map=exampleMap){
    if(chimeila["teams"]=="pl0"){
        chimeila["x"]=-commonBao.radius;
        chimeila["y"]=map["height"]*(2*chimeila["numberInTeams"]+1)/(map["numOfChimeila"]*2);
        chimeila.vx=Math.sqrt(8*commonBao.radius*chimeila.fk);
        chimeila.birth=true;
    }
    else{
        chimeila["x"]=map["width"]+commonBao.radius;
        chimeila["y"]=map["height"]*(2*chimeila["numberInTeams"]+1)/(map["numOfChimeila"]*2);
        chimeila.vx=-Math.sqrt(8*commonBao.radius*chimeila.fk);
        chimeila.birth=true;
    }
}
function chimeilaInformation(chimeila){
  let information=document.createElement("div");
  information.classList.add("chimeila");
  let img=document.createElement("img");
  img.src=chimeila.img;
  img.classList.add("squareChimeila");
  if(chimeila.teams=="pl0"){
    img.style.left="40%";
  }
  information.appendChild(img);
  let tmp=document.createElement("div");
  tmp.textContent=chimeila.name;
  if(chimeila.teams=="pl0"){
    tmp.style.left="calc(40% + 1px)";
  }
  tmp.classList.add("name");
  information.appendChild(tmp);
  tmp=document.createElement("div");
  tmp.textContent=`hp:${chimeila.hp}\natk:${chimeila.atk}`;
  tmp.classList.add("hp");
  if(chimeila.teams=="pl0"){
    tmp.style.left="-1px";
  }
  information.appendChild(tmp);
  return information;
}
let graveyard=[];



//object-fit: cover; （可選 cover、contain、fill） overflow: hidden;


let exampleSb0={
  name:"toby",
  id:"",
  teams:"pl0",
  chimeilas:[bronyaBao,flyBao,bubbleBao],
}
let exampleSb1={
  name:"ems",
  id:"",
  teams:"pl1",
  chimeilas:[bronyaBao,flyBao,bubbleBao],
}
const exampleGame={
  id:"",
  pl0:{exampleSb0},
  pl1:{exampleSb1},
  nowChimeila:null,
  now:"pl0"
}