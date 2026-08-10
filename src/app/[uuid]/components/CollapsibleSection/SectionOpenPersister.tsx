"use client";

import { useEffect, useRef } from "react";
import { readSectionsState, setSectionOpen } from "../../sectionsCookie.client";

type Props = {
	uuid: string;
	sectionId: string;
};

// The <details> collapses natively with no JS. This island restores the saved
// state on mount (covering soft navigations, where the pre-paint restore script
// doesn't run) and remembers later changes by writing the cookie on toggle. It
// renders an empty anchor so it can find the <details> it lives in.
export function SectionOpenPersister({ uuid, sectionId }: Props) {
	const anchor = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const details = anchor.current?.closest("details");
		if (!details) return;

		const saved = readSectionsState(uuid)[sectionId] ?? true;
		if (details.open !== saved) details.open = saved;

		const persist = () => {
			setSectionOpen(uuid, sectionId, details.open).catch(() => {});
		};

		details.addEventListener("toggle", persist);
		return () => details.removeEventListener("toggle", persist);
	}, [uuid, sectionId]);

	return <span ref={anchor} hidden />;
}
