import type { HomeConfig, QuickLink } from "../types";
import { SearchBox } from "./SearchBox";

type Props = {
	config: HomeConfig;
};

type QuickLinksProps = {
	links: QuickLink[];
};

function QuickLinks({ links }: QuickLinksProps) {
	if (!links || links.length === 0) {
		return <div className="quicklinks-empty">No quick links configured.</div>;
	}

	return (
		<nav className="quicklinks" aria-label="Quick links">
			{links.map((link) => (
				<a className="quicklink" key={link.url} href={link.url}>
					{link.label}
				</a>
			))}
		</nav>
	);
}

export function Homepage({ config }: Props) {
	const bgStyle = {
		backgroundImage: `url(${config.background.image})`,
		backgroundPosition: config.background.position ?? "center center",
	};

	return (
		<div className="hp-root">
			<div className="hp-bg" style={bgStyle} />
			<div
				className="hp-overlay"
				style={{
					backgroundColor: config.background.overlayColor ?? "rgba(0,0,0,0.35)",
				}}
			/>
			<main className="hp-content">
				<header className="hp-header">
					<h1 className="hp-title">Welcome</h1>
					<p className="hp-sub">Start your session</p>
				</header>

				<section className="hp-search">
					<SearchBox searchConfig={config.search} />
				</section>

				<section className="hp-links">
					<QuickLinks links={config.quickLinks} />
				</section>
			</main>
		</div>
	);
}
