
class ObjectPool{
    constructor(){
        this.pool = [];
        this.collision_group = null;
        this.collision_cat = null;
    }

    add(obj){
        this.pool.push(obj);
    }

    remove(obj){
        this.pool.filter(item => obj !== item);
    }

    update(functor){
        for(let i = this.pool.length-1; i >= 0; i--)
        {
            let obj = this.pool[i];
            if(obj.health && obj.health <= 0)
            {
                obj.destroy();
                this.pool.splice(i,1);
                continue;
            }
            if(functor)
            {
                functor(obj);
            }
        }
    }
}