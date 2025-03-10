import * as PIXI from 'pixi.js'

const PICKER_GLASS_PARENT_W_MULT = 0.02;
const PICKER_GLASS_PARENT_SCALE = 1.04;

export default class ColorPicker {
    private loadAssets = async () => {
        await PIXI.Assets.load('assets/IconColorPicker.svg');
        await PIXI.Assets.load('assets/SelectedColor.svg');
        await PIXI.Assets.load('assets/SelectedColor.png');
    }

    private initColorPicker = (app: PIXI.Application, scene: PIXI.Sprite) => {
        const colorPickerIcon = 'url(\'assets/IconColorPicker.svg\') 0 16, auto';
        app.renderer.events.cursorStyles.default = colorPickerIcon;
        scene.interactive = true;
    }

    init = async (app: PIXI.Application, scene: PIXI.Sprite) => {
        const pixels = await app.renderer.extract.pixels(scene);
        await this.loadAssets();
        const selectedColorValue = new PIXI.Text({
            text: '',
            style: {
                fontSize: 24
            }
        });
        const activeColorValue = new PIXI.Text({
            text: '',
            style: {
                fontSize: 16,
                fill: 'white'
            }
        });
        const activeColorContainer = new PIXI.Container();
        const activeColorBg = new PIXI.Graphics();

        const colorPicker = new PIXI.Graphics();
        const colorPickerSymbol = PIXI.Sprite.from('assets/IconColorPicker.svg');

        const pickerGlassContainer = new PIXI.Container();
        const pickerGlass = PIXI.Sprite.from('assets/SelectedColor.png');
        const pickerGlassOverlay = PIXI.Sprite.from('assets/SelectedColor.png');
        const pickerGlassMask = new PIXI.Graphics();
        const pickerGlassMaskOverlay = new PIXI.Graphics();

        const neighborsPixelsContainer = new PIXI.Container();
        const magnifyingPixelsContainer = new PIXI.Container();
        const magnifyingPixelsMask = new PIXI.Graphics();

        activeColorBg.roundRect(0, 0, 80, 20, 8).fill({
            color: 0x777777,
            alpha: 1
        });
        activeColorContainer.addChildAt(activeColorBg, 0);
        activeColorContainer.addChildAt(activeColorValue, 1);
        activeColorValue.position.x = 12;
        activeColorContainer.position.x = 43;
        activeColorContainer.position.y = 120;
        selectedColorValue.position.x = screen.width / 2 - 4;
        selectedColorValue.position.y = 5;
        
        pickerGlassContainer.visible = false;
        pickerGlassOverlay.scale = PICKER_GLASS_PARENT_SCALE;
        pickerGlassMask.rect(0, 0, pickerGlass.width, pickerGlass.height).fill({
            color: 0xaaaaaa,
            alpha: 1
        });
        pickerGlassMaskOverlay.rect(0, 0, pickerGlass.width * PICKER_GLASS_PARENT_SCALE, pickerGlass.height * PICKER_GLASS_PARENT_SCALE).fill({
            color: 0x888888,
            alpha: 1
        });
        pickerGlassMask.position.x += pickerGlass.width * PICKER_GLASS_PARENT_W_MULT;
        pickerGlassMask.position.y += pickerGlass.height * PICKER_GLASS_PARENT_W_MULT;
        pickerGlass.position.x += pickerGlass.width * PICKER_GLASS_PARENT_W_MULT;
        pickerGlass.position.y += pickerGlass.height * PICKER_GLASS_PARENT_W_MULT;
        pickerGlassMask.mask = pickerGlass;
        pickerGlassMaskOverlay.mask = pickerGlassOverlay;
        
        pickerGlassContainer.addChildAt(magnifyingPixelsContainer, 0);
        pickerGlassContainer.addChildAt(pickerGlassMaskOverlay, 1);
        pickerGlassContainer.addChildAt(pickerGlassOverlay, 2);
        pickerGlassContainer.addChildAt(pickerGlassMask, 3);
        pickerGlassContainer.addChildAt(pickerGlass, 4);
        pickerGlassContainer.addChildAt(activeColorContainer, 5);

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
            this.initColorPicker(app, scene);
        }

        scene.position.y += 50;
        scene.onmouseover = () => {
            pickerGlassContainer.visible = true;
        }
        scene.onmouseout = () => {
            pickerGlassContainer.visible = false;
        }

        scene.onclick = (e) => {
            let x = Math.round(e.globalX - scene.position.x);
            let y = Math.round(e.globalY - scene.position.y);
            let w = Math.round(scene.width);

            let pixelR = pixels.pixels[4 * (y * w + x)];
            let pixelG = pixels.pixels[4 * (y * w + x) + 1];
            let pixelB = pixels.pixels[4 * (y * w + x) + 2];
            let pixelA = pixels.pixels[4 * (y * w + x) + 3];
            selectedColorValue.text = new PIXI.Color(new Uint8Array([pixelR, pixelG, pixelB, pixelA])).toHex();
        }
        scene.onmousemove = (e) => {
            let x = Math.round(e.globalX - scene.position.x);
            let y = Math.round(e.globalY - scene.position.y);
            let w = Math.round(scene.width);

            neighborsPixelsContainer.removeChildren();

            let pixelR = pixels.pixels[4 * (y * w + x)];
            let pixelG = pixels.pixels[4 * (y * w + x) + 1];
            let pixelB = pixels.pixels[4 * (y * w + x) + 2];
            let pixelA = pixels.pixels[4 * (y * w + x) + 3];

            activeColorValue.text = new PIXI.Color(new Uint8Array([pixelR, pixelG, pixelB, pixelA])).toHex();
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

        app.stage.addChild(selectedColorValue);
        app.stage.addChild(colorPicker);
        app.stage.addChild(pickerGlassContainer);
    }
}
