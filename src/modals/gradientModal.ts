import { HSL, Modal, Setting } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { AngleUnit, ColorStop, GradientNode, LengthNode, LinearGradientNode, parse, RadialGradientNode, stringify } from "gradient-parser"




const convertHslToHex = (hsl: HSL) => {
    let {h, s, l} = hsl
    l = l / 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}



const getContrastHexColor = (baseHue: number, saturation: number) => {
    const hueOptions = [0, 120, 180, 240]
    const chosenShift = hueOptions[Math.floor(Math.random() * hueOptions.length)] || 0
    const microShift = Math.floor(Math.random() * 31) - 15; 
    const hue = (baseHue + chosenShift + microShift + 360) % 360;

    const lightness = Math.random() > 0.5 
      ? Math.floor(Math.random() * 20) + 70  
      : Math.floor(Math.random() * 20) + 25; 

    return convertHslToHex({h: hue, s: saturation, l: lightness});
}



export const generateRandomGradient = () => {
  const randomPercent = () => Math.floor(Math.random() * 101);
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 90

  const types = ['linear', 'radial', 'mesh'];
  const chosenType = types[Math.floor(Math.random() * types.length)];

  if (chosenType === 'linear') {
    const angle = Math.floor(Math.random() * 360);
    return `linear-gradient(${angle}deg, ${getContrastHexColor(baseHue, saturation)}, ${getContrastHexColor(baseHue, saturation)})`;
  } 
  
  else if (chosenType === 'radial') {
    const shape = Math.random() > 0.5 ? 'circle' : 'ellipse';
    return `radial-gradient(${shape} at ${randomPercent()}% ${randomPercent()}%, ${getContrastHexColor(baseHue, saturation)}, ${getContrastHexColor(baseHue, saturation)})`;
  } 
  
  else {
    const layersCount = Math.floor(Math.random() * 4) + 2; // 4 или 5 контрастных пятен
    const layers = [];
    
    for (let i = 0; i < layersCount; i++) {
      const shape = Math.random() > 0.5 ? "circle" : "ellipse";
      // Уменьшаем радиус прозрачности до 55-65%, чтобы границы пятен были более четкими и контрастными
      const radius = Math.floor(Math.random() * 15) + 50; 
      layers.push(`radial-gradient(${shape} at ${randomPercent()}% ${randomPercent()}%, ${getContrastHexColor(baseHue, saturation)} 0px, transparent ${radius}%)`);
    }
    
    // Создаем нижнюю подложку базового цвета
    const baseColor = convertHslToHex({h: baseHue, s: saturation, l: 45})
    layers.push(`radial-gradient(at 50% 50%, ${baseColor} 100%, transparent 100%)`);
    
    return layers.join(', ');
  }
}





const ColorStopNode = class {
    type: "literal" | "hex" | "rgb" | "rgba" | "hsl" | "hsla" | "var"
    value: string
    length: LengthNode

  constructor(value: string, length: string) {
    this.type = "hex"
    this.value = value
    this.length = {
      type: "%",
      value: length
    }
  }
}



class PositionAt {
  constructor(xPos, yPos) {
    this.type = "position",
    this.value = {
      x: { type: "%", value: xPos },
      y: { type: "%", value: yPos }
    }
  }
}



class PositionOrientation {

  constructor(xPos: string, yPos: string) {
    this.at = new PositionAt(xPos, yPos)
    this.hasAtKeyword = true
    this.type = "default-radial"
  }
}



class PositionGradient {
  constructor(color, colorLength, transparentLength, xPos, yPos) {
    this.type = "radial-gradient",
    this.orientation = [new PositionOrientation(xPos, yPos)],
    this.colorStops = [
      new ColorStopNode(color, colorLength),
      new ColorStopNode("00000000", transparentLength)
    ]
  }
}




const createColorLengthSlider = (color: ColorStop, setting: Setting, updateCallback: () => void) => {
  setting.addSlider(
    (slider) => {
      var _a2;
      slider.setLimits(0, 100, 1);
      slider.setDynamicTooltip();
      let sliderValue = color.length?.value || 0
      return slider.setValue(Number(sliderValue)).onChange((value) => {
        if (!color.length) {
          color.length = {
            value: "0",
            type: "%"
          };
        }
        color.length.value = value.toString();
        updateCallback();
      });
    }
  )
}



const createPositionSlider = (container: HTMLElement, gradient: RadialGradientNode, updateCallback: () => void) => {
  new Setting(container).setName("Position X / Y").addSlider(
    (slider) => {
      var _a, _b;
      slider.setLimits(0, 100, 1);
      slider.setDynamicTooltip();


      let orientation = gradient.orientation[0]

     
      return slider.setValue(Number(gradient.orientation[0].at?.value.x?.value)).onChange((value) => {
        let valueString = value.toString();

        if (!orientation.at) {
          orientation.at = new PositionAt("50", "50")
        }

        gradient.orientation[0].at.value.x.value = valueString;
        updateCallback()
      });
    }
  ).addSlider(
    (slider) => {
      var _a, _b;
      slider.setLimits(0, 100, 1);
      slider.setDynamicTooltip();
      return slider.setValue(Number(gradient.orientation[0].at?.value.y?.value)).onChange((value) => {
        let valueString = value.toString();
        gradient.orientation[0].at.value.y.value = valueString;
        updateCallback()
      });
    }
  )
} 



const createColorStopSetting = (
    gradient: GradientNode,
    color: ColorStop, 
    idx: number, 
    contentEl: HTMLElement, 
    updateCallback: () => void, 
    onDeleteColor: (idx: number) => void, 
    gradientType: string
) => {
  let colorHex: string
  let colorAlpha: string
  let alpha = 100;
  if (color.type == "hex") {
    colorHex = color.value.slice(0, 6);
    colorAlpha = color.value.slice(6);
    if (colorAlpha) {
      alpha = parseInt(colorAlpha, 16) || 100;
    }
    alpha = alpha * 100 / 255;
    if (colorAlpha === "00") {
      alpha = 0;
    }
    else if (colorAlpha === "") {
      alpha = 100;
    }
    if (!color.length) {
      color.length = { type: "%", value: "0" };
    }
  } else if (color.type == "literal" && color.value == "transparent") {
    colorHex = "000000";
    colorAlpha = "00";
    alpha = 0
  }

  let settingName = "Color / Opacity"

  if (gradientType == "shape") {
    settingName = "Color / Opacity / Size"
  }

  let colorSetting = new Setting(contentEl).setName(settingName)
  
  if (gradientType == "mesh") {

    let radialType = gradient.orientation[0].value || "ellipse"

    colorSetting.addDropdown((drop) => drop.addOptions({
      "circle": "circle",
      "ellipse": "ellipse"
    }).setValue(radialType).onChange((value) => {
      gradient.orientation[0].value = value;
      updateCallback();
    }))

  }





  
  
  colorSetting.addColorPicker((colorPicker) => {
    colorPicker.setValue("#" + colorHex);
    colorPicker.onChange((value) => {
      colorHex = value.replace("#", "");
      color.type = "hex";
      color.value = colorHex + colorAlpha;
      updateCallback();
    });
    return colorPicker;
  }).addSlider(
    (slider) => {
      slider.setLimits(0, 100, 1);
      slider.setDynamicTooltip();
      return slider.setValue(alpha).onChange((value) => {
        colorAlpha = Math.floor(value * 255 / 100).toString(16);
        if (value == 100) {
          colorAlpha = "";
        } else if (value == 0) {
          colorAlpha = "00";
        }
        if (colorAlpha.length == 1) colorAlpha = "0" + colorAlpha;
        color.value = colorHex + colorAlpha;
        color.type = "hex";
        updateCallback();
      });
    }
  )


  if (gradientType == "shape") {
    createColorLengthSlider(color, colorSetting, updateCallback)
  }
  
  

  colorSetting.addExtraButton((btn) => {
    btn.setIcon("x")
    .onClick(() => {
      onDeleteColor(idx)
    })
    return btn
  })
}



const createGradientButtonsSetting = (contentEl, modal) => {
  const addColorFunc = (modal) => {
    if (modal instanceof LinearGradientModal || modal instanceof RadialGradientModal) {
      let newColor = new ColorStopNode("0000ff", "100");
      modal.gradientData[0].colorStops.push(newColor);
    } else if (modal instanceof MeshGradientModal) {
      modal.gradientData.push(new PositionGradient("ff0000", "0", "50", "50", "50"))
    }
  }

  const randomizeGradient = (modal) => {
    if (modal instanceof LinearGradientModal) {
      modal.gradientData[0] = createRandomLinearGradientData()
    } else if (modal instanceof RadialGradientModal) {
      modal.gradientData[0] = createRandomRadialGradientData()
    } else if (modal instanceof MeshGradientModal) {
      modal.gradientData = createRandomMeshGradientData()
    }
  }

  new Setting(contentEl)
  .setClass("gradient-modal-buttons")
  .addButton(
    (btn) => {
      btn.setButtonText("Add color");
      btn.onClick(() => {
        addColorFunc(modal)
        modal.onOpen()
      });
    }
  ).addButton(
    (btn) => {
      btn.setButtonText("Randomize");
      btn.onClick(() => {
        randomizeGradient(modal)
        modal.onOpen()
      });
    }
  ).addButton(
    (btn) => {
      btn.setButtonText("Save gradient");
      btn.setCta();
      btn.onClick(() => {
        let cssString = stringify(modal.gradientData);
        cssString = cssString.replace(" #00000000 ", " transparent ")
        modal.saveCallback(cssString);
        modal.close();
      });
    }
  )


}





const createRandomLinearGradientData = () => {
  const angle = Math.floor(Math.random() * 360)
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 90;

  let data = {
    type: "linear-gradient",
    orientation: {
      type: "angular",
      unit: "deg",
      value: angle.toString()
    },
    colorStops: [
      new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "0"),
      new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "100")
    ]
  }

  return data
}



const createRandomRadialGradientData = () => {

  const randomPercent = () => Math.floor(Math.random() * 101)
  const shape = Math.random() > 0.5 ? "circle" : "ellipse"
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 90;

  let data = {
    type: "radial-gradient",
    orientation: [{
      type: "shape",
      value: shape,
      at: {
        type: "position",
        value: {
          x: { type: "%", value: randomPercent().toString() },
          y: { type: "%", value: randomPercent().toString() }
        }
      }
    }],
    colorStops: [
      new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "0"),
      new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "100")
    ]
  }

  return data
}



const createRandomMeshGradientData = () => {
  const randomPercent = () => Math.floor(Math.random() * 101)
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 90;
  const baseColor = convertHslToHex({ h: baseHue, s: saturation, l: 45 })


  //const layersCount = Math.floor(Math.random() * 2) + 4

  //const layersCount = Math.floor(Math.random() * 3) + 3

  const layersCount = Math.floor(Math.random() * 4) + 2


  const data = []



  for (let i = 0; i < layersCount; i++) {
    const radius = (Math.floor(Math.random() * 15) + 50).toString()
    const shape = Math.random() > 0.5 ? "circle" : "ellipse"

    

    let layer = {
      type: "radial-gradient",
      orientation: [{
        type: "shape",
        value: shape,
        at: {
          type: "position",
          value: {
            x: { type: "%", value: randomPercent().toString() },
            y: { type: "%", value: randomPercent().toString() }
          }
        }
      }],
      colorStops: [
        new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "0"),
        new ColorStopNode("00000000", radius)
      ]
    }

    data.push(layer)

    
  }


  data.push({
    type: "radial-gradient",
    orientation: [{
      type: "default-radial",
      hasAtKeyword: true,
      at: {
        type: "position",
        value: {
          x: { type: "%", value: "50" },
          y: { type: "%", value: "50" }
        }
      }
    }],
    colorStops: [
      new ColorStopNode(baseColor.replace("#", ""), "100"),
      new ColorStopNode("00000000", "100")
    ]
  })


  return data
}




const updatePreview = (previewEl: HTMLElement, gradientData: GradientNode[]) => {
  let cssString = stringify(gradientData);
  cssString = cssString.replace(" #00000000 ", " transparent ")
  previewEl.style.backgroundImage = cssString;
}












export class LinearGradientModal extends Modal {
    gradientData: GradientNode[]
    saveCallback: (cssString: string) => void

    constructor(plugin: PrettyPropertiesPlugin, bannerValue: string | null | undefined, saveCallback: (cssString: string) => void) {
        super(plugin.app)
        this.saveCallback = saveCallback;

        this.gradientData = [createRandomLinearGradientData()]

        if (bannerValue) {
          try {
            let parsed = parse(bannerValue);
            if (parsed && parsed.length > 0) {
    
              if (parsed[0].type == "linear-gradient") {
                this.gradientData = [parsed[0]]
              } else if (parsed[0].type == "radial-gradient") {
                this.gradientData[0].colorStops = parsed[0].colorStops
              } 
            }
          } catch (err) {
        }
        }

  }


  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const previewElWrapper = contentEl.createEl("div", { cls: "gradient-preview-wrapper" })
    const previewEl = previewElWrapper.createEl("div", { cls: "gradient-preview-box" })

    updatePreview(previewEl, this.gradientData);

    let gradient = this.gradientData[0] as LinearGradientNode

    

    new Setting(contentEl).setName("Angle (deg)").addSlider(
      (slider) => {
        slider.setLimits(0, 360, 1);
        slider.setDynamicTooltip();
        var _a2;
        return slider.setValue(Number(gradient.orientation?.value)).onChange((value) => {
            let valueString = value.toString();
            gradient.orientation = gradient.orientation || {
            type: "angular",
            unit: "deg",
            value: valueString
            };
            gradient.orientation.value = valueString;
          updatePreview(previewEl, this.gradientData);
        });
      }
    );
    
    for (let idx = 0; idx < gradient.colorStops.length; idx++) {
      let color = gradient.colorStops[idx]!

      const onDeleteColor = (idx) => {
        this.gradientData[0].colorStops.splice(idx, 1)
        this.onOpen()
      }

      createColorStopSetting(gradient, color, idx, contentEl, () => updatePreview(previewEl, this.gradientData), onDeleteColor, "shape")
    }

    createGradientButtonsSetting(contentEl, this)
  }
  onClose() {
    this.contentEl.empty();
  }
}





export class RadialGradientModal extends Modal {
  gradientData: GradientNode[]
    saveCallback: (cssString: string) => void

    constructor(plugin: PrettyPropertiesPlugin, bannerValue: string | null | undefined, saveCallback: (cssString: string) => void) {
    super(plugin.app)
    this.saveCallback = saveCallback;

    this.gradientData = [createRandomRadialGradientData()]

    if (bannerValue) {
      try {
              let parsed = parse(bannerValue);
      
              if (parsed && parsed.length > 0) {
                if (parsed[0].type == "radial-gradient") {
                  this.gradientData = [parsed[0]]
                } else if (parsed[0].type == "linear-gradient") {
                  this.gradientData[0].colorStops = parsed[0].colorStops
                } 
              }
            } catch (err) {
      }
    }
  }


  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const previewElWrapper = contentEl.createEl("div", { cls: "gradient-preview-wrapper" })
    const previewEl = previewElWrapper.createEl("div", { cls: "gradient-preview-box" })

    updatePreview(previewEl, this.gradientData)

    let gradient = this.gradientData[0] as RadialGradientNode





    let radialType = gradient.orientation?.[0]?.value || "ellipse"

    new Setting(contentEl).setName("Radial gradient type").addDropdown((drop) => drop.addOptions({
        "circle": "circle",
        "ellipse": "ellipse"
    }).setValue(radialType).onChange((value) => {
      gradient.orientation[0].value = value
      this.onOpen();
    }));


    createPositionSlider(contentEl, gradient, () => updatePreview(previewEl, this.gradientData))

    for (let idx = 0; idx < gradient.colorStops.length; idx++) {
      let color = gradient.colorStops[idx]!

      const onDeleteColor = (idx) => {
        this.gradientData[0].colorStops.splice(idx, 1)
        this.onOpen()
      }

      createColorStopSetting(gradient, color, idx, contentEl, () => updatePreview(previewEl, this.gradientData), onDeleteColor, "shape")
    }

    createGradientButtonsSetting(contentEl, this)
  }
  onClose() {
    this.contentEl.empty();
  }
}





export class MeshGradientModal extends Modal {
  constructor(plugin, bannerValue, saveCallback) {
    super(plugin.app);
    this.saveCallback = saveCallback;

    this.gradientData = createRandomMeshGradientData()

    if (bannerValue) {
      try {
        let parsed = parse(bannerValue);

        if (parsed && parsed.length > 0) {
          if (parsed.length > 1) {
            this.gradientData = parsed
          } else {
            parsed[0].colorStops = [parsed[0].colorStops[0], parsed[0].colorStops[1]]
            parsed[0].colorStops[1].type = "hex"
            parsed[0].colorStops[1].value = "00000000"

            if (parsed[0].type == "radial-gradient") {
              this.gradientData = parsed
            } else if (parsed[0].type == "linear-gradient") {
              this.gradientData = [this.gradientData[0]]
              this.gradientData[0].colorStops = parsed[0].colorStops
            } 
          }

        }
      } catch (err) {
      }
    }

    
  }


  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const previewElWrapper = contentEl.createEl("div", { cls: "gradient-preview-wrapper" })
    const previewEl = previewElWrapper.createEl("div", { cls: "gradient-preview-box" })

    updatePreview(previewEl, this.gradientData)


    for (let idx = 0; idx < this.gradientData.length; idx++) {

      let gradient = this.gradientData[idx]

      let gradientWrapper = contentEl.createEl("div", {cls: "pp-gradient-color-wrapper"})

      const onDeleteColor = (idx) => {
        this.gradientData.splice(idx, 1)
        this.onOpen()
      }


      let color = gradient.colorStops[0]
      createColorStopSetting(gradient, color, idx, gradientWrapper, () => updatePreview(previewEl, this.gradientData), onDeleteColor, "mesh")

      let transparentColor = gradient.colorStops[1]

      let colorLengthSetting = new Setting(gradientWrapper).setName("Size color / transparent")

      createColorLengthSlider(color, colorLengthSetting, () => updatePreview(previewEl, this.gradientData))

      colorLengthSetting.addSlider(
        (slider) => {
          var _a2;
          slider.setLimits(0, 100, 1);
          slider.setDynamicTooltip();
          let sliderValue = ((_a2 = transparentColor.length) == null ? void 0 : _a2.value) || 0;
          return slider.setValue(Number(sliderValue)).onChange((value) => {
            if (!transparentColor.length) {
              transparentColor.length = {
                value: "0",
                type: "%"
              };
            }
            transparentColor.length.value = value.toString();
            updatePreview(previewEl, this.gradientData)
          });
        }
      )

      createPositionSlider(gradientWrapper, gradient, () => updatePreview(previewEl, this.gradientData))
      

    }

    createGradientButtonsSetting(contentEl, this)
  }
  onClose() {
    this.contentEl.empty();
  }
}





















