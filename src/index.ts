import * as PIXI from 'pixi.js'
import ColorPicker from './color-picker';

const MAX_DIMENSIONS = 4000;

const main = async () => {
    const app = new PIXI.Application({
        eventFeatures: {
            move: true,
            /** disables the global move events which can be very expensive in large scenes */
            globalMove: false,
            click: true,
            wheel: true,
        }
    });
    await app.init({
        width: MAX_DIMENSIONS,
        height: MAX_DIMENSIONS,
        backgroundAlpha: 0
    });
    document.body.appendChild(app.canvas);

    await loadAssets();

    const skyScene = PIXI.Sprite.from('assets/sky-scene.jpg');

    app.stage.addChild(skyScene);

    const colorPicker = new ColorPicker();
    colorPicker.init(app, skyScene);
}

const loadAssets = async () => {
    await PIXI.Assets.load('assets/sky-scene.jpg');
}
main();