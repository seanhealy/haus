"use client";

import { useEffect, useRef } from "react";
import { setSectionOpen } from "../../sectionsCookie.client";

type Props = {
	uuid: string;
	sectionId: string;
};

export function SectionOpenPersister({ uuid, sectionId }: Props) {
	const anchor = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const details = anchor.current?.closest("details");
		if (!details) return;

		const persist = () => {
			setSectionOpen(uuid, sectionId, details.open).catch(() => {});
		};

		details.addEventListener("toggle", persist);
		return () => details.removeEventListener("toggle", persist);
	}, [uuid, sectionId]);

	return <span ref={anchor} hidden />;
}
