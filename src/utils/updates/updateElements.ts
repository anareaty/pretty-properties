import { TFile, CachedMetadata, MarkdownView, FileView } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { updateBaseLeafPills } from "./updateBasePills";
import { updateBaseLeafProgress } from "./updateBaseProgress";
import { updateDateInputs } from "./updateDates";
import { updateCoverImages } from "./updateCovers";
import { updateBannerImages } from "./updateBanners";
import { updateIcons } from "./updateIcons";
import { updateTasksCount } from "../taskCount/taskCount";
import { updateTaskNotesTaskCount, needToUpdateTaskNotes } from "../taskCount/taskNotesTaskCount";
import { updateViewProgress } from "./updateProgress";
import { updateHiddenProperties } from "./updateHiddenProperties";
import { updateHiddenPropertiesForLeaf } from "./updateHiddenProperties";
import { updateAllPills } from "./updatePills";


export const updateElements = (plugin: PrettyPropertiesPlugin, changedFile?: TFile | null, cache?: CachedMetadata | null) => {

    let updateTaskNotes = needToUpdateTaskNotes(plugin, cache)
    
    let leaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of leaves) {
        if (leaf.view instanceof MarkdownView) {
            if (updateTaskNotes) {
                updateTaskNotesTaskCount(plugin, null, leaf.view)
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

    let baseLeaves = plugin.app.workspace.getLeavesOfType("bases");
    for (let leaf of baseLeaves) {
        if (leaf.view instanceof FileView) {
            //updateBaseLeafPills(leaf, plugin);
            //updateBaseLeafProgress(leaf, plugin);
        }
    }
}





const updateLeafElements = async (
    plugin: PrettyPropertiesPlugin,
    view: MarkdownView | FileView,
    cache?: CachedMetadata | null
) => {

    //updateHiddenPropertiesForView(view, plugin)
    //addClassestoProperties(view, plugin);
    //updateDateInputs(view, plugin)

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

        if (cache && frontmatter && plugin.settings.enableTasksCount) {
            updateTasksCount(view, cache, plugin);
        }
    }
    //updateViewProgress(view, plugin);
}