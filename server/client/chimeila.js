const commonBao={
  name:"common bao",
  teams:null,
  numberInTeams:NaN,
  x:NaN,
  y:NaN,
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
  debuff:{},
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
  fk:0.02,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{},
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
  fk:0.02,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{},
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
  fk:0.02,
  radius:30,
  c:"blue",
  hp:80,
  atk:15,
  specialAbility:{},
  buff:{},
  debuff:{},
  img:"./img/fly.png"
};

const exampleMap={
    width:800,
    height:600,
    numOfChimeila:3
    
};
const allChimeilas=[commonBao,bubbleBao,bronyaBao,flyBao];
function startPosition(chimeila,map=exampleMap){
    if(chimeila["teams"]=="pl0"){
        chimeila["x"]=90;
        chimeila["y"]=map["height"]*chimeila["numberInTeams"]/(map["numOfChimeila"]+1);
    }
    else{
        chimeila["x"]=map["width"]-90;
        chimeila["y"]=map["height"]-map["height"]*chimeila["numberInTeams"]/(map["numOfChimeila"]+1);
    }
}