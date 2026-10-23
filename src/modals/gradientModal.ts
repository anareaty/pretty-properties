import { HSL, Modal, Setting, Platform } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { ColorStop, DefaultRadialNode, GradientNode, LengthNode, LinearGradientNode, LinearOrientation, parse, PositionKeywordNode, PositionNode, RadialGradientNode, RadialOrientation, ShapeNode, stringify } from "gradient-parser"
import { i18n } from "src/localization/localization";




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
    return `linear-gradient(${angle}deg, ${getContrastHexColor(baseHue, saturation)}, ${getContrastHexColor(baseHue, saturation)} 100%)`;
  } 
  
  else if (chosenType === 'radial') {
    const shape = Math.random() > 0.5 ? 'circle' : 'ellipse';
    return `radial-gradient(${shape} at ${randomPercent()}% ${randomPercent()}%, ${getContrastHexColor(baseHue, saturation)}, ${getContrastHexColor(baseHue, saturation)} 100%)`;
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
  type: "position"
  value: {
    x?: LengthNode | PositionKeywordNode;
    y?: LengthNode | PositionKeywordNode;
}
  constructor(xPos: string, yPos: string) {
    this.type = "position"
    this.value = {
      x: { type: "%", value: xPos },
      y: { type: "%", value: yPos }
    }
  }
}



class PositionOrientation {
  at: PositionNode
  hasAtKeyword: boolean
  type: string

  constructor(xPos: string, yPos: string) {
    this.at = new PositionAt(xPos, yPos)
    this.hasAtKeyword = true
    this.type = "default-radial"
  }
}



class PositionGradient {
  type: string
  orientation: PositionOrientation[]
  colorStops: ColorStop[]
  constructor(color: string, colorLength: string, transparentLength: string, xPos: string, yPos: string) {
    this.type = "radial-gradient"
    this.orientation = [new PositionOrientation(xPos, yPos)]
    this.colorStops = [
      new ColorStopNode(color, colorLength) as ColorStop,
      new ColorStopNode("00000000", transparentLength)  as ColorStop
    ]
  }
}




const createColorLengthSlider = (color: ColorStop, setting: Setting, updateCallback: () => void) => {
  setting.addSlider(
    (slider) => {
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
  new Setting(container).setName(i18n.t("POSITION") + " X / Y").addSlider(
    (slider) => {
      slider.setLimits(0, 100, 1);
      slider.setDynamicTooltip();


      let orientation = gradient.orientation![0]

     
      return slider.setValue(Number(gradient.orientation![0]!.at?.value.x?.value)).onChange((value) => {
        let valueString = value.toString();

        if (!orientation!.at) {
          orientation!.at = new PositionAt("50", "50")
        }

        gradient.orientation![0]!.at!.value.x!.value = valueString;
        updateCallback()
      });
    }
  ).addSlider(
    (slider) => {
      slider.setLimits(0, 100, 1);
      slider.setDynamicTooltip();
      return slider.setValue(Number(gradient.orientation![0]!.at?.value.y?.value)).onChange((value) => {
        let valueString = value.toString();
        gradient.orientation![0]!.at!.value.y!.value = valueString;
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




  if (color.type == "rgba" || color.type == "hsla") {
    alpha = Number(color.value[3]) * 100

    colorAlpha = Math.floor(alpha * 255 / 100).toString(16);
    if (alpha == 100) {
      colorAlpha = ""
    } else if (alpha == 0) {
      colorAlpha = "00"
    }
    if (colorAlpha.length == 1) colorAlpha = "0" + colorAlpha
  }


  if (color.type == "rgb" || color.type == "hsl") {
    alpha = 100
    colorAlpha = ""
  }


  if (color.type == "rgba" || color.type == "rgb") {
    let value = color.value.slice(0,3)
    colorHex = value.map(x => Number(x).toString(16).padStart(2, "0")).join("")
  }


  if (color.type == "hsla" || color.type == "hsl") {
    let value = color.value.slice(0,3)
    colorHex = convertHslToHex({ h: Number(value[0]), s: Number(value[1]), l: Number(value[2]) })
    colorHex = colorHex.replace("#", "")
  }

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

  

  let settingName = i18n.t("TYPE") + " / " + i18n.t("COLOR") + " / " + i18n.t("OPACITY")

  if (gradientType == "shape") {
    settingName = i18n.t("COLOR") + " / " + i18n.t("OPACITY") + " / " + i18n.t("SIZE")
  }

  let colorSetting = new Setting(contentEl).setName(settingName)
  
  if (gradientType == "mesh") {

    let orientation = gradient.orientation as RadialOrientation[]
    let orientationNode = orientation[0]! as ShapeNode



    let radialType = orientationNode.value || "ellipse"
    

    

    colorSetting.addDropdown((drop) => drop.addOptions({
      "circle": i18n.t("CIRCLE_GRAD"),
      "ellipse": i18n.t("ELLIPSE_GRAD")
    }).setValue(radialType).onChange((value) => {
      orientationNode.value = value as "circle" | "ellipse"
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
          colorAlpha = ""
        } else if (value == 0) {
          colorAlpha = "00"
        }
        if (colorAlpha.length == 1) colorAlpha = "0" + colorAlpha
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



const createGradientButtonsSetting = (contentEl: HTMLElement, modal: LinearGradientModal | RadialGradientModal | MeshGradientModal) => {
  const addColorFunc = (modal: LinearGradientModal | RadialGradientModal | MeshGradientModal) => {
    if (modal instanceof LinearGradientModal || modal instanceof RadialGradientModal) {
      let newColor = new ColorStopNode("0000ff", "100") as ColorStop
      modal.gradientData[0]!.colorStops.push(newColor);
    } else if (modal instanceof MeshGradientModal) {
      modal.gradientData.push(new PositionGradient("ff0000", "0", "50", "50", "50") as GradientNode)
    }
  }

  const randomizeGradient = (modal: LinearGradientModal | RadialGradientModal | MeshGradientModal) => {
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
      btn.setButtonText(i18n.t("ADD_COLOR"));

      if (Platform.isMobile) {
        btn.setIcon("plus-circle")
      }

      btn.onClick(() => {
        addColorFunc(modal)
        modal.onOpen()
      });
    }
  ).addButton(
    (btn) => {
      btn.setButtonText(i18n.t("RANDOMIZE"));

      if (Platform.isMobile) {
        btn.setIcon("dice")
      }


      btn.onClick(() => {
        randomizeGradient(modal)
        modal.onOpen()
      });
    }
  ).addButton(
    (btn) => {
      btn.setButtonText(i18n.t("SAVE_GRADIENT"));
      btn.setCta();

      if (Platform.isMobile) {
        btn.setIcon("save")
      }

      btn.onClick(() => {

        console.log(modal.gradientData)
        let cssString = stringify(modal.gradientData);
        cssString = cssString.replace(" #00000000 ", " transparent ")
        modal.saveCallback(cssString);
        modal.close();
      });
    }
  )


}





const createRandomLinearGradientData = (): LinearGradientNode => {
  const angle = Math.floor(Math.random() * 360)
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 90;

  const data = {
    type: "linear-gradient" as const,
    orientation: {
      type: "angular",
      unit: "deg",
      value: angle.toString()
    } as LinearOrientation,
    colorStops: [
      new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "0") as ColorStop,
      new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "100") as ColorStop
    ]
  }

  return data
}



const createRandomRadialGradientData = (): RadialGradientNode => {

  const randomPercent = () => Math.floor(Math.random() * 101)
  const shape = Math.random() > 0.5 ? "circle" : "ellipse"
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 90;

  const data = {
    type: "radial-gradient" as const,
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
    }] as ShapeNode[],
    colorStops: [
      new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "0") as ColorStop,
      new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "100") as ColorStop
    ]
  }

  return data
}



const createRandomMeshGradientData = () : RadialGradientNode[] => {
  const randomPercent = () => Math.floor(Math.random() * 101)
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 90;
  const baseColor = convertHslToHex({ h: baseHue, s: saturation, l: 45 })

  const layersCount = Math.floor(Math.random() * 4) + 2


  const data = []



  for (let i = 0; i < layersCount; i++) {
    const radius = (Math.floor(Math.random() * 15) + 50).toString()
    const shape = Math.random() > 0.5 ? "circle" : "ellipse"

    

    const layer = {
      type: "radial-gradient" as const,
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
      }] as ShapeNode[],
      colorStops: [
        new ColorStopNode(getContrastHexColor(baseHue, saturation).replace("#", ""), "0") as ColorStop,
        new ColorStopNode("00000000", radius) as ColorStop
      ]
    }

    data.push(layer)

    
  }


  data.push({
    type: "radial-gradient" as const,
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
    }] as DefaultRadialNode[],
    colorStops: [
      new ColorStopNode(baseColor.replace("#", ""), "100") as ColorStop,
      new ColorStopNode("00000000", "100") as ColorStop
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


            console.log(parsed)
            if (parsed && parsed.length > 0) {
    
              if (parsed[0]!.type == "linear-gradient") {
                this.gradientData = [parsed[0]!]
              } else if (parsed[0]!.type == "radial-gradient") {
                this.gradientData[0]!.colorStops = parsed[0]!.colorStops
              } 
            }
          } catch (err) {
            void err
            // Not a valid gradient, use random
          }
        }

  }


  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.containerEl.classList.add("pp-gradient-modal")
    const previewElWrapper = contentEl.createEl("div", { cls: "gradient-preview-wrapper" })
    const previewEl = previewElWrapper.createEl("div", { cls: "gradient-preview-box" })

    updatePreview(previewEl, this.gradientData);

    let gradient = this.gradientData[0] as LinearGradientNode

    

    new Setting(contentEl).setName(i18n.t("ANGLE")).addSlider(
      (slider) => {
        slider.setLimits(0, 360, 1);
        slider.setDynamicTooltip();

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

      const onDeleteColor = (idx: number) => {
        this.gradientData[0]!.colorStops.splice(idx, 1)
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
            if (parsed[0]!.type == "radial-gradient") {
              this.gradientData = [parsed[0]!]
            } else if (parsed[0]!.type == "linear-gradient") {
              this.gradientData[0]!.colorStops = parsed[0]!.colorStops
            } 
          }
        } catch (err) {
          void err
          // Not a valid gradient, use random
        }
      }
  }


  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.containerEl.classList.add("pp-gradient-modal")
    const previewElWrapper = contentEl.createEl("div", { cls: "gradient-preview-wrapper" })
    const previewEl = previewElWrapper.createEl("div", { cls: "gradient-preview-box" })

    updatePreview(previewEl, this.gradientData)

    let gradient = this.gradientData[0] as RadialGradientNode




    let orientationNode = gradient.orientation![0]! as ShapeNode
    let radialType = orientationNode.value || "ellipse"

    new Setting(contentEl).setName(i18n.t("RADIAL_GRADIENT_TYPE")).addDropdown((drop) => drop.addOptions({
        "circle": i18n.t("CIRCLE_GRAD"),
        "ellipse": i18n.t("ELLIPSE_GRAD")
    }).setValue(radialType).onChange((value) => {
      
      orientationNode.value = value as "circle" | "ellipse"
      this.onOpen();
    }));


    createPositionSlider(contentEl, gradient, () => updatePreview(previewEl, this.gradientData))

    for (let idx = 0; idx < gradient.colorStops.length; idx++) {
      let color = gradient.colorStops[idx]!

      const onDeleteColor = (idx: number) => {
        this.gradientData[0]!.colorStops.splice(idx, 1)
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
  gradientData: GradientNode[]
  saveCallback: (cssString: string) => void

  constructor(plugin: PrettyPropertiesPlugin, bannerValue: string | null | undefined, saveCallback: (cssString: string) => void) {
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
            parsed[0]!.colorStops = [parsed[0]!.colorStops[0]!, parsed[0]!.colorStops[1]!]
            parsed[0]!.colorStops[1]!.type = "hex"
            parsed[0]!.colorStops[1]!.value = "00000000"

            if (parsed[0]!.type == "radial-gradient") {
              this.gradientData = parsed
            } else if (parsed[0]!.type == "linear-gradient") {
              this.gradientData = [this.gradientData[0]!]
              this.gradientData[0]!.colorStops = parsed[0]!.colorStops
            } 
          }

        }
      } catch (err) {
        void err
        // Not a valid gradient, use random
      }
    }

    
  }


  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.containerEl.classList.add("pp-gradient-modal")
    this.containerEl.classList.add("pp-mesh-gradient-modal")
    const previewElWrapper = contentEl.createEl("div", { cls: "gradient-preview-wrapper" })
    const previewEl = previewElWrapper.createEl("div", { cls: "gradient-preview-box" })

    updatePreview(previewEl, this.gradientData)


    for (let idx = 0; idx < this.gradientData.length; idx++) {

      let gradient = this.gradientData[idx]! as RadialGradientNode

      let gradientWrapper = contentEl.createEl("div", {cls: "pp-gradient-color-wrapper"})

      const onDeleteColor = (idx: number) => {
        this.gradientData.splice(idx, 1)
        this.onOpen()
      }


      let color = gradient.colorStops[0]!
      createColorStopSetting(gradient, color, idx, gradientWrapper, () => updatePreview(previewEl, this.gradientData), onDeleteColor, "mesh")

      let transparentColor = gradient.colorStops[1]!

      let colorLengthSetting = new Setting(gradientWrapper).setName(i18n.t("INNER_OUTER_RADIUS"))

      createColorLengthSlider(color, colorLengthSetting, () => updatePreview(previewEl, this.gradientData))

      colorLengthSetting.addSlider(
        (slider) => {
          slider.setLimits(0, 100, 1);
          slider.setDynamicTooltip();
          let sliderValue = transparentColor.length?.value || 0;
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





















