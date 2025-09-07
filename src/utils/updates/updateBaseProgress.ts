import { WorkspaceLeaf, setTooltip } from "obsidian";
import PrettyPropertiesPlugin from "src/main";

export const updateBaseLeafProgress = async (leaf: WorkspaceLeaf, plugin: PrettyPropertiesPlugin) => {
	if (plugin.settings.enableBases) {
		let containerEl = leaf.view.containerEl;

		let baseTableContainer = containerEl.querySelector(".bases-table-container");

		if (baseTableContainer) {
			const updateProgress = () => {
				if (baseTableContainer!.classList.contains("is-loading")) {
					if (!containerEl.querySelector(".bases-table-container:not(.is-loading")) {
						setTimeout(updateProgress, 50);
						return;
					}
				}

				let progressEls = containerEl.querySelectorAll(".bases-td[data-property*='formula.pp_progress']");
				for (let progressEl of progressEls) {
					if (progressEl instanceof HTMLElement) {

						const createProgress = (valueString: string | undefined) => {
							if (valueString) {
								let valueParts =
									valueString.match(/(\d+)(\/)(\d+)/);
								if (valueParts) {
									let progressWrapper =
										document.createElement("div");
									progressWrapper.classList.add("metadata-progress-wrapper");

									progressWrapper.setAttribute("data-progress-value", valueString)

									let value = Number(valueParts[1]);
									let max = Number(valueParts[3]);
									let progress
									let percent = Math.round((value * 100) / max)
									
									if (progressEl.getAttribute("data-property")?.startsWith("formula.pp_progress_circle")) {
										let style = `background: 
											radial-gradient(closest-side, var(--color-progress-background) 64%, transparent 65% 100%),
											conic-gradient(var(--color-progress) ${percent}%, var(--background-secondary) 0); 
										`
										if (percent == 100) {
											style = `background: 
											radial-gradient(closest-side, var(--color-progress-background) 64%, transparent 65% 100%),
											conic-gradient(var(--color-progress-completed) ${percent}%, var(--background-secondary) 0); 
										`
										}
										progress = document.createElement("div");
										progress.classList.add("metadata-circle-progress");
										progress.setAttribute("style", style)

									} else {
										progress = document.createElement("progress");
										progress.classList.add("metadata-progress");
										progress.value = value;
										progress.max = max;
									}

									let percentString = " " + percent + " %";
									setTooltip(progress, percentString, {
										delay: 500,
										placement: "top",
									});

									progressWrapper.append(progress);
									progressEl.classList.add("has-progress-bar");

									progressEl.prepend(progressWrapper);
								}
							}
						}

						let oldProgress = progressEl.querySelector(".metadata-progress-wrapper");
						let valueEl = progressEl.querySelector(".bases-rendered-value");
						let valueString

						if (valueEl instanceof HTMLElement) {
							valueString = valueEl.innerText;
						}

						if (oldProgress instanceof HTMLElement) {
							let oldValueString = oldProgress.getAttribute("data-progress-value")
							if (oldValueString != valueString) {
								oldProgress.remove();
								progressEl.classList.remove("has-progress-bar");
								createProgress(valueString)
							}
						} else {
							createProgress(valueString)
						}
					}
				}
			};
			updateProgress();
		}

		let baseCardsContainer = containerEl.querySelector(".bases-cards-container");

		if (baseCardsContainer) {
			const updateProgress = () => {
				if (baseCardsContainer!.classList.contains("is-loading")) {
					if (!containerEl.querySelector(".bases-cards-container:not(.is-loading")) {
						setTimeout(updateProgress, 50);
						return;
					}
				}

				let progressEls = containerEl.querySelectorAll(".bases-cards-property[data-property*='formula.pp_progress']");
				for (let progressEl of progressEls) {
					if (progressEl instanceof HTMLElement) {
						let oldProgress = progressEl.querySelector(".metadata-progress-wrapper");
						if (oldProgress) {
							oldProgress.remove();
							progressEl.classList.remove("has-progress-bar");
						}

						let valueEl = progressEl.querySelector(".bases-rendered-value");
						if (valueEl instanceof HTMLElement) {
							let valueString = valueEl.innerText;
							if (valueString) {
								let valueParts =
									valueString.match(/(\d+)(\/)(\d+)/);
								if (valueParts) {
									let progressWrapper = document.createElement("div");
									progressWrapper.classList.add("metadata-progress-wrapper");
									let progress = document.createElement("progress");
									progress.classList.add("metadata-progress");
									progress.value = Number(valueParts[1]);
									progress.max = Number(valueParts[3]);

									let percent = " " +
										Math.round((progress.value * 100) / progress.max) + " %";
									setTooltip(progress, percent, {
										delay: 500,
										placement: "top",
									});

									progressWrapper.append(progress);
									progressEl.classList.add("has-progress-bar");

									let label = progressEl.firstChild;
									label?.after(progressWrapper);
								}
							}
						}
					}
				}
			};
			updateProgress();
		}
	}
}