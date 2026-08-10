"use client";

import {
	Combobox,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
} from "@headlessui/react";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { QuickLinkIcon } from "@/app/components/QuickLinkIcon";
import type { SearchConfig, Section } from "@/app/types";
import { readRecents, recentsStorageKey, rememberSearch } from "./recents";
import styles from "./styles.module.css";
import {
	buildSuggestions,
	metaLabel,
	type Suggestion,
	suggestionKey,
} from "./suggestions";

const ICON_SIZE = 28;

type Props = {
	config: SearchConfig;
	sections: Section[];
	uuid: string;
};

export function SearchBar({ config, sections, uuid }: Props) {
	const [query, setQuery] = useState("");
	const [recents, setRecents] = useState<string[]>([]);
	const privateHeld = useRef(false);
	const storageKey = recentsStorageKey(uuid);

	useEffect(() => {
		setRecents(readRecents(storageKey));
	}, [storageKey]);

	// Track Ctrl globally in the capture phase so its state is settled before
	// the combobox's own key handler fires the selection — holding Ctrl on
	// select runs the search privately (not recorded into recents). Reset on
	// blur so a Ctrl release missed while the tab was unfocused can't stick.
	useEffect(() => {
		function track(event: KeyboardEvent) {
			privateHeld.current = event.ctrlKey;
		}
		function reset() {
			privateHeld.current = false;
		}
		window.addEventListener("keydown", track, true);
		window.addEventListener("keyup", track, true);
		window.addEventListener("blur", reset);
		return () => {
			window.removeEventListener("keydown", track, true);
			window.removeEventListener("keyup", track, true);
			window.removeEventListener("blur", reset);
		};
	}, []);

	const suggestions = buildSuggestions(query, recents, sections);

	function handleSelect(suggestion: Suggestion | null) {
		if (!suggestion) return;
		if (suggestion.kind === "link") {
			window.location.assign(suggestion.url);
			return;
		}
		runSearch(suggestion.query, privateHeld.current);
	}

	function runSearch(rawQuery: string, isPrivate: boolean) {
		const trimmed = rawQuery.trim();
		if (!trimmed) return;
		if (!isPrivate) {
			setRecents(rememberSearch(storageKey, recents, trimmed));
		}
		const target = config.url.replaceAll("%s", encodeURIComponent(trimmed));
		window.location.assign(target);
	}

	return (
		<div className={styles.root} role="search">
			<Combobox<Suggestion | null> onChange={handleSelect}>
				{({ activeIndex }) => (
					<>
						<ComboboxInput
							className={styles.input}
							placeholder={config.placeholder ?? "Search"}
							aria-label="Search"
							autoComplete="off"
							autoCapitalize="none"
							autoCorrect="off"
							spellCheck={false}
							autoFocus
							onChange={(event) => setQuery(event.target.value)}
							onKeyDownCapture={(event) =>
								wrapArrowNavigation(event, activeIndex, suggestions.length)
							}
						/>
						<ComboboxOptions anchor="bottom start" className={styles.options}>
							{suggestions.map((suggestion) => {
								const meta = metaLabel(suggestion);
								return (
									<ComboboxOption
										key={suggestionKey(suggestion)}
										value={suggestion}
										className={styles.option}
									>
										<QuickLinkIcon
											url={
												suggestion.kind === "link" ? suggestion.url : config.url
											}
											icon={
												suggestion.kind === "link" ? suggestion.icon : undefined
											}
											size={ICON_SIZE}
										/>
										<span className={styles.optionText}>
											{meta ? (
												<span className={styles.optionMeta}>{meta}</span>
											) : null}
											<span className={styles.optionLabel}>
												{suggestion.label}
											</span>
										</span>
									</ComboboxOption>
								);
							})}
						</ComboboxOptions>
					</>
				)}
			</Combobox>
		</div>
	);
}

// Headless UI clamps at the ends, so at a boundary we synthesize the Home/End
// key it maps to the opposite end. Done in the capture phase, before Headless's
// own bubble handler runs and consumes the arrow.
function wrapArrowNavigation(
	event: ReactKeyboardEvent<HTMLInputElement>,
	activeIndex: number | null,
	count: number,
) {
	if (activeIndex === null) return;
	let jumpTo: "Home" | "End" | null = null;
	if (event.key === "ArrowDown" && activeIndex === count - 1) {
		jumpTo = "Home";
	} else if (event.key === "ArrowUp" && activeIndex === 0) {
		jumpTo = "End";
	}
	if (!jumpTo) return;

	event.preventDefault();
	event.stopPropagation();
	event.currentTarget.dispatchEvent(
		new KeyboardEvent("keydown", {
			key: jumpTo,
			bubbles: true,
			cancelable: true,
		}),
	);
}
