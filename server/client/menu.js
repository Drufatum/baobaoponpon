const socket = io(
    location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://bow-8ssn.onrender.com"
);
const myId=[""];
//我開房，並昭告天下
//catchI是捉i的意思
function catchI(data,n){
    
    const rooms=document.getElementById("room").querySelectorAll(".room");
    for(let i=0;i<rooms.length;i+=1){
        document.getElementById("room").removeChild(rooms[i]);
    }
    
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