import { TFile, CachedMetadata, MarkdownView, FileView } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { updateCoverImages } from "./updateCovers";
import { updateBannerImages } from "./updateBanners";
import { updateIcons } from "./updateIcons";
import { updateTasksCount } from "../taskCount/taskCount";
import { updateTaskNotesTaskCount, needToUpdateTaskNotes } from "../taskCount/taskNotesTaskCount";
import { updateDateInputs } from "./updateDates";
import { updateProgressEls } from "./updateProgress";
import { updatePills } from "./updatePills";
import { updateHiddenPropertiesForContainer } from "./updateHiddenProperties";
import { updateBaseMathEls, updateNoteMathEls } from "./updateMath";



export const updateElements = (plugin: PrettyPropertiesPlugin, changedFile?: TFile | null, cache?: CachedMetadata | null) => {

    let currentFile = plugin.app.workspace.getActiveFile()
    let updateTaskNotes = needToUpdateTaskNotes(plugin, cache)
    let leaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of leaves) {
        if (leaf.view instanceof MarkdownView) {
            if (plugin.settings.autoTasksCount) {
                if (updateTaskNotes || changedFile == currentFile) {
                    updateTaskNotesTaskCount(plugin, null, leaf.view)
                }
            }
            if (
                changedFile &&
                leaf.view.file &&
                leaf.view.file.path != changedFile.path
            ) {
                continue;
            }
            updateLeafElements(plugin, leaf.view, cache);
        }
    }

    let propLeaves = plugin.app.workspace.getLeavesOfType("file-properties");
    for (let leaf of propLeaves) {
        if (leaf.view instanceof FileView) {
            if (
                changedFile &&
                leaf.view.file &&
                leaf.view.file.path != changedFile.path
            ) {
                continue;
            }
            updateLeafElements(plugin, leaf.view, cache);
        }
    }

    
    if (plugin.settings.enableBases) {
        let baseLeaves = plugin.app.workspace.getLeavesOfType("bases");
        for (let leaf of baseLeaves) {
            if (leaf.view instanceof FileView) {
                let container = leaf.view.containerEl;
                updateDateInputs(container, plugin)
            }
        }
    }
    
}


const updateLeafElements = async (
    plugin: PrettyPropertiesPlugin,
    view: MarkdownView | FileView,
    cache?: CachedMetadata | null
) => {

    let container = view.containerEl;
    updateDateInputs(container, plugin)
    updateProgressEls(container, plugin)
    if (plugin.settings.enableMath) {
        updateNoteMathEls(container, plugin)
    }
    updatePills(container, plugin)
    updateHiddenPropertiesForContainer(container, plugin)

    if (!cache && view.file) {
        cache = plugin.app.metadataCache.getFileCache(view.file);
    }
    let frontmatter;
    if (cache) {
        frontmatter = cache.frontmatter;
    }

    if (view instanceof MarkdownView) {
        updateCoverImages(view, frontmatter, plugin);
        updateIcons(view, frontmatter, plugin);
        updateBannerImages(view, frontmatter, plugin);

        if (cache && frontmatter && plugin.settings.enableTasksCount && plugin.settings.autoTasksCount) {
            updateTasksCount(view, cache, plugin);
        }
    }
}