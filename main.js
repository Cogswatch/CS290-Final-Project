
let game_scene = new GameScene();

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 0 }
        }
    },
    scene: [title, game_scene],
    dom: { createContainer: false}
};

var game = new Phaser.Game(config);

///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////