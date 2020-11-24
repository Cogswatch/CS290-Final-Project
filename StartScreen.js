

class StartScreenScene extends Phaser.Scene {
    constructor(){
        super({key: "StartScreenScene"});
    }

    preload() {
        this.load.image('title_bkgr', 'assets/backgrounds/title_background.png');
    }
    
    create() {
        this.bk = this.add.sprite(400, 300,"title_bkgr");
        this.text  = this.add.text(50,50, "hello", {font: '16px Courier', fill: '#ffffff'});
        //this.scene.start("SceneMain");
        this.continue_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);


    }
    update(){
        if(this.continue_key.isDown)
        {
            this.scene.start("GameScene");
        }
    }
}

var title = new StartScreenScene();