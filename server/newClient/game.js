
class Records{
    constructor(){
        this._list=[new Promise((resolve,reject)=>{this._resolve=resolve})];
        this._now=0;
        this.len=0;
    }
    async getRecord(){
        let cipher=await this._list[this._now++];
        for(let i of this.game.cycles){
            if(complexAbs(cipher[0],i.pos)<i.r){
                
                break;
            }
        }
    }
    add(record){
        this._resolve(record);
        this._list[++this.len]=new Promise((resolve,reject)=>{this._resolve=resolve});
    }
}
class Game{
    constructor(){
        this.cycles=new AVLTree();
        this.stones=new AVLTree();
        this.chi=Wow.merge(this.stones,this.cycles);
        this.records=new Records();
        this.howManyPointers=0;
        this.now;
        this.speed=5;
        hi={
            record(msg){
                this.records.add(msg);
            }
        }
        this.socket = io(
            location.hostname === "localhost"
            ? "http://localhost:3000"
            : "https://baobaoponpon-si87.onrender.com"
        );
        this.socket.on('msg',(data)=>{
            let msg=data;
            this[this.hi[msg.name]](msg.value);

        })


    }
    
    async start(){
        new Round(this).start().then(()=>this.next());
    }
    async next(){
        let p=new PlayerRound(this);
        p.yourTurn();
        p.start().then(()=>this.next());
    }
    
    
    

}

let game=new Game();


let tmp=new Stone([[0,0],[canvas.width,0],[canvas.width,canvas.height],[0,canvas.height],[0,0]],game);
tmp.magic=friction.bind(tmp);
tmp.fk=0.01;
tmp=null;


class Round{
    constructor(game){
        this.game=game;

    }
    async start(){
        return new Promise((resolve,reject)=>{
            this.draw(resolve);
        })
    }
    
    paint(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let obj of this.game.cycles){
            obj.paint();
        }
    }
    move(){
        let moving=0;
        for(let obj of this.game.cycles){
            moving=moving||obj.vx||obj.vy;
            obj.move();
        }
        return moving;
    }
    draw(resolve,speed=5){
        for(let i=0;i<speed;i++){
            for(let obj of this.game.cycles){
                for(let another of this.game.stones){
                    if(another.ponCheck(obj)) obj.pon(another);
                    another.magic?.(obj);
                    
                }
                for(let another of this.game.cycles){
                    if(another.ponCheck(obj)) obj.pon(another);
                    another.magic?.(obj);
                    
                }
            }
            let moving=this.move();
            if(!moving){
                this.paint();
                resolve?.();
                return;
            }
        }
        this.paint();
        requestAnimationFrame(()=>{this.draw(resolve);});
        
    }
}
class PlayerRound extends Round{
    constructor(...arg){
        super(...arg);
        
        this.cipher={chimeila:null,v:NaN,id:NaN};
        

    }
    
    async start(){
        let [chimeila,v]=await this.game.records.getRecord();
        chimeila.v=v;
        return super.start();
    }
    yourTurn(){
        this.myChoose=this.choose.bind(this);
        this.myMeow=this.meow.bind(this);
        this.myShoot=this.shoot.bind(this);
        document.addEventListener("pointerdown", this.myChoose);
        document.addEventListener("pointermove", this.myMeow);
        document.addEventListener("pointerup", this.myShoot);
    }
    choose(e){
        if(e.isPrimary==false){
            return;
        }
        let rect=canvas.getBoundingClientRect();
        let z=[(e.clientX - rect.left)*canvas.width/canvas.clientWidth,(e.clientY - rect.top)*canvas.height/canvas.clientHeight];
        for(let i of this.game.cycles){
            if(complexAbs(z,i.pos)<i.r){
                this.cipher.chimeila=i;
                this.cipher.id=e.pointerId;
                break;
            }
        }
    }
    meow(e){
        if(e.pointerId!=this.cipher.id){
            return;
        }
        let rect=canvas.getBoundingClientRect();
        let z=[(e.clientX - rect.left)*canvas.width/canvas.clientWidth,(e.clientY - rect.top)*canvas.height/canvas.clientHeight];
        let tmp=new Cipher([this.cipher.chimeila,this.cipher.chimeila.pos,complexDivid(complexMinus(this.cipher.chimeila.pos,z),150)],game);
        this.draw(undefined,Infinity);
        this.game.cycles.delete(tmp);
    }
    shoot(e){
        if(e.pointerId!=this.cipher.id){
            return;
        }
        let rect=canvas.getBoundingClientRect();
        let z=[(e.clientX - rect.left)*canvas.width/canvas.clientWidth,(e.clientY - rect.top)*canvas.height/canvas.clientHeight];
        
        if(complexAbs(z,this.cipher.chimeila.pos)>this.cipher.chimeila.r){
            
            this.cipher.v=complexDivid(complexMinus(this.cipher.chimeila.pos,z),150);
            document.removeEventListener("pointerdown", this.myChoose);
            document.removeEventListener("pointermove", this.myMeow);
            document.removeEventListener("pointerup", this.myShoot);
            this.game.hi.send(new Msg('record',[this.cipher.chimeila.pos,this.cipher.v]));
            //resolve([this.cipher.chimeila,this.cipher.v]);
        }
    }
}

new Cycle(game);
new Cycle(game);
new Cycle(game);
new Cycle(game);
//setInterval(()=>new Cycle(),1000);
game.start();