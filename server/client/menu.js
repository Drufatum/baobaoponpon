const myId=[""];
//catchI是捉i的意思
function catchI(data,n){
    document.querySelectorAll(".room").forEach(elem=>{
        document.getElementById("room").removeChild(elem);
    });
    for(let i=0;i<n;i+=1){
        if(data[i]["creatorId"]==myId[0]){
            const cancel=document.createElement("button");
            document.getElementById("room").appendChild(cancel);
            cancel.textContent="cancel";
            cancel.classList.add("room");
            cancel.addEventListener("click",()=>{
                for(let j=i;j<n-1;j++){
                    for(let k in data[j]){
                        data[j][k]=data[j+1][k];
                    }
                }
                data.pop();
                socket.emit("catchI",data,n-1);
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
    myId[0]=data;
});
socket.on("catchI",catchI);
socket.on("gameStart",(data)=>{

  document.querySelectorAll(".game").forEach(elem=>{
    elem.style.display="block";
  });
  document.querySelectorAll(".menu").forEach(elem=>{
    elem.style.display="None";
  });
  socket.emit("start",data);
  
});