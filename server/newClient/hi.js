

class Msg{
    constructor(name,value){
        this.name=name;
        let ans={};
        for(let i in value){
            ans[i]=value[i];
        }
        this.value=value;
    }
}
class Hi{
    constructor(){
        
        
    }
    
}
class RecordMsg{
    constructor(pos,v){
        
    }
}