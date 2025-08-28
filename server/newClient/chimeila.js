const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

//"Wow" means a robust struct
//robust:牛逼烘烘
class Wow extends AVLTree{
    constructor(){
        super(Pointer.compare);
    }
    static merge(a,b){
        return {
            a:a,
            b:b, 
            [Symbol.iterator](){
                a=this.a[Symbol.iterator]();
                b=this.b[Symbol.iterator]();
                return{
                    a:a,
                    b:b,
                    next(){
                        let tmp=this.a.next();
                        if(tmp.done){
                            return this.b.next();
                        }
                        return tmp;
                    }
                }
            }
        }
    }
}
class Pointer{
    constructor(game){
        this.game=game;
        this.pointer=game.howManyPointers++;
    }
    static compare(a,b){
        if(a.key<b.key){
            return true;
        }
        if(a.key==b.key&&a.pointer<b.pointer){
            return true;
        }
        return false;
    }
}
class Cycle extends Pointer{
    constructor(...rest){
        super(...rest);
        [this.pos,this.v]=[[canvas.width*Math.random(),canvas.height*Math.random()],[0,0]];
        this.r=50;
        this.m=10;
        this.key=1;
        this.game.cycles.insert(this);
    }
    get pos(){
        return [this.x,this.y];
    }
    set pos(value){
        [this.x,this.y]=value;
    }
    get v(){
        return [this.vx,this.vy];
    }
    set v(value){
        value=value||[0,0];
        [this.vx,this.vy]=value;
    }
    move(){
        this.x+=this.vx;
        this.y+=this.vy;
    }
    paint(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle="rgb(0, 0, 0)";
        ctx.fill();
        ctx.closePath();
    }
    posCheck(another){
        if(another instanceof Cycle){
            return complexAbs(complexMinus(this.pos,another.pos))<this.r+another.r;
        }
        else if(another instanceof Wall){
            return another.posCheck(this);
        }
    }
    dirCheck(another){
        if(another instanceof Cycle){
            return dot(complexMinus(this.v,another.v),complexMinus(this.pos,another.pos))<0;
        }
        else if(another instanceof Wall){
            return another.dirCheck(this);
        }
    }
    ponCheck(another){
        
        if(another instanceof Cycle){
            if(this.key<another.key) return false;
            return this.posCheck(another)&&this.dirCheck(another);
        }
        else if(another instanceof Wall){
            return another.ponCheck(this);
        }
    }
    pon(another){
        if(another instanceof Cycle){
            let dir=complexMinus(this.pos,another.pos);
            let vbar=(another.m==this.m
                ? complexDivid(complexAdd(this.v,another.v),2)
                : complexAdd(complexCross(this.v,this.m/(this.m+another.m)),complexCross(another.v,another.m/(this.m+another.m))));
            this.v=complexMinus(complexAdd(reflect(vbar,dir),vbar),reflect(this.v,dir));
            another.v=complexMinus(complexAdd(reflect(vbar,dir),vbar),reflect(another.v,dir));

        }
        else if(another instanceof Wall){
            another.pon(this);
        }
        return true;
    }
    
}
class Chimeila extends Cycle{
    constructor(...rest){
        super(...rest);
        this.atk=15;
        this.hp=80;
    }
    atk(another){
        another.hp-=this.atk;
    }
    
}
class Cipher extends Cycle{
    constructor(inf,...rest){
        super(...rest);
        this.m=10;
        this.key=0;
        [this.aglaea,this.pos,this.v]=inf;
        this.path=[];
    }
    pon(another){
        if(another===this.aglaea){
            return false;
        }
        super.pon(another);
        another.v=0;
        this.path.push(this.pos);
    }
    paint(){
        ctx.beginPath();
        ctx.moveTo(...this.aglaea.pos);
        for(let i of this.path){
            ctx.lineTo(...i);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.arc(...i, this.r, 0, Math.PI * 2);
            
            ctx.fillStyle="rgb(0, 0, 0)";
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(...i);
        }
        ctx.lineTo(...this.pos);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(...this.pos, this.r, 0, Math.PI * 2);
        ctx.fillStyle="rgb(0, 0, 0)";
        ctx.fill();
        ctx.closePath();
        
        
        
        
    }
}









class Wall extends Pointer{
    constructor(...rest){
        super(...rest);
        this.key=Infinity;
        this.m=Infinity;
    }
}
class Line extends Wall{
    constructor(begin,end,...rest){
        super(...rest);
        this.begin=begin;
        this.end=end;
    }
    posCheck(another){
        if(another instanceof Cycle){
            return (complexAbs(another.pos,projection(another.pos,this.begin,this.end))<another.r
                    && complexAbs(projection(another.pos,this.begin,this.end),complexDivid(complexAdd(this.begin,this.end),2))<complexAbs(this.begin,this.end)/2
            );
        }
    }
    dirCheck(another){
        return dot(another.v,complexMinus(another.pos,projection(another.pos,this.begin,this.end)))<0;
    }
    ponCheck(another){
        if(another instanceof Cycle){
            return this.posCheck(another)&&this.dirCheck(another);
        }
    }
    pon(another){
        if(this.ponCheck(another)){
            another.v=reflect(complexCross(-1,another.v),complexMinus(projection(another.pos,this.begin,this.end),another.pos));
        }
        
    }
}
class Dot extends Wall{
    
}
class Stone extends Wall{
    constructor(arr,...rest){
        super(...rest);
        this.lines=[];

        for(let i=0;i<arr.length-1;i++){
            this.lines.push(new Line(arr[i],arr[i+1],game));
        }
        
        this.game.stones.insert(this);
        
        
    }
    ponCheck(another){
        if(another instanceof Cycle){
            for(let i of this.lines){
                if(i.ponCheck(another)) return true;
            }
        }
    }
    pon(another){
        if(another instanceof Cycle){
            for(let i of this.lines){
                i.pon(another);
            }
        }
    }

}
function friction(another){
    another.v=complexAbs(another.v)<this.fk ? 0 : complexCross((complexAbs(another.v)-this.fk)/complexAbs(another.v),another.v);
}
/*

key大poncheck,key小pon,相同不反應






*/