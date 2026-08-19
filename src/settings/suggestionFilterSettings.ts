import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { PropertyNameSuggest } from '../utils/propertyNameSuggester';
import { FolderSuggest } from '../utils/folderSuggester';




export const showSuggestionFilterSettings = (settingTab: PPSettingTab) => {
	const { containerEl, plugin } = settingTab

	new Setting(containerEl)
		.setHeading()
		.setName(i18n.t("SUGGESTION_FILTERS"))
		.setDesc(i18n.t("SUGGESTION_FILTERS_DESC"))

	new Setting(containerEl)
		.setName(i18n.t("ENABLE_SUGGESTION_FILTERS"))
		.addToggle(toggle => toggle
			.setValue(plugin.settings.enableSuggestionFilters)
			.onChange(async (value) => {
				plugin.settings.enableSuggestionFilters = value
				await plugin.saveSettings()
				settingTab.display()
			}))

	if (!plugin.settings.enableSuggestionFilters) return

	let rulesWrapper = containerEl.createDiv()

	rulesWrapper.setCssProps({
		border: "1px solid var(--text-accent)",
		"border-radius": "4px"
	})

	let rulesEl = rulesWrapper.createDiv()

	for (let i = 0; i < plugin.settings.suggestionFilters.length; i++) {
		const rule = plugin.settings.suggestionFilters[i]
		if (!rule) continue

		new Setting(rulesEl)
			.setName(rule.property)
			.setDesc(i18n.t("SUGGESTION_FILTER_FOLDER_RULE"))

			.addSearch((search) => {
				search.setPlaceholder(i18n.t("SUGGESTION_FILTER_FOLDER_PLACEHOLDER"))
				search.setValue(rule.value)

				const persist = async (value: string) => {
					rule.value = value
					await plugin.saveSettings()
				}

				search.onChange(async (value) => {
					await persist(value)
				})

				const suggester = new FolderSuggest(plugin.app, search.inputEl)
				suggester.onSelect(async (value) => {
					await persist(value)
					suggester.setValue(value)
					suggester.close()
				})
			})

			.addDropdown(drop => drop
				.addOptions({
					"include": i18n.t("SUGGESTION_FILTER_INCLUDE"),
					"exclude": i18n.t("SUGGESTION_FILTER_EXCLUDE")
				})
				.setValue(rule.mode)
				.onChange(async (value) => {
					rule.mode = value == "exclude" ? "exclude" : "include"
					await plugin.saveSettings()
				}))

			.addToggle(toggle => toggle
				.setTooltip(i18n.t("SUGGESTION_FILTER_SUBFOLDERS"))
				.setValue(rule.includeSubfolders)
				.onChange(async (value) => {
					rule.includeSubfolders = value
					await plugin.saveSettings()
				}))

			.addButton(btn => btn
				.setIcon("x")
				.onClick(async () => {
					plugin.settings.suggestionFilters.splice(i, 1)
					await plugin.saveSettings()
					settingTab.display()
				}))
	}

	let newProperty = ""

	new Setting(rulesWrapper)
		.setName(i18n.t("ADD_SUGGESTION_FILTER"))
		.addSearch((search) => {
			search.setValue("")
			search.setPlaceholder(i18n.t("PROPERTY_SEARCH_PLACEHOLDER"))

			const persist = async (value: string) => {
				newProperty = value
			}

			search.onChange(async (value) => {
				await persist(value)
			})

			const suggester = new PropertyNameSuggest(plugin.app, search.inputEl)
			suggester.onSelect(async (value) => {
				await persist(value)
				suggester.setValue(value)
				suggester.close()
			})
		})

		.addButton(btn => btn
			.setIcon("plus")
			.onClick(async () => {
				newProperty = newProperty.trim()
				if (!newProperty) return

				plugin.settings.suggestionFilters.push({
					property: newProperty,
					match: "folder",
					value: "",
					mode: "include",
					includeSubfolders: true
				})

				await plugin.saveSettings()
				settingTab.display()
			}))
}
