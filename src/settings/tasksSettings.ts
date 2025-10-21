import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { updateAllTaskCounts } from 'src/utils/taskCount/taskCount';
import { updateAllTaskNotesTaskCounts } from 'src/utils/taskCount/taskNotesTaskCount';




export const showTasksSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    new Setting(containerEl)
        .setName(i18n.t("ENABLE_TASKS_COUNT"))
        .setDesc(i18n.t("TASKS_COUNT_DESC"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableTasksCount)
            .onChange(async (value) => {
                plugin.settings.enableTasksCount = value
                await plugin.saveSettings();
                updateAllTaskCounts(plugin)
                settingTab.display();
            }));

    if (plugin.settings.enableTasksCount) {
        new Setting(containerEl)
        .setName(i18n.t("ALL_TASKS_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tasks')
            .setValue(plugin.settings.allTasksCount)
            .onChange(async (value) => {
                plugin.settings.allTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("UNCOMPLETED_TASKS_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tasks_uncompleted')
            .setValue(plugin.settings.uncompletedTasksCount)
            .onChange(async (value) => {
                plugin.settings.uncompletedTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("COMPLETED_TASKS_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tasks_completed')
            .setValue(plugin.settings.completedTasksCount)
            .onChange(async (value) => {
                plugin.settings.completedTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskCounts(plugin)
            }));

        containerEl.createEl("p", {text: i18n.t("TASK_STATUSES_DESCRIPTION")})

        new Setting(containerEl)
        .setName(i18n.t("UNCOMPLETED_TASKS_COUNT_STATUSES"))
        .addText(text => text
            .setPlaceholder('banner')
            .setValue(plugin.settings.uncompletedTasksStatuses.map(s => "\"" + s + "\"").join(", "))
            .onChange(async (value) => {
                let valueArr = value.split(",").map(v => {
                    v = v.trim()
                    let stringMatch = v.match(/(\")(.*?)(\")/)
                    if (stringMatch) {
                        v = stringMatch[2]
                    }
                    if (v.length > 1) {
                        v = v[0]
                    }
                    return v
                }).filter(v => v != "" && !plugin.settings.completedTasksStatuses.includes(v))
                valueArr = Array.from(new Set(valueArr))
                plugin.settings.uncompletedTasksStatuses = valueArr;
                await plugin.saveSettings();
                updateAllTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("COMPLETED_TASKS_COUNT_STATUSES"))
        .addText(text => text
            .setPlaceholder('"x"')
            .setValue(plugin.settings.completedTasksStatuses.map(s => "\"" + s + "\"").join(", "))
            .onChange(async (value) => {
                let valueArr = value.split(",").map(v => {
                    v = v.trim()
                    let stringMatch = v.match(/(\")(.*?)(\")/)
                    if (stringMatch) {
                        v = stringMatch[2]
                    }
                    if (v.length > 1) {
                        v = v[0]
                    }
                    return v
                }).filter(v => v != "" && !plugin.settings.uncompletedTasksStatuses.includes(v))
                valueArr = Array.from(new Set(valueArr))
                plugin.settings.completedTasksStatuses = valueArr;
                await plugin.saveSettings();
                updateAllTaskCounts(plugin)
            }));
    }

    new Setting(containerEl).setName(i18n.t("TASKNOTES_INTEGRATION")).setHeading();
    containerEl.createEl("p", {text: i18n.t("TASKNOTES_INTEGRATION_DESCRIPTION")})

    new Setting(containerEl)
        .setName(i18n.t("ENABLE_TASKSNOTES_COUNT"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableTaskNotesCount)
            .onChange(async (value) => {
                plugin.settings.enableTaskNotesCount = value
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
                settingTab.display();
            }));

    if (plugin.settings.enableTaskNotesCount) {
        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_PROJECT_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tn_project_tasks')
            .setValue(plugin.settings.allTNProjectTasksCount)
            .onChange(async (value) => {
                plugin.settings.allTNProjectTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_PROJECT_COMPLETED_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tn_project_tasks_completed')
            .setValue(plugin.settings.completedTNProjectTasksCount)
            .onChange(async (value) => {
                plugin.settings.completedTNProjectTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_PROJECT_UNCOMPLETED_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tn_project_tasks_uncompleted')
            .setValue(plugin.settings.uncompletedTNProjectTasksCount)
            .onChange(async (value) => {
                plugin.settings.uncompletedTNProjectTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_INLINE_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tn_inline_tasks')
            .setValue(plugin.settings.allTNInlineTasksCount)
            .onChange(async (value) => {
                plugin.settings.allTNInlineTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_INLINE_COMPLETED_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tn_inline_tasks_completed')
            .setValue(plugin.settings.completedTNInlineTasksCount)
            .onChange(async (value) => {
                plugin.settings.completedTNInlineTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_INLINE_UNCOMPLETED_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tn_inline_tasks_uncompleted')
            .setValue(plugin.settings.uncompletedTNInlineTasksCount)
            .onChange(async (value) => {
                plugin.settings.uncompletedTNInlineTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tn_tasks')
            .setValue(plugin.settings.allTNTasksCount)
            .onChange(async (value) => {
                plugin.settings.allTNTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_COMPLETED_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tn_tasks_completed')
            .setValue(plugin.settings.completedTNTasksCount)
            .onChange(async (value) => {
                plugin.settings.completedTNTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_UNCOMPLETED_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('tn_tasks_uncompleted')
            .setValue(plugin.settings.uncompletedTNTasksCount)
            .onChange(async (value) => {
                plugin.settings.uncompletedTNTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));
        
        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_AND_CHECKBOX_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('all_tasks')
            .setValue(plugin.settings.allTNAndCheckboxTasksCount)
            .onChange(async (value) => {
                plugin.settings.allTNAndCheckboxTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_AND_CHECKBOX_COMPLETED_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('all_tasks_completed')
            .setValue(plugin.settings.completedTNAndCheckboxTasksCount)
            .onChange(async (value) => {
                plugin.settings.completedTNAndCheckboxTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("TASKNOTES_AND_CHECKBOX_UNCOMPLETED_COUNT_PROPERTY"))
        .addText(text => text
            .setPlaceholder('all_tasks_uncompleted')
            .setValue(plugin.settings.uncompletedTNAndCheckboxTasksCount)
            .onChange(async (value) => {
                plugin.settings.uncompletedTNAndCheckboxTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskNotesTaskCounts(plugin)
            }));
    }



    if (plugin.settings.enableTasksCount || plugin.settings.enableTaskNotesCount) {
        new Setting(containerEl)
            .setName(i18n.t("AUTOMATIC_TASKS_COUNT"))
            .setDesc(i18n.t("AUTOMATIC_TASKS_COUNT_DESC"))
            .addToggle((toggle) => toggle
            .setValue(plugin.settings.autoTasksCount)
            .onChange(async (value) => {
                plugin.settings.autoTasksCount = value;
                await plugin.saveSettings();
                updateAllTaskCounts(plugin)
                updateAllTaskNotesTaskCounts(plugin)
                settingTab.display();
            }));
    }

}