
let player = null;

///////////////////////////////////////////////////////////////////////////

let score = 0;

let move_left = null;
let move_right = null;
let throttle = null;
let player_fire = null;
let score_text = null;

let coins = [];
let explosions = [];
let enemies = [];

let enemy_bullets = new ObjectPool();
let player_bullets = new ObjectPool();

let last_enemy_spawn_count = 5;
let enemy_spawn_count = 8;

// 0: player
// 1: player bullets
// 2: enemies
// 3: enemy bullets
// 4: enviroment
let collision_groups = [];
let collision_cats = [];

let event_emitter = null;

let mouse_controll = false;

let mouse_state = {left: false, right: false};

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
        this.load.spritesheet('explosion_01', 'assets/explosion_01.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('ship_02', 'assets/ship_02.png');
        this.load.image('coin', 'assets/coin_1.png');
        this.load.image('asteroid', 'assets/asteroid_001.png');
        this.load.image('sm_smoke', 'assets/particles/smoke_small_01.png');

        for(var i = 0; i < 10; i++)
        {
            collision_groups.push(this.matter.world.nextGroup(), i == 1);
            collision_cats.push(this.matter.world.nextCategory());
        }
    }

    
    create ()
    {
        this.input.mouse.disableContextMenu();

        this.input.on('pointerdown', function (pointer) {

            if (pointer.rightButtonDown())
            {
                mouse_state.right = true;
            }
            if(pointer.leftButtonDown())
            {
                mouse_state.left = true;
            }
    
        }, this);


        this.input.on('pointerup', function (pointer) {

            if (!pointer.rightButtonDown())
            {
                mouse_state.right = false;
            }
            if(!pointer.leftButtonDown())
            {
                mouse_state.left = false;
            }
    
        }, this);

        this.anims.create({
            key: 'bullet_anim',
            frames: this.anims.generateFrameNames('bullet'),
            frameRate: 8,
            yoyo: false,
            repeat: -1,
            repeatDelay: 0
        });


        this.anims.create({
            key: 'explosion_01_anim',
            frames: this.anims.generateFrameNames('explosion_01'),
            frameRate: 8,
            yoyo: false,
            repeat: 1,
            repeatDelay: 0
        });

        event_emitter = new Phaser.Events.EventEmitter();
        
        event_emitter.on("fire", fire_bullet, this);
        event_emitter.on("destroy_bullet", destroy_bullet, this);

        move_left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        move_right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        throttle = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        player_fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        score_text = this.add.text(50,50, "", {font: '16px Courier', fill: '#ffffff'}).setScrollFactor(0);

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
            scale: { start: 2.0, end: 0 },
            tint: 0xaaaaff,
            blendMode: 'ADD'
        });

        player = this.matter.add.sprite(410, 310, 'player');
        player.setFrictionAir(0.1);
        player.setMass(30);
        player.setFixedRotation();
        player.setCollisionGroup(collision_groups[0]).setCollisionCategory(collision_cats[0]);

        player.fire_accum = 0;
        player.fire_rate = 3;
        player.health = 10;

        emitter.startFollow(player);
        this.cameras.main.startFollow(player);

        for(var i = 0; i < 10; i++)
        {
            var x = Phaser.Math.Between(0,800);
            var y = Phaser.Math.Between(0,600);
            var asteroid = this.matter.add.sprite(x,y, "asteroid");
            asteroid.setMass(300);
            asteroid.setAngle(Phaser.Math.Between(0,1000));
            asteroid.setCollisionGroup(collision_groups[4]).setCollisionCategory(collision_cats[4]);
            asteroid.health = 10;
        }

        for(var i = 0; i < enemy_spawn_count; i++)
        {
            var x = Phaser.Math.Between(-1000,1800);
            var y = Phaser.Math.Between(-1100,1600);
            var ship = this.matter.add.sprite(x,y, "ship_02");
            ship.setMass(30);
            ship.setAngle(Phaser.Math.Between(0,1000));
            ship.setCollisionGroup(collision_groups[2]).setCollisionCategory(collision_cats[2]);
            ship.setFixedRotation();
            ship.setFrictionAir(0.1);
            ship.fire_accum = 0;
            ship.fire_rate = 32;
            ship.health = 10;
            enemies.push(ship);
        }

        this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
            if (bodyA.gameObject.bullet) event_emitter.emit("destroy_bullet", bodyA.gameObject, bodyB.gameObject);
            else if (bodyB.gameObject.bullet) event_emitter.emit("destroy_bullet", bodyB.gameObject, bodyA.gameObject);
        });
    }

    update()
    {
        score_text.setText("Score: " + score + '\nHealth: ' + player.health);
        if(enemies.length == 0)
        {
            return this.new_wave();
        }
        if(player.health <= 0)
        {
            return this.death();
        }

        if(mouse_controll)
        {
            var m_pos = {x: this.input.activePointer.worldX, y: this.input.activePointer.worldY};
            fly_toward(player, m_pos, true, mouse_state.left, mouse_state.right);
        }
        else
        {
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
                event_emitter.emit('fire', player, player_bullets);
            }

            if(throttle.isDown)
            {
                player.thrust(0.1);
            }
        }
 
        player.fire_accum--;

        for(let expo of explosions)
        {
            if(expo.life_time <= 0)
                expo.destroy();
            else
            {
                expo.life_time -= 1;
            }
        }

        for (let i = 0; i < enemies.length;)
        //for(let ship of enemies)
        {
            let ship = enemies[i];

            if(ship.health <= 0)
            {
                ship.destroy();
                enemies.splice(i,1);
                score += 100;
            }
            else
            {
                fly_toward(ship, player);    
                i++;
            }
        }

        enemy_bullets.update(function (bullet){
            bullet.life_time -= 1;
            if(bullet.life_time<=0)
            {
                bullet.destroy();
                enemy_bullets.remove(bullet);
            }
        });

        player_bullets.update(function (bullet){
            bullet.life_time -= 1;
            if(bullet.life_time<=0)
            {
                bullet.destroy();
                player_bullets.remove(bullet);
            }
        });

    }

    collect_coin(player, coin)
    {
        coin.disableBody(true, true);
        score += 1;
    }

    new_wave()
    {
        this.reset();
        let t = enemy_spawn_count + last_enemy_spawn_count;
        last_enemy_spawn_count = enemy_spawn_count;
        enemy_spawn_count = t;
        this.scene.start("GameScene")
    }

    reset()
    {
        coins = [];
        explosions = [];
        enemies = [];
        
        enemy_bullets = new ObjectPool();
        player_bullets = new ObjectPool();
        
        collision_groups = [];
        collision_cats = [];
        event_emitter = null;
    }
    
    death()
    {
        var modal = document.getElementById("score-modal");
        var modalbd = document.getElementById("modal-backdrop");
        modal.classList.remove('hidden');
        modalbd.classList.remove('hidden');
        game.score = score;
        score = 0;
        enemy_spawn_count = 5;
        

        this.reset();

        this.scene.start("StartScreenScene");
    }
    
}

function fly_toward(ship, target, player = false, thrust = true, fire = true)
{
    if(!ship || !target) return;
    var sa = ship.angle * 3.14159/180.0;

    
    // SIDE VECTOR not sure which
    var sdx = Math.cos(sa);
    var sdy = Math.sin(sa);
    
    var tdx = target.x - ship.x;
    var tdy = target.y - ship.y;

    var target_angle = Math.atan2(tdy, tdx);
    var da = Math.atan2(Math.sin(target_angle - sa), Math.cos(target_angle - sa));


    ship.setAngularVelocity(da * 0.1);

    //target delta length
    var tdl = Math.sqrt(tdx * tdx + tdy * tdy);
    tdx /= tdl;
    tdy /= tdl;
//
    var t_dot_s = tdx * sdx + tdy * sdy;
//
    //ship.setAngularVelocity(t_dot_s * 0.1);

    if(!player)
    {
        if(tdl > 300.0) // far away
        {
            ship.thrust(0.1);
        }
        else // close to target
        {
            ship.thrust(0.1);
            ship.setAngularVelocity(Math.sign(tdx*tdy) * (1.0-Math.abs(t_dot_s))*0.1);
        }
        if(tdl < 460.0 && !player && fire)
        {
            event_emitter.emit("fire", ship, enemy_bullets, false);
        }
    }
    else 
    {
        if(thrust)
        {
            ship.thrust(0.1);
        }
        if(fire)
        {
            event_emitter.emit("fire", ship, player_bullets);
        }
    }

    
}

function destroy_bullet(bullet, hit_object)
{
    var expo = this.matter.add.sprite(
        (bullet.x + hit_object.x)/2.0, 
        (bullet.y+ hit_object.y)/2.0,
        "explosion").play('explosion_01_anim');
    expo.setAngle(Phaser.Math.Between(0,3000)); 
    expo.setCollisionGroup(collision_groups[1]);
    expo.setCollisionCategory(collision_cats[1]).setCollidesWith([]);
    expo.life_time = 33;
    explosions.push(expo);
    
    if(hit_object.health) // does this object have health
    {
        hit_object.health -= bullet.damage;
    }

    bullet.destroy();
}

// todo add collision group param
function fire_bullet(game_object, pool, player = true)
{
    game_object.fire_accum--;
    if(game_object.fire_accum > 0)
    {
        return
    }
    game_object.fire_accum = game_object.fire_rate;
    
    var bullet = this.matter.add.sprite(game_object.x, game_object.y,"bullet").play("bullet_anim");
    bullet.bullet = true;
    bullet.damage = 1;
    bullet.life_time = 40;
    bullet.setAngle(game_object.angle);
    if(player)
    {
        bullet.setCollisionGroup(collision_groups[1]);
        bullet.setCollisionCategory(collision_cats[1]).setCollidesWith([collision_cats[2],collision_cats[4]]);
    }
    else
    {
        bullet.setCollisionGroup(collision_groups[3]);
        bullet.setCollisionCategory(collision_cats[3]).setCollidesWith([collision_cats[0],collision_cats[4]]);
    }
    var theta = game_object.angle * 3.14159/180.0;
    const bullet_speed = 18.0;
    var vx = Math.cos(theta) * bullet_speed;
    var vy = Math.sin(theta) * bullet_speed;
    bullet.setVelocity(vx,vy);
    
    pool.add(bullet);
}