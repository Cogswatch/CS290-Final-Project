
let game_scene = new GameScene();

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 0 }
        }
    },
    scene: [title, game_scene],
    parent: 'game-window',
    dom: { createContainer: false}
};

var game = new Phaser.Game(config);

///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////