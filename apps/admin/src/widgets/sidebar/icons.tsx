import type { JSX } from "preact";

export const IcoDash = (): JSX.Element => (
	<svg width={14} height={14} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
		<rect x="1" y="1" width="6" height="6" rx="1" />
		<rect x="9" y="1" width="6" height="6" rx="1" />
		<rect x="1" y="9" width="6" height="6" rx="1" />
		<rect x="9" y="9" width="6" height="6" rx="1" />
	</svg>
);

export const IcoPage = (): JSX.Element => (
	<svg
		width={14}
		height={14}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
		style={{ flexShrink: 0 }}
	>
		<path d="M3 1h7l3 3v11H3V1z" />
		<path d="M10 1v3h3" />
		<line x1="5" y1="7" x2="11" y2="7" />
		<line x1="5" y1="10" x2="9" y2="10" />
	</svg>
);

export const IcoColl = (): JSX.Element => (
	<svg
		width={14}
		height={14}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
		style={{ flexShrink: 0 }}
	>
		<ellipse cx="8" cy="4" rx="6" ry="2" />
		<path d="M2 4v3c0 1.1 2.7 2 6 2s6-.9 6-2V4" />
		<path d="M2 7v3c0 1.1 2.7 2 6 2s6-.9 6-2V7" />
		<path d="M2 10v2c0 1.1 2.7 2 6 2s6-.9 6-2v-2" />
	</svg>
);

export const IcoMedia = (): JSX.Element => (
	<svg
		width={14}
		height={14}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
		style={{ flexShrink: 0 }}
	>
		<rect x="1" y="2" width="14" height="12" rx="1" />
		<path d="M1 10l4-4 3 3 2-2 5 5" />
		<circle cx="11" cy="5" r="1.5" fill="currentColor" stroke="none" />
	</svg>
);

export const IcoKey = (): JSX.Element => (
	<svg
		width={14}
		height={14}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
		style={{ flexShrink: 0 }}
	>
		<circle cx="6" cy="7" r="4" />
		<circle cx="6" cy="7" r="2" />
		<path d="M9.4 9.4l5 5M12 12l2-2" />
	</svg>
);

export const IcoGear = (): JSX.Element => (
	<svg
		width={14}
		height={14}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
		style={{ flexShrink: 0 }}
	>
		<circle cx="8" cy="8" r="2.5" />
		<path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
	</svg>
);

export const IcoLang = (): JSX.Element => (
	<svg
		width={14}
		height={14}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
		style={{ flexShrink: 0 }}
	>
		<circle cx="8" cy="8" r="6.5" />
		<path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5" />
		<path d="M8 1.5C8 1.5 10.5 4 10.5 8s-2.5 6.5-2.5 6.5" />
		<line x1="1.5" y1="8" x2="14.5" y2="8" />
	</svg>
);

export const IcoNav = (): JSX.Element => (
	<svg
		width={14}
		height={14}
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.2"
		aria-hidden="true"
		style={{ flexShrink: 0 }}
	>
		<line x1="2" y1="4" x2="14" y2="4" />
		<line x1="2" y1="8" x2="10" y2="8" />
		<line x1="2" y1="12" x2="12" y2="12" />
	</svg>
);

export const IcoLogout = (): JSX.Element => (
	<svg width={14} height={14} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
		<path
			d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
			stroke="currentColor"
			strokeWidth="1.2"
			fill="none"
		/>
	</svg>
);

interface IcoBurgerProps {
	open: boolean;
}

export const IcoBurger = ({ open }: IcoBurgerProps): JSX.Element =>
	open ? (
		<svg
			width={14}
			height={14}
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			aria-hidden="true"
		>
			<line x1="3" y1="3" x2="13" y2="13" />
			<line x1="13" y1="3" x2="3" y2="13" />
		</svg>
	) : (
		<svg
			width={14}
			height={14}
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			aria-hidden="true"
		>
			<line x1="2" y1="4" x2="14" y2="4" />
			<line x1="2" y1="8" x2="14" y2="8" />
			<line x1="2" y1="12" x2="14" y2="12" />
		</svg>
	);
