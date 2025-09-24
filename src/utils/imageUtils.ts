import { TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { LocalImageSuggestModal } from "src/modals/localImageSuggestModal";
import { BannerPositionModal } from "src/modals/bannerPositionModal";
import { CoverShapeSuggestModal } from "src/modals/coverShapeSuggestModal";
import { ImageSuggestModal } from "src/modals/imageSuggestModal";


export const selectLocalImage = async (propName: string, folder: string, shape: string, plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let formats = [
            "avif",
            "bmp",
            "gif",
            "jpeg",
            "jpg",
            "png",
            "svg",
            "webp",
        ];
        let files = plugin.app.vault.getFiles();
        files = files.filter((f: TFile) => formats.find((e) => e == f.extension));

        let imageFiles = files;
        if (folder) {
            imageFiles = files.filter((f) => {
                return (
                    f.parent!.path == folder ||
                    f.parent!.path.startsWith(folder + "/")
                );
            });
        }

        let imagePaths = imageFiles.map((f) => f.path);
        let imageNames = imageFiles.map((f) => f.basename);

        new LocalImageSuggestModal(
            plugin.app,
            plugin,
            propName,
            shape,
            imagePaths,
            imageNames
        ).open();
    }
}



export const selectBannerPosition = async(plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile()
    let bannerPositionProperty = plugin.settings.bannerPositionProperty
    if (file instanceof TFile && bannerPositionProperty) {
        new BannerPositionModal(plugin.app, plugin, file, bannerPositionProperty).open()
    }
}



export const selectCoverShape = async(plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        new CoverShapeSuggestModal(plugin.app, file).open();
    }
}



export const getCurrentCoverProperty = (plugin: PrettyPropertiesPlugin) => {
    let propName: string | undefined;
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let frontmatter = cache!.frontmatter;
        let props = [...plugin.settings.extraCoverProperties];
        props.unshift(plugin.settings.coverProperty);

        for (let prop of props) {
            if (frontmatter?.[prop] !== undefined) {
                propName = prop;
                break;
            }
        }
    }
    return propName;
}



export const selectCoverImage = async (plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let propName = getCurrentCoverProperty(plugin);
        if (!propName) propName = plugin.settings.coverProperty;
        if (propName) {
            new ImageSuggestModal(
                plugin.app, 
                plugin, 
                propName, 
                plugin.settings.coversFolder,
                "cover"
            ).open();
        }
    }
}