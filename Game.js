
let player = null;

///////////////////////////////////////////////////////////////////////////

let score = 0;

let move_left = null;
let move_right = null;
let throttle = null;
let jump = null;
let score_text = null;

let coins = []

///////////////////////////////////////////////////////////////////////////
class GameScene extends Phaser.Scene {
    constructor(){
        super({key: "GameScene"});
    }

    preload ()
    {
        this.load.spritesheet('player', 'assets/ship_01.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('coin', 'assets/coin_1.png');
        this.load.image('sm_smoke', 'assets/particles/smoke_small_01.png');
    }

    create ()
    {
        move_left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        move_right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        throttle = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        jump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        score_text = this.add.text(50,50, "", {font: '16px Courier', fill: '#ffffff'});

        var particles = this.add.particles('sm_smoke');

        var emitter = particles.createEmitter({
            speed: {
                onEmit: function (particle, key, t, value)
                {
                    return player.body.speed;
                }
            },
            lifespan: {
                onEmit: function (particle, key, t, value)
                {
                    return Phaser.Math.Percent(player.body.speed, 0, 300) * 20000;
                }
            },
            alpha: {
                onEmit: function (particle, key, t, value)
                {
                    return Phaser.Math.Percent(player.body.speed, 0, 300) * 1000;
                }
            },
            scale: { start: 1.0, end: 0 },
            blendMode: 'ADD'
        });

        player = this.matter.add.sprite(64, 64, 'player');
        player.setFrictionAir(0.1);
        player.setMass(30);
        player.setFixedRotation();
    
        emitter.startFollow(player);
    }



    update()
    {
        score_text.setText("Score: " + score);

        if (move_left.isDown)
        {
            player.setAngularVelocity(-0.1);
        }
        else if (move_right.isDown)
        {
            player.setAngularVelocity(0.1);
        }

        if(throttle.isDown)
        {
            player.thrust(0.1);
        }

    }

    collect_coin(player, coin)
    {
        coin.disableBody(true, true);
        score += 1;
    }
}
