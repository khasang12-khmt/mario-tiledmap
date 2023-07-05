import { ISpriteConstructor } from '../interfaces/sprite.interface'

export class Mario extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body

    // variables
    private currentScene: Phaser.Scene
    private marioSize: string
    private isDancing: boolean
    private lastDirection: string
    private acceleration: number
    private isJumping: boolean
    private isDying: boolean
    private isVulnerable: boolean
    private vulnerableCounter: number
    private bullet: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    // input
    private keys: Map<string, Phaser.Input.Keyboard.Key>

    public getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
        return this.keys
    }

    public getVulnerable(): boolean {
        return this.isVulnerable
    }

    constructor(aParams: ISpriteConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame)

        this.currentScene = aParams.scene
        this.initSprite()
        this.lastDirection = 'right'
        this.currentScene.add.existing(this)
        this.isDancing = false
    }

    private initSprite() {
        // variables
        this.marioSize = this.currentScene.registry.get('marioSize')
        this.acceleration = 500
        this.isJumping = false
        this.isDying = false
        this.isVulnerable = true
        this.vulnerableCounter = 100

        // sprite
        this.setOrigin(0.5, 0.5)
        this.setFlipX(false)
        this.bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet')
        this.bullet.body.allowGravity = false
        this.bullet.setAlpha(0)
        this.bullet.setDepth(1)

        // input
        this.keys = new Map([
            ['LEFT', this.addKey('LEFT')],
            ['RIGHT', this.addKey('RIGHT')],
            ['DOWN', this.addKey('DOWN')],
            ['JUMP', this.addKey('SPACE')],
            ['SHOOT', this.addKey('Q')],
        ])

        // physics
        this.currentScene.physics.world.enable(this)
        //this.adjustPhysicBodyToSmallSize();
        this.body.setSize(15, 22)
        this.body.maxVelocity.x = 50
        this.body.maxVelocity.y = 300
    }

    private addKey(key: string): Phaser.Input.Keyboard.Key {
        return this.currentScene.input.keyboard.addKey(key)
    }

    update(): void {
        if (!this.isDying) {
            this.handleInput()
            this.handleAnimations()
        } else {
            this.setFrame(12)
            if (this.y > this.currentScene.sys.canvas.height) {
                this.currentScene.scene.stop('GameScene')
                this.currentScene.scene.stop('HUDScene')
                this.currentScene.scene.start('MenuScene')
            }
        }

        if (!this.isVulnerable) {
            if (this.vulnerableCounter > 0) {
                this.vulnerableCounter -= 1
            } else {
                this.vulnerableCounter = 100
                this.isVulnerable = true
            }
        }
    }

    private handleInput() {
        if (this.y > this.currentScene.sys.canvas.height) {
            // mario fell into a hole
            this.isDying = true
        }

        // evaluate if player is on the floor or on object
        // if neither of that, set the player to be jumping
        if (this.body.onFloor() || this.body.touching.down || this.body.blocked.down) {
            this.isJumping = false
            //this.body.setVelocityY(0);
        }

        // handle movements to left and right
        if (this.keys.get('RIGHT')?.isDown) {
            this.lastDirection = 'right'
            this.body.setAccelerationX(this.acceleration)
            this.setFlipX(false)
        } else if (this.keys.get('SHOOT')?.isDown) {
            this.fireBullet()
        } else if (this.keys.get('LEFT')?.isDown) {
            this.lastDirection = 'left'
            this.body.setAccelerationX(-this.acceleration)
            this.setFlipX(true)
        } else {
            this.body.setVelocityX(0)
            this.body.setAccelerationX(0)
        }

        // handle jumping
        if (!this.isDancing && this.keys.get('JUMP')?.isDown && !this.isJumping) {
            this.body.setVelocityY(-200)
            this.isJumping = true
        }
    }

    public getIsDancing() {
        return this.isDancing
    }

    public fireBullet() {
        this.bullet.enableBody(true, this.x, this.y, true, true)
        this.bullet.setAlpha(1)
        this.bullet.setPosition(this.x, this.y)
        this.bullet.setVelocityX(this.lastDirection == 'right' ? 300 : -300)
        this.scene.anims.create({
            key: 'bullet',
            frames: this.scene.anims.generateFrameNumbers('bullet', {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        })
        this.bullet.anims.play('bullet')

        // Set a timer to destroy the bullet after 2 seconds
        this.scene.time.addEvent({
            delay: 2000,
            callback: this.stopBullet,
            callbackScope: this,
        })
    }
    public getBullet() {
        return this.bullet
    }

    public stopBullet() {
        this.bullet.setAlpha(0)
    }

    public respawnBullet() {
        this.bullet.disableBody(true, true)
    }

    private handleAnimations(): void {
        if (this.body.velocity.y !== 0) {
            // mario is jumping or falling
            this.anims.stop()
            if (this.marioSize === 'small') {
                this.setFrame(4)
            } else {
                this.setFrame(10)
            }
        } else if (this.body.velocity.x !== 0) {
            // mario is moving horizontal

            // check if mario is making a quick direction change
            if (
                (this.body.velocity.x < 0 && this.body.acceleration.x > 0) ||
                (this.body.velocity.x > 0 && this.body.acceleration.x < 0)
            ) {
                if (this.marioSize === 'small') {
                    this.setFrame(5)
                } else {
                    this.setFrame(11)
                }
            }

            if (this.body.velocity.x > 0) {
                console.log(this.marioSize + 'MarioWalk')
                this.anims.play(this.marioSize + 'MarioWalk', true)
            } else {
                this.anims.play(this.marioSize + 'MarioWalk', true)
            }
        } else {
            // mario is standing still
            this.anims.stop()
            if (this.marioSize === 'small') {
                this.setFrame(0)
            } else {
                if (this.keys.get('DOWN')?.isDown) {
                    this.setFrame(13)
                } else {
                    this.setFrame(6)
                }
            }
        }
    }

    public growMario(): void {
        this.marioSize = 'big'
        this.currentScene.registry.set('marioSize', 'big')
        this.adjustPhysicBodyToBigSize()
    }

    private shrinkMario(): void {
        this.marioSize = 'small'
        this.currentScene.registry.set('marioSize', 'small')
        this.adjustPhysicBodyToSmallSize()
    }

    private adjustPhysicBodyToSmallSize(): void {
        this.body.setSize(6, 12)
        this.body.setOffset(6, 4)
    }

    private adjustPhysicBodyToBigSize(): void {
        this.body.setSize(8, 16)
        this.body.setOffset(4, 0)
    }

    public bounceUpAfterHitEnemyOnHead(): void {
        this.currentScene.add.tween({
            targets: this,
            props: { y: this.y - 5 },
            duration: 200,
            ease: 'Power1',
            yoyo: true,
        })
    }

    public gotHit(): void {
        this.isVulnerable = false
        if (this.marioSize === 'big') {
            this.shrinkMario()
        } else {
            // mario is dying
            this.isDying = true

            // sets acceleration, velocity and speed to zero
            // stop all animations
            this.body.stop()
            this.anims.stop()

            // make last dead jump and turn off collision check
            this.body.setVelocityY(-180)

            // this.body.checkCollision.none did not work for me
            this.body.checkCollision.up = false
            this.body.checkCollision.down = false
            this.body.checkCollision.left = false
            this.body.checkCollision.right = false
        }
    }

    public dance() {
        this.isDancing = true
        this.currentScene.tweens.add({
            targets: this,
            duration: 1000, // duration of each tween, in milliseconds
            ease: 'Linear', // easing function to use
            yoyo: true, // whether to yoyo the tween (play it in reverse after it completes)
            repeat: -1, // number of times to repeat the tween (-1 means repeat indefinitely)
            x: 744,
        })
        this.currentScene.time.delayedCall(3000, () => {
            this.currentScene.scene.start('MenuScene')
        })
    }
}