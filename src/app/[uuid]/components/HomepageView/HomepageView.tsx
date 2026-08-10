import Link from "next/link";
import type { HomeConfig, Section } from "@/app/types";
import {
	CollapsibleSection,
	SectionsRestoreScript,
} from "../CollapsibleSection";
import { HomepageBackdrop } from "../HomepageBackdrop";
import layout from "../HomepageBackdrop/styles.module.css";
import { PencilIcon } from "../icons";
import { LinkTile } from "../LinkTile";
import { SearchBar } from "../SearchBar";
import sectionStyles from "../SectionView/styles.module.css";
import styles from "./styles.module.css";

type Props = {
	uuid: string;
	config: HomeConfig;
};

export function HomepageView({ uuid, config }: Props) {
	const { title, subtitle, background, search, sections } = config;

	return (
		<HomepageBackdrop backgroundImage={background.image}>
			{title || subtitle ? (
				<header className={layout.header}>
					{title ? <h1 className={layout.title}>{title}</h1> : null}
					{subtitle ? <p className={layout.sub}>{subtitle}</p> : null}
				</header>
			) : null}

			{search ? (
				<SearchBar config={search} sections={sections} uuid={uuid} />
			) : null}

			<section className={layout.linksWrap}>
				<div className={layout.sections}>
					{sections
						.filter((section) => !section.hidden)
						.map((section) => (
							<SectionLinks key={section.id} uuid={uuid} section={section} />
						))}
				</div>
				<SectionsRestoreScript uuid={uuid} />
			</section>

			<Link
				className={styles.editLink}
				href={`/${uuid}/edit`}
				aria-label="Edit"
			>
				<PencilIcon />
			</Link>
		</HomepageBackdrop>
	);
}

type SectionLinksProps = {
	uuid: string;
	section: Section;
};

function SectionLinks({ uuid, section }: SectionLinksProps) {
	const links = (
		<nav
			className={sectionStyles.quicklinks}
			aria-label={section.label || "Quick links"}
		>
			{section.links.map((link) => (
				<a
					className={sectionStyles.quicklink}
					key={link.id}
					href={link.url}
					rel="noreferrer"
				>
					<LinkTile link={link} />
				</a>
			))}
		</nav>
	);

	return section.label ? (
		<CollapsibleSection
			uuid={uuid}
			sectionId={section.id}
			label={section.label}
		>
			{links}
		</CollapsibleSection>
	) : (
		<section className={sectionStyles.section}>{links}</section>
	);
}
