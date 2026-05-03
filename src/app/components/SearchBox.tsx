"use client";

import { useEffect, useRef } from "react";
import type { HomeConfig } from "../types";

type Props = {
	searchConfig: HomeConfig["search"];
};

export function SearchBox({ searchConfig }: Props) {
	const actionUrl =
		searchConfig.engine === "kagi" ? "https://kagi.com/search" : "/search";

	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	return (
		<form className="search-form" action={actionUrl} method="get">
			<input
				ref={inputRef}
				className="search-input"
				type="search"
				name="q"
				placeholder="Search Kagi"
				aria-label="Search"
			/>
			<button className="search-button" type="submit">
				Search
			</button>
		</form>
	);
}
