import { MarkdownView, View, TFile } from "obsidian"
import PrettyPropertiesPlugin from "src/main"

export const updateTaskNotesTaskCount = async (plugin: PrettyPropertiesPlugin, file: TFile | null, view?: View) => {
    //console.log("hhh")

    //@ts-ignore
    let tn = plugin.app.plugins.plugins.tasknotes

    if (!file && view instanceof MarkdownView) {
        file = view.file
    }

    if (tn && file instanceof TFile) {
        let statuses = tn.statusManager?.statuses
        let completedStatuses = statuses.filter((s: any) => s.isCompleted)

        let projectTasks = await tn.projectSubtasksService.getTasksLinkedToProject(file)
        
        let completedProjectTasks = projectTasks.filter((t: any) => {
            return completedStatuses.find((s: any) => s.value == t.status)
        })

        let inlineTasks = []

        let tasks = []
        let completed = []
        let uncompleted = []

        let cache = plugin.app.metadataCache.getFileCache(file)
        if (cache) {
            let links = cache.links
            if (links) {
                for (let link of links) {
                    let linkText = link.original
                    let taskLinkObj = await tn.taskLinkDetectionService?.detectTaskLink(linkText)
                    if (taskLinkObj?.isValidTaskLink) {
                        let task = taskLinkObj.taskInfo
                        inlineTasks.push(task)
                    }
                }
            }
            


            let listItems = cache.listItems;

            if (listItems) {
                let allTasksStatuses =
                    plugin.settings.completedTasksStatuses.concat(
                        plugin.settings.uncompletedTasksStatuses
                    );
                tasks = listItems.filter(
                    (l) => l.task && allTasksStatuses.includes(l.task)
                );

                completed = tasks.filter(
                    (t) =>
                        t.task &&
                        plugin.settings.completedTasksStatuses.includes(
                            t.task
                        )
                );

                uncompleted = tasks.filter(
                    (t) =>
                        t.task &&
                        plugin.settings.uncompletedTasksStatuses.includes(
                            t.task
                        )
                );
            }
        }

        let completedInlineTasks = inlineTasks.filter(t => {
            return completedStatuses.find((s: any) => s.value == t.status)
        })

        let allTasks = [...projectTasks]

        for (let task of inlineTasks) {
            if (!allTasks.find(t => t.path == task.path)) {
                allTasks.push(task)
            }
        }

        let allCompletedTasks = allTasks.filter(t => {
            return completedStatuses.find((s: any) => s.value == t.status)
        })



        plugin.app.fileManager.processFrontMatter(file, fm => {

            //console.log("process")

            if (plugin.settings.allTNTasksCount && fm[plugin.settings.allTNTasksCount] !== undefined) {
                fm[plugin.settings.allTNTasksCount] = allTasks.length
            }

            if (plugin.settings.completedTNTasksCount && fm[plugin.settings.completedTNTasksCount] !== undefined) {
                fm[plugin.settings.completedTNTasksCount] = allCompletedTasks.length
            }

            if (plugin.settings.uncompletedTNTasksCount && fm[plugin.settings.uncompletedTNTasksCount] !== undefined) {
                fm[plugin.settings.uncompletedTNTasksCount] = allTasks.length - allCompletedTasks.length
            }

            if (plugin.settings.allTNProjectTasksCount && fm[plugin.settings.allTNProjectTasksCount] !== undefined) {
                fm[plugin.settings.allTNProjectTasksCount] = projectTasks.length
            }

            if (plugin.settings.completedTNProjectTasksCount && fm[plugin.settings.completedTNProjectTasksCount] !== undefined) {
                fm[plugin.settings.completedTNProjectTasksCount] = completedProjectTasks.length
            }

            if (plugin.settings.uncompletedTNProjectTasksCount && fm[plugin.settings.uncompletedTNProjectTasksCount] !== undefined) {
                fm[plugin.settings.uncompletedTNProjectTasksCount] = projectTasks.length - completedProjectTasks.length
            }

            if (plugin.settings.allTNInlineTasksCount && fm[plugin.settings.allTNInlineTasksCount] !== undefined) {
                fm[plugin.settings.allTNInlineTasksCount] = inlineTasks.length
            }

            if (plugin.settings.completedTNInlineTasksCount && fm[plugin.settings.completedTNInlineTasksCount] !== undefined) {
                fm[plugin.settings.completedTNInlineTasksCount] = completedInlineTasks.length
            }

            if (plugin.settings.uncompletedTNInlineTasksCount && fm[plugin.settings.uncompletedTNInlineTasksCount] !== undefined) {
                fm[plugin.settings.uncompletedTNInlineTasksCount] = inlineTasks.length - completedInlineTasks.length
            }

            if (plugin.settings.allTNAndCheckboxTasksCount && fm[plugin.settings.allTNAndCheckboxTasksCount] !== undefined) {
                fm[plugin.settings.allTNAndCheckboxTasksCount] = allTasks.length + tasks.length
            }

            //console.log(fm)

            if (plugin.settings.completedTNAndCheckboxTasksCount && fm[plugin.settings.completedTNAndCheckboxTasksCount] !== undefined) {
                //console.log("hhh")
                fm[plugin.settings.completedTNAndCheckboxTasksCount] = allCompletedTasks.length + completed.length
            }

            if (plugin.settings.uncompletedTNAndCheckboxTasksCount && fm[plugin.settings.uncompletedTNAndCheckboxTasksCount] !== undefined) {
                fm[plugin.settings.uncompletedTNAndCheckboxTasksCount] = allTasks.length - allCompletedTasks.length + uncompleted.length
            }

            
            


        })
    }
}