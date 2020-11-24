
let player = null;

///////////////////////////////////////////////////////////////////////////

let score = 0;

let move_left = null;
let move_right = null;
let throttle = null;
let player_fire = null;
let score_text = null;

let coins = [];

// 0: player
// 1: player bullets
// 2: enemies
// 3: enemy bullets
// 4: enviroment
let collision_groups = [];
let collision_cats = [];

let event_emitter = null;

///////////////////////////////////////////////////////////////////////////
class GameScene extends Phaser.Scene {
    constructor(){
        super({key: "GameScene"});
    }

    preload ()
    {
        this.load.spritesheet('player', 'assets/ship_01.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('thrust', 'assets/thrust_01.png', { frameWidth: 32, frameHeight: 16 });
        this.load.spritesheet('bullet', 'assets/bullet_01.png', { frameWidth: 32, frameHeight: 16 });
        this.load.image('coin', 'assets/coin_1.png');
        this.load.image('asteroid', 'assets/asteroid_001.png');
        this.load.image('sm_smoke', 'assets/particles/smoke_small_01.png');

        for(var i = 0; i < 10; i++)
        {
            collision_groups.push(this.matter.world.nextGroup());
            collision_cats.push(this.matter.world.nextCategory());
        }
    }

    
    create ()
    {
        event_emitter = new Phaser.Events.EventEmitter();
        
        event_emitter.on("fire", fire_bullet, this);

        move_left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        move_right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        throttle = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        player_fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

        player = this.matter.add.sprite(410, 310, 'player');
        player.setFrictionAir(0.1);
        player.setMass(30);
        player.setFixedRotation();
        player.setCollisionGroup(collision_groups[0]).setCollisionCategory(collision_cats[0]);

        player.fire_accum = 0;
        player.fire_rate = 3;

        emitter.startFollow(player);


        for(var i = 0; i < 10; i++)
        {
            var x = Phaser.Math.Between(0,800);
            var y = Phaser.Math.Between(0,600);
            var asteroid = this.matter.add.sprite(x,y, "asteroid");
            asteroid.setMass(300);
            asteroid.setAngle(Phaser.Math.Between(0,1000));
            asteroid.setCollisionGroup(collision_groups[4]).setCollisionCategory(collision_cats[4]);
        }
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

        if(player_fire.isDown)
        {
            event_emitter.emit('fire', player);
        }

        if(throttle.isDown)
        {
            player.thrust(0.1);
        }
 
        player.fire_accum--;
    }

    collect_coin(player, coin)
    {
        coin.disableBody(true, true);
        score += 1;
    }
}
    
function fire_bullet(game_object)
{
    if(game_object.fire_accum > 0)
    {
        return
    }

    game_object.fire_accum = game_object.fire_rate;
    
    var bullet = this.matter.add.sprite(game_object.x, game_object.y,"bullet");
    bullet.setAngle(game_object.angle);
    bullet.setCollisionGroup(collision_groups[1]);
    bullet.setCollisionCategory(collision_cats[1]).setCollidesWith(collision_cats[2]).setCollidesWith(collision_cats[4]);
    var theta = game_object.angle * 3.14159/180.0;
    const bullet_speed = 18.0;
    var vx = Math.cos(theta) * bullet_speed;
    var vy = Math.sin(theta) * bullet_speed;
    bullet.setVelocity(vx,vy);
}