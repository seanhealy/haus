export type BackgroundConfig = {
	image: string;
	position?: string;
};

export type QuickLinkIcon = {
	scale?: number;
	backgroundColor?: string;
};

export type QuickLink = {
	label: string;
	url: string;
	icon?: QuickLinkIcon;
};

export type HomeConfig = {
	background: BackgroundConfig;
	quickLinks: QuickLink[];
};
