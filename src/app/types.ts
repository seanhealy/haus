export type BackgroundConfig = {
	image: string;
	overlayColor?: string;
	position?: string;
};

export type QuickLink = {
	label: string;
	url: string;
};

export type SearchConfig = {
	engine: "kagi" | string;
};

export type HomeConfig = {
	background: BackgroundConfig;
	quickLinks: QuickLink[];
	search: SearchConfig;
};
