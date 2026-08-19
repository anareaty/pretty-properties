import { TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { SuggestionFilterRule } from "src/settings/settings";




const normalizeFolder = (folder: string) => folder.replace(/^\/+|\/+$/g, "").trim()




// Suggestion values come in several shapes depending on which suggester is open:
// plain strings for multitext values, file objects for link suggestions.
const getRawValue = (value: unknown): string | undefined => {
	if (typeof value == "string") return value
	if (!value || typeof value != "object") return undefined

	let obj = value as Record<string, any>

	if (obj.file instanceof TFile) return obj.file.path
	if (typeof obj.file?.path == "string") return obj.file.path
	if (typeof obj.path == "string") return obj.path
	if (typeof obj.value == "string") return obj.value
	if (typeof obj.alias == "string") return obj.alias

	return undefined
}




// Turns a suggestion into a vault path, so "[[Health]]", "Areas/Health.md" and
// "Areas/Health#Goals|Health" all end up as the same note.
const resolvePath = (plugin: PrettyPropertiesPlugin, raw: string): string | undefined => {
	let text = raw.trim()

	let wikiMatch = text.match(/^!?\[\[([^\]]+)\]\]$/)
	if (wikiMatch?.[1]) text = wikiMatch[1]

	let mdMatch = text.match(/^!?\[[^\]]*\]\(([^)]+)\)$/)
	if (mdMatch?.[1]) text = decodeURIComponent(mdMatch[1])

	text = (text.split("|")[0] ?? "").split("#")[0] ?? ""
	text = text.trim()

	if (!text) return undefined

	let file = plugin.app.metadataCache.getFirstLinkpathDest(text, "")
	return file?.path
}




const matchesRule = (path: string, rule: SuggestionFilterRule) => {
	let folder = normalizeFolder(rule.value)
	if (!folder) return false

	if (rule.includeSubfolders) {
		return path.startsWith(folder + "/")
	}

	let lastSlash = path.lastIndexOf("/")
	let parent = lastSlash == -1 ? "" : path.slice(0, lastSlash)
	return parent == folder
}




export const getRulesForProperty = (plugin: PrettyPropertiesPlugin, propertyKey: string) => {
	if (!plugin.settings.enableSuggestionFilters) return []

	let key = propertyKey.trim().toLowerCase()

	return (plugin.settings.suggestionFilters || []).filter(rule =>
		rule.property.trim().toLowerCase() == key && normalizeFolder(rule.value)
	)
}




export const filterSuggestionValues = (
	plugin: PrettyPropertiesPlugin,
	propertyKey: string,
	values: unknown[]
) => {
	let rules = getRulesForProperty(plugin, propertyKey)
	if (!rules.length) return values

	let includes = rules.filter(rule => rule.mode != "exclude")
	let excludes = rules.filter(rule => rule.mode == "exclude")

	return values.filter(value => {
		let raw = getRawValue(value)
		let path = raw ? resolvePath(plugin, raw) : undefined

		// A suggestion that resolves to no note can't be placed in a folder, so
		// include rules drop it and exclude rules leave it alone.
		if (!path) return !includes.length

		if (excludes.some(rule => matchesRule(path, rule))) return false
		if (includes.length && !includes.some(rule => matchesRule(path, rule))) return false

		return true
	})
}
