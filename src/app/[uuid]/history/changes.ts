import { create } from "jsondiffpatch";
import { format, type Op } from "jsondiffpatch/formatters/jsonpatch";
import type { HomeConfig } from "@/app/types";

export type ChangeKind = "added" | "removed" | "moved" | "changed";
export type Change = { kind: ChangeKind; description: string };

const differ = create({
	objectHash: (item) => {
		const id = (item as { id?: unknown }).id;
		return typeof id === "string" ? id : undefined;
	},
});

export function describeChanges(
	before: HomeConfig,
	after: HomeConfig,
): Change[] {
	const delta = differ.diff(before, after);
	if (!delta) return [];
	return format(delta).map((op) => describeOp(op, before, after));
}

function describeOp(op: Op, before: HomeConfig, after: HomeConfig): Change {
	switch (op.op) {
		case "add":
			return { kind: "added", description: `Added ${target(op.path, after)}` };
		case "remove":
			return {
				kind: "removed",
				description: `Removed ${target(op.path, before)}`,
			};
		case "move":
			return {
				kind: "moved",
				description: `Reordered ${target(op.from, before)}`,
			};
		case "replace":
			return {
				kind: "changed",
				description: `Changed ${target(op.path, after)}${preview(op.value)}`,
			};
	}
}

function target(pointer: string, config: HomeConfig): string {
	const [head, ...rest] = pointer.split("/").slice(1);
	switch (head) {
		case "title":
			return "the title";
		case "subtitle":
			return "the subtitle";
		case "background":
			return "the background";
		case "search":
			return "the search box";
		case "sections":
			return describeSection(rest, config);
		default:
			return "the homepage";
	}
}

function describeSection(rest: string[], config: HomeConfig): string {
	const [index, field, linkIndex, linkField] = rest;
	const section = config.sections?.[Number(index)];
	const name = section?.label ? `“${section.label}”` : "a section";

	if (field === "links") {
		const link = section?.links?.[Number(linkIndex)];
		const linkName = link?.label ? `“${link.label}”` : "a link";
		if (linkField === "label") return `the name of a link in section ${name}`;
		if (linkField === "url")
			return `the URL of link ${linkName} in section ${name}`;
		return `link ${linkName} in section ${name}`;
	}

	if (field === "label") return `the name of section ${name}`;
	if (field === "hidden") return `the visibility of section ${name}`;
	return `section ${name}`;
}

function preview(value: unknown): string {
	if (typeof value === "string") {
		const trimmed = value.length > 40 ? `${value.slice(0, 40)}…` : value;
		return ` to “${trimmed}”`;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return ` to ${value}`;
	}
	return "";
}
