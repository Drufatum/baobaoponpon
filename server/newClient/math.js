class AVLTree{
    constructor(func=(a,b)=>{return a<b;}){
        this.compare=func;
        this.leaf=Symbol();
        this.root=this.newLeaf(null);
        this.head={};
        this.size=0;
        this.tail={last:this.head};
        this.head={next:this.tail};
    }
    static merge(a,b,func){
        func=func||a.compare||b.compare;
        return{
            _a:a,
            _b:b,
            _func:func,
            [Symbol.iterator](){
                let ita=this._a[Symbol.iterator]();
                let itb=this._b[Symbol.iterator]();
                let func=this._func;
                return{
                    va:ita.next(),
                    vb:itb.next(),
                    ita:ita,
                    itb:itb,
                    func:func,
                    next(){
                        if(!this.va.done&&!this.vb.done){
                            if(this.va.value===this.vb.value){
                                let ans=this.va;
                                this.va=this.ita.next();
                                this.vb=this.itb.next();
                                return ans;
                            }
                            if(this.func(this.va.value,this.vb.value)){
                                let ans=this.va;
                                this.va=this.ita.next();
                                return ans;
                            }
                            if(this.func(this.vb.value,this.va.value)){
                                let ans=this.vb;
                                this.vb=this.itb.next();
                                return ans;
                            }
                        }
                        else if(!this.va.done){
                            let ans=this.va;
                            this.va=this.ita.next();
                            return ans;
                        }
                        else if(!this.vb.done){
                            let ans=this.vb;
                            this.vb=this.itb.next();
                            return ans;
                        }
                        else if(this.va.done&&this.vb.done)return {done:true};
                    }
                }
            }
        }
    }
    [Symbol.iterator](){
        let now=this.head;
        let tail=this.tail;
        return {
            now:now,
            tail:tail,
            next(){
                if(this.now.next!==this.tail){
                    this.now=this.now.next;
                    return {done:false,value:this.now.value};
                }
                return {done:true};
            }
        }
    }
    newLeaf(dad){
        return{
            value:this.leaf,
            height:0,
            dad:dad,
        }
    }
    leftUp(root){
        let dad=root.dad;
        let son=root.left;
        let grandSon=son.right;
        root.left=grandSon;
        grandSon.dad=root;
        son.right=root;
        root.dad=son;
        if(dad){
            let self=dad.left===root ? "left" : "right";
            dad[self]=son;
            son.dad=dad;
        }
        else{
            this.root=son;
            son.dad=null;
        }
        root.height=Math.max(root.right.height,root.left.height)+1;
        son.height=Math.max(son.right.height,son.left.height)+1;
    }
    rightUp(root){
        let dad=root.dad;
        let son=root.right;
        let grandSon=son.left;
        root.right=grandSon;
        grandSon.dad=root;
        son.left=root;
        root.dad=son;
        if(dad){
            let self=dad.left===root ? "left" : "right";
            dad[self]=son;
            son.dad=dad;
        }
        else{
            this.root=son;
            son.dad=null;
        }
        root.height=Math.max(root.right.height,root.left.height)+1;
        son.height=Math.max(son.right.height,son.left.height)+1;
    }
    _find(x,root=this.root){
        if(root.value===this.leaf){
            return root;
        }
        
        if(x===root.value){
            return root;
        }
        if(this.compare(x,root.value)){
            return this._find(x,root.left);
        }
        return this._find(x,root.right);
    }
    find(x){
        if(this._find(x).value===this.leaf){
            return false;
        }
        return true;
    }
    insert(x){
        let ans=this._find(x);
        if(ans.value===this.leaf){
            ans.value=x;
            ans.left=this.newLeaf(ans);
            ans.right=this.newLeaf(ans);
            ans.height=1;
            if(ans.dad){
                if(ans.dad.left===ans){
                    ans.next=ans.dad;
                    ans.last=ans.dad.last;
                    ans.next.last=ans;
                    ans.last.next=ans;
                }
                else{
                    ans.last=ans.dad;
                    ans.next=ans.dad.next;
                    ans.next.last=ans;
                    ans.last.next=ans;
                }

            }
            else{
                this.head.next=ans;
                this.tail.last=ans;
                ans.next=this.tail;
                ans.last=this.head;
            }
            this.fixHeight(ans.dad);
            this.size++;
            return true;
        }
        else{
            return false;
        }
        
    }
    delete(x){
        let ans=this._find(x);
        if(ans.value!==this.leaf){
            let now=ans.left;
            if(now.value===this.leaf){
                if(ans.right.value!==this.leaf){
                    ans.value=ans.right.value;
                    now=ans.right;
                }
                else{
                    now=ans;
                }
            }
            else{
                while(now.right.value!==this.leaf){
                    now=now.right;
                }
                if(now.left.value!==this.leaf){
                    this.leftUp(now);
                    
                }
                ans.value=now.value;
            }
            now.value=this.leaf;
            now.height=0;
            now.left=null;
            now.right=null;
            now.next.last=now.last;
            now.last.next=now.next;
            this.fixHeight(now.dad);
            this.size--;
            
            return true;
        }
        else{
            return false;
        }
    }
    fixHeight(root){
        if(!root)return;
        if(root.left.height-root.right.height>1){
            if(root.left.left.height<root.left.right.height){
                this.rightUp(root.left);
            }
            this.leftUp(root);
            this.fixHeight(root.dad.dad);
        }
        else if(root.right.height-root.left.height>1){
            if(root.right.left.height>root.right.right.height){
                this.leftUp(root.right);
            }
            this.rightUp(root);
            this.fixHeight(root.dad.dad);
        }
        else if(root.height!=Math.max(root.right.height,root.left.height)+1){
            root.height=Math.max(root.right.height,root.left.height)+1;
            this.fixHeight(root.dad);
        }
        
    }
    dfs(root=this.root){
        if(root.value!==this.leaf){
            //if(root.height!=Math.max(root.right.height,root.left.height)+1){alert("p");return false;}
            //if(Math.max(root.right.height,root.left.height)-Math.min(root.right.height,root.left.height)>1){return false;}

            this.dfs(root.left);
            alert(root.value);
            this.dfs(root.right);
        }
    }
}
function complexAbs(z1,z2=[0,0]){
  return Math.sqrt((z1[0]-z2[0])*(z1[0]-z2[0])+(z1[1]-z2[1])*(z1[1]-z2[1]));
}//|z1|or|z1-z2|
function complexAdd(z1,z2,...rest){
  return rest.length==0 ? [z1[0]+z2[0],z1[1]+z2[1]] : complexAdd([z1[0]+z2[0],z1[1]+z2[1]],...rest);
}//sigma zi
function complexMinus(z1,z2){
  return [z1[0]-z2[0],z1[1]-z2[1]];
}//z1-z2
function complexCross(z1,z2){
  if(typeof z2=="number"){
    z2=[z2,0];
  }
  if(typeof z1=="number"){
    z1=[z1,0];
  }
  let x=z1[0];
  let y=z1[1];
  let u=z2[0];
  let v=z2[1];
  return [x*u-y*v,x*v+y*u];
}//z1*z2 (real number is ok)
function complexDivid(z1,z2){
  if(typeof z1=="number"){
    z1=[z1,0];
  }
  if(typeof z2=="number"){
    z2=[z2,0];
  }
  let x=z1[0];
  let y=z1[1];
  let u=z2[0];
  let v=z2[1];
  let ans=complexCross(z1,[u,-v]);
  ans[0]/=(u*u+v*v);
  ans[1]/=(u*u+v*v);
  return ans;
}//z1/z2 (real number is ok)
function projection(z,z1,z2){
  let tmp=complexDivid(complexDivid(complexMinus(z2,z1),complexDivid(complexMinus(z,z1),complexMinus(z2,z1))),[complexAbs(complexMinus(z2,z1))*complexAbs(complexMinus(z2,z1))/(complexAbs(complexMinus(z,z1))*complexAbs(complexMinus(z,z1))),0]);
  return complexDivid(complexAdd(complexAdd(tmp,z1),z),[2,0]);
}//z's projection on line z1z2 (line means the infinite length)
function reflect(z1,z2){
  if(z1[0]==0&&z1[1]==0){
    return [0,0];
  }
  return complexCross(complexCross(complexDivid(z2,z1),z2),[(complexAbs(z1)/complexAbs(z2))*(complexAbs(z1)/complexAbs(z2)),0]);
}//the reflection of vector z1 (by z2)
function dot(z1,z2){
  return z1[0]*z2[0]+z1[1]*z2[1];
}//vector dot
