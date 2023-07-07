import { AnimatedTiles } from './plugins/AnimatedTiles'
import { BootScene } from './scenes/boot-scene'
import { GameScene } from './scenes/game-scene'
import { HUDScene } from './scenes/hud-scene'
import { MenuScene } from './scenes/menu-scene'

export const GameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Super Mario Land',
    url: 'https://github.com/digitsensitive/phaser3-typescript',
    version: '2.0',
    width: 320,
    height: 288,
    zoom: 5,
    type: Phaser.AUTO,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MenuScene, HUDScene, GameScene],
    plugins: {
        scene: [
            {
                key: AnimatedTiles.key,
                plugin: AnimatedTiles,
                mapping: AnimatedTiles.mapping,
                start: true,
            },
        ],
    },
    input: {
        keyboard: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 475 },
            debug: false,
        },
    },
    backgroundColor: '#f8f8f8',
    render: { pixelArt: true, antialias: false },
}
