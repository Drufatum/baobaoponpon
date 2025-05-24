let myName="";
let fallWidth=200;
let self="";
let opponent="";
let injuryTime=false;
let gameData={
  id:"",
  pl0:{},
  pl1:{},
  nowChimeila:null,
  winner:"",
  now:"pl0",
  extra:[],
  nowExtra:null

};
const socket = io(
    location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://baobaoponpon-si87.onrender.com"
);
// 取得畫布與繪圖上下文
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const epsilon =0.00001;

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
  special:"commonJpg",
  inExtraStack:false,
  buff:{},
  debuff:{},
  relive:"self,but not self.who i am?it is a question.",
  death:false,
  birth:false,
  cd:false,
  information:null,
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
  atk:1500,
  special:"seele",
  inExtraStack:false,
  buff:{},
  debuff:{},
  relive:"self,but not self.who i am?it is a question.",
  death:false,
  birth:false,
  cd:false,
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

  special:"pullStrip",
  abilityCd:false,

  inExtraStack:false,

  buff:{},
  debuff:{},
  relive:"self,but not self.who i am?it is a question.",
  death:false,
  birth:false,
  cd:false,
  img:"./img/bronya.png"
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
  buff:{},
  debuff:{},
  special:"fly",
  inExtraStack:false,
  relive:"self,but not self.who i am?it is a question.",
  death:false,
  birth:false,
  cd:false,
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
let leftChi=[{},{},{}];
let rightChi=[{},{},{}];
let graveyard=[];
function giveExtraRound(chimeila){
  let tmp={
    teams:chimeila.teams,
    numberInTeams:chimeila.numberInTeams
  }
  gameData.extra.push(tmp);
  chimeila.inExtraStack=true;
}
function commonJpg(common,another){
  
}
function pullStrip(bronya,another){
  if(gameData.nowExtra!==null){
    return 0;
  }
  if(bronya===gameData.nowChimeila){
    //alert("bronya will no longer use bronya to express misaka misaka");
    if(bronya.abilityCd==true){
      return 0;
    }
    bronya.abilityCd=true;
    if(bronya.teams!=another.teams){
      return 0;
    }
    giveExtraRound(another);
    return 1;
  }
}
function seele(seele,another){
  if(another.death==true && another.teams!=seele.teams){
    giveExtraRound(seele);
    return 1;
  }
  return 0;
}
function fly(fly,another){

}
let specialAbility={
  commonJpg:commonJpg,
  pullStrip:pullStrip,
  seele:seele,
  fly:fly
}
let specialParameter={
  commonJpg:{
    
  },
  pullStrip:{
    abilityCd:false
  },
  seele:{
    
  },
  fly:{
    
  }
}
let imgMap={};
allChimeilas.forEach(elem=>{
  let img = new Image();
  img.src=elem.img;
  imgMap[elem.img]=img;
  
})
let otherImgs=["./img/redFall.jpg","./img/blueFall.jpg","./img/purpleFall.jpg"];
otherImgs.forEach(elem=>{
  let img = new Image();
  img.src=elem;
  imgMap[elem]=img;
})
function renew(chimeila){
  for(let i in specialParameter[chimeila.special]){
    chimeila[i]=specialParameter[chimeila.special][i];
  }
}

/*
let a={
  b:{
    c:"woc"
  }
}
let p={};
for(let i in a){
  p[i]=a[i];
}
p["b"].c="genshin";
alert(a["b"].c);*/

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
