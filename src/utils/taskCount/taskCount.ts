import { MarkdownView, FileView, CachedMetadata, TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty, setNestedProperty } from "../propertyUtils";


export const updateTasksCount = async (
    view: MarkdownView | FileView,
    cache: CachedMetadata,
    plugin: PrettyPropertiesPlugin
) => {
    let frontmatter = cache.frontmatter;
    let tasksProp = plugin.settings.allTasksCount;
    let completedProp = plugin.settings.completedTasksCount;
    let uncompletedProp = plugin.settings.uncompletedTasksCount;
    let tasksVal = getNestedProperty(frontmatter, tasksProp);
    let completedVal = getNestedProperty(frontmatter, completedProp);
    let uncompletedVal = getNestedProperty(frontmatter, uncompletedProp);

    if (
        tasksVal !== undefined ||
        completedVal !== undefined ||
        uncompletedVal !== undefined
    ) {
        let file = view.file;
        let listItems = cache.listItems;
        if (listItems) {
            let allTasksStatuses =
                plugin.settings.completedTasksStatuses.concat(
                    plugin.settings.uncompletedTasksStatuses
                );
            let tasks = listItems.filter(
                (l) => l.task && allTasksStatuses.includes(l.task)
            );

            if (
                tasks.length == 0 &&
                (tasksVal === null || tasksVal === undefined) &&
                (completedVal === null || completedVal === undefined) &&
                (uncompletedVal === null || uncompletedVal === undefined)
            ) {
                return;
            }

            if (tasksVal !== undefined) {
                let tasksNum = tasks.length;
                if (tasksNum != tasksVal) {
                    if (file instanceof TFile) {
                        await plugin.app.fileManager.processFrontMatter(
                            file,
                            (fm) => {
                                setNestedProperty(fm, tasksProp, tasksNum);
                            }
                        );
                    }
                }
            }

            if (completedVal !== undefined) {
                let completed = tasks.filter(
                    (t) =>
                        t.task &&
                        plugin.settings.completedTasksStatuses.includes(
                            t.task
                        )
                );
                let completedNum = completed.length;
                if (completedNum != completedVal) {
                    if (file instanceof TFile) {
                        await plugin.app.fileManager.processFrontMatter(
                            file,
                            (fm) => {
                                setNestedProperty(fm, completedProp, completedNum);
                            }
                        );
                    }
                }
            }

            if (uncompletedVal !== undefined) {
                let uncompleted = tasks.filter(
                    (t) =>
                        t.task &&
                        plugin.settings.uncompletedTasksStatuses.includes(
                            t.task
                        )
                );
                let uncompletedNum = uncompleted.length;
                if (uncompletedNum != uncompletedVal) {
                    if (file instanceof TFile) {
                        await plugin.app.fileManager.processFrontMatter(
                            file,
                            (fm) => {
                                setNestedProperty(fm, uncompletedProp, uncompletedNum);
                            }
                        );
                    }
                }
            }
        }
    }
}



export const updateTaskCountOnCacheChanged = async (file: TFile, cache: CachedMetadata, plugin: PrettyPropertiesPlugin) => {
    if (plugin.settings.enableTasksCount && plugin.settings.autoTasksCount) {
        let sourcePath = file.path || ""
        let leaves = plugin.app.workspace.getLeavesOfType("markdown");
        for (let leaf of leaves) {
            let view = leaf.view;
            if (view instanceof MarkdownView && view.file?.path == sourcePath) {
                updateTasksCount(view, cache, plugin)
            }
        }
    }
}


export const updateAllTaskCounts = async (plugin: PrettyPropertiesPlugin) => {

    if (plugin.settings.enableTasksCount && plugin.settings.autoTasksCount) {
        let leaves = plugin.app.workspace.getLeavesOfType("markdown");
        for (let leaf of leaves) {
            let view = leaf.view;
            if (view instanceof MarkdownView) {
                let file = view.file
                if (file instanceof TFile) {
                    let cache = plugin.app.metadataCache.getFileCache(file)
                    if (cache) {
                        updateTasksCount(view, cache, plugin)
                    }
                }
            }
        }
    }
}