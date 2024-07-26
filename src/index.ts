import * as PIXI from 'pixi.js'
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
    const pickerGlassContainer = new PIXI.Container();
    pickerGlassContainer.visible = false;
    const pickerGlass = PIXI.Sprite.from('assets/SelectedColor.png');
    const pickerGlassOverlay = PIXI.Sprite.from('assets/SelectedColor.png');
    pickerGlassOverlay.scale = 1.04;

    const pickerGlassMask = new PIXI.Graphics();
    pickerGlassMask.rect(0, 0, pickerGlass.width, pickerGlass.height).fill({
        color: 0xaaaaaa,
        alpha: 1
    });
    const pickerGlassMaskOverlay = new PIXI.Graphics();
    pickerGlassMaskOverlay.rect(0, 0, pickerGlass.width * 1.04, pickerGlass.height * 1.04).fill({
        color: 0x888888,
        alpha: 1
    });
    pickerGlassMask.position.x += pickerGlass.width * 0.02;
    pickerGlassMask.position.y += pickerGlass.height * 0.02;
    pickerGlass.position.x += pickerGlass.width * 0.02;
    pickerGlass.position.y += pickerGlass.height * 0.02;

    pickerGlassMask.mask = pickerGlass;
    pickerGlassMaskOverlay.mask = pickerGlassOverlay;
    

    let skyScene = PIXI.Sprite.from('assets/sky-scene.jpg');
    
    skyScene.position.y += 50;
    skyScene.onmouseover = () => {
        pickerGlassContainer.visible = true;
    }
    skyScene.onmouseout = () => {
        pickerGlassContainer.visible = false;
    }
    
    let pixels = await app.renderer.extract.pixels(skyScene);
    const neighborsPixelsContainer = new PIXI.Container();
    const magnifyingPixelsContainer = new PIXI.Container();
    const magnifyingPixelsMask = new PIXI.Graphics();
    pickerGlassContainer.addChildAt(magnifyingPixelsContainer, 0);
    pickerGlassContainer.addChildAt(pickerGlassMaskOverlay, 1);
    pickerGlassContainer.addChildAt(pickerGlassOverlay, 2);
    pickerGlassContainer.addChildAt(pickerGlassMask, 3);
    pickerGlassContainer.addChildAt(pickerGlass, 4);
    skyScene.onmousemove = (e) => {
        let x = Math.round(e.globalX - skyScene.position.x);
        let y = Math.round(e.globalY - skyScene.position.y);
        let w = Math.round(skyScene.width);
        neighborsPixelsContainer.removeChildren();
        let pixelR = pixels.pixels[4 * (y * w + x)];
        let pixelG = pixels.pixels[4 * (y * w + x) + 1];
        let pixelB = pixels.pixels[4 * (y * w + x) + 2];
        let pixelA = pixels.pixels[4 * (y * w + x) + 3];
        for (let i = -7; i<=7; i++) {
            for (let j = -7; j<=7; j++) {
                let pixelR = pixels.pixels[4 * ((y + i) * w + x + j)];
                let pixelG = pixels.pixels[4 * ((y + i) * w + x + j) + 1];
                let pixelB = pixels.pixels[4 * ((y + i) * w + x + j) + 2];
                let pixelA = pixels.pixels[4 * ((y + i) * w + x + j) + 3];
                const hexColor = new PIXI.Color(new Uint8Array([pixelR, pixelG, pixelB, pixelA])).toArray();
                const pixelatedSquare = new PIXI.Graphics();
                pixelatedSquare.clear();
                pixelatedSquare.rect((j + 7) * 10, (i + 7) * 10, 10, 10).fill({
                    color: hexColor,
                    alpha: 1
                }).stroke({
                    color: j === 0 && i === 0 ? '0x444444' : '0xcccccc',
                    width: j === 0 && i === 0 ? 2 : 1,
                    alpha: 0.3
                });
                neighborsPixelsContainer.addChild(pixelatedSquare);
           }
        }
        magnifyingPixelsContainer.addChild(neighborsPixelsContainer);
        magnifyingPixelsContainer.addChild(magnifyingPixelsMask);
        neighborsPixelsContainer.position.x = pickerGlass.position.x + 4.5;
        neighborsPixelsContainer.position.y = pickerGlass.position.y + 4.5;
        magnifyingPixelsMask.clear();
        magnifyingPixelsMask.circle(0, 0, (pickerGlass.width - 12) / 2).fill({
            color: 'black',
            alpha: 1
        });
        magnifyingPixelsMask.position.x = pickerGlass.position.x + 6 + magnifyingPixelsMask.width / 2;
        magnifyingPixelsMask.position.y = pickerGlass.position.y + 6 + magnifyingPixelsMask.height / 2;
        neighborsPixelsContainer.mask = magnifyingPixelsMask;
        pickerGlassContainer.position.x = x + 15;
        pickerGlassContainer.position.y = y - 35;
        pickerGlassMask.clear();
        pickerGlassMask.rect(0, 0, pickerGlass.width, pickerGlass.height).fill({
            color: new PIXI.Color(new Uint8Array([pixelR, pixelG, pixelB, pixelA])).toArray(),
            alpha: 1
        });
        pickerGlassMask.mask = pickerGlass;
    }
    let colorPicker = new PIXI.Graphics();
    let colorPickerSymbol = PIXI.Sprite.from('assets/IconColorPicker.svg');
    colorPickerSymbol.position.x = 16;
    colorPickerSymbol.position.y = 16;
    colorPicker.circle(25, 25, colorPickerSymbol.width).fill({
        color: 0xaaaaaa,
        alpha: 0.5
    });
    colorPicker.addChild(colorPickerSymbol);
    colorPicker.eventMode = 'static';
    colorPicker.cursor = 'pointer';
    colorPicker.onclick = () => {
        initColorPicker(app, skyScene);
    }

    app.stage.addChild(skyScene);
    app.stage.addChild(colorPicker);
    app.stage.addChild(pickerGlassContainer);
}

const initColorPicker = (app: PIXI.Application, scene: PIXI.Sprite) => {
    const colorPickerIcon = 'url(\'assets/IconColorPicker.svg\') 0 16, auto';
    app.renderer.events.cursorStyles.default = colorPickerIcon;
    scene.interactive = true;
}

const loadAssets = async () => {
    await PIXI.Assets.load('assets/sky-scene.jpg');
    await PIXI.Assets.load('assets/IconColorPicker.svg');
    await PIXI.Assets.load('assets/SelectedColor.svg');
    await PIXI.Assets.load('assets/SelectedColor.png');
}
main();