

class StartScreenScene extends Phaser.Scene {
    constructor(){
        super({key: "StartScreenScene"});
    }

    preload() {
        this.load.image('title_bkgr', 'assets/backgrounds/title_background.png');
        this.load.image('play_bt', 'assets/gui/play_button.png');
    }
    
    create() {
        this.bk = this.add.sprite(400, 300,"title_bkgr");

        let context = this;

        this.add.sprite(400, 400, 'play_bt').setInteractive().on('pointerdown', function(pointer){
            context.scene.start("GameScene");
        });

    }
    update(){
    }
}

var title = new StartScreenScene();