let myId="";
let rickRoll=0;
let rickRollBo=false;
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
                rickRoll-=1;
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
    rickRoll=0;
    socket.emit("clear","bomb");
}
function qlipoth(){
    rickRoll+=1;
    let name="genshin";
    if(rickRoll>=10){
      document.getElementById("createRoom").removeEventListener("click",qlipoth);
      document.getElementById("createRoom").addEventListener("click",()=>{
        window.location.href = "https://youtu.be/ALiLGgn3YGM?si=5uvtB98-tdwFNkA7";
      })
      document.getElementById("createRoom").textContent="don't click me!!!";
      
      
    }
    socket.emit("createRoom",name);
}
document.getElementById("createRoom").addEventListener("click",qlipoth);
document.getElementById("clear").addEventListener("click",clear);
socket.on("yourId",(data)=>{
    myId=data;
});
socket.on("catchI",catchI);
socket.on("gameStart",(data)=>{
  rickRoll=0;
  if(data["pl1"]["id"]==myId){
    self="pl1";
    opponent="pl0";
    document.getElementById("game").style.backgroundColor="rgba(248, 145, 145, 0.85)";
    
  }
  else{
    self="pl0";
    opponent="pl1";
    document.getElementById("game").style.backgroundColor="rgba(154, 212, 249, 0.85)";
    
  }
  document.getElementById("menu").style.display="None";
  document.getElementById("select").style.display="block";
  const final=new Set();
  let submit=document.createElement("button");
  submit.textContent="sure";
  submit.id="submit";
  submit.addEventListener("click",()=>{
    let chimeilas=Array.from(final);
    let ans=[];
    let t=0;
    chimeilas.forEach(elem=>{
      t+=1;
      let tmp={};
      for(i in elem){
        tmp[i]=elem[i];
      }
      tmp["relive"]=elem;
      tmp["teams"]=self;
      tmp["numberInTeams"]=t-1;
      startPosition(tmp);
      ans.push(tmp);
      
    })
    data[self]["chimeilas"]=ans;
    
    document.getElementById("select").childNodes.forEach(elem=>{
        document.getElementById("select").removeChild(elem);
    });
    document.getElementById("select").style.display="None";
    document.getElementById("game").style.display="block";

    socket.emit("ready",data[self]);
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
    button.style.display="block";
    document.getElementById("select").appendChild(button);
    
  })
  document.getElementById("select").appendChild(submit);
  
  
  
  
});

/*
值得一提的bug

1.碰撞反彈：原本寫的反彈邏輯是，當兩個圓有交點時，交換正向速度，
但如果兩個球沒在一幀內分開（觸發條件為其中一顆球在這一幀內發生兩次碰撞，這導致原本該分離的兩球並未如期分離），
會導致兩球再交換一次正向速度，進而兩顆球融合在一起（舉例來說A{x:-1 r:1 v:-1}和B(x:1 r:1 v:1)被視作發生碰撞，並交換了v，而這反而使兩球更接近）
修正：兩圓相交且正向速度為追撞或相撞才視作發生碰撞

2.第一幀畫面會出問題：如果是畫一張圖的話，canvas似乎會“來不及畫”，這問題用requestAnimationFrame就可解決，我沒搞懂的是在沒用requestAnimationFrame時到底發生了什麼事
簡化一下狀況，我在canvas中依序畫了AaBb，其中AB是純上色，ab則是畫圖，在第一幀只有AB被畫出來，也就是說，並不是一個畫完才開始畫下一個，
如果我讓函式多遞迴個幾圈，則a會被畫出來，等遞迴圈數足夠多時b才會被畫出來
並且這個問題"只會"在最初幾幀出現，也對後續畫面沒有任何影響，也就是即便前幾幀a和A的速度沒對上，後面卻被矯正回來了，在最後一幀也沒因為函式終止而來不及畫出最後一張a
修正：requestAnimationFrame
更:requestAnimationFrame根本沒解決問題，單純只是因為我加幀數而已

3.socket傳送物件：某物件a如果有屬性是指向自己，例如
let a={
  s:"genshin"
}
let b={
  c:a
}
a.d=b;
在本地可執行alert(a.d.c.s);
但若先把a寄到伺服器再寄回來，則無法運行，原因應該是當socket.emit在寄送物件時，是先直接複製所有基本型態，遇到物件則往下遞迴，沒有任何指標的概念，所以發生無限迴圈
function似乎也有同的問題，但我沒想出原因，猜測是因為怕函式內部用到全域變數或一些無法預測的操作，所以乾脆禁止函式的傳送(但按javascript的風格，應該會先試著傳看看，出問題再說，
而事實上，連最簡單的alert都傳不過去，所以我感覺應該有其他原因)
修正：在本地開一個map存物件，在傳送時不傳送物件，而改傳送物件在map中的key，只要維護好雙方map一致，就是在變相使用指標(chimeila.relive是當初留下的歷史遺毒，但我不太敢改，出事再說)


*/

/*
小知識

1.完全彈性碰撞真的反直覺：入射角!=反射角、垂直撞擊時速度會被完全吃掉
2.如果兩個玩家沒用完全相同的順序進行碰撞判定，大概兩輪後畫面就完全不同了

技能說明:
額外回合觸發順序是stack，並且stack裡面不會有重複的角色，死亡會移除拉條效果



*/ 