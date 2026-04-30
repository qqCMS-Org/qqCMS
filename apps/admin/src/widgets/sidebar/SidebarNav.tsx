import type { JSX } from "preact";
import { useState } from "preact/hooks";

// ── Icons ─────────────────────────────────────────────

const IcoDash = (): JSX.Element => (
	<svg width={14} height={14} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
		<rect x="1" y="1" width="6" height="6" rx="1" />
		<rect x="9" y="1" width="6" height="6" rx="1" />
		<rect x="1" y="9" width="6" height="6" rx="1" />
		<rect x="9" y="9" width="6" height="6" rx="1" />
	</svg>
);

const IcoPage = (): JSX.Element => (
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

const IcoColl = (): JSX.Element => (
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

const IcoMedia = (): JSX.Element => (
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

const IcoKey = (): JSX.Element => (
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

const IcoGear = (): JSX.Element => (
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

const IcoLogout = (): JSX.Element => (
	<svg width={14} height={14} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
		<path
			d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
			stroke="currentColor"
			strokeWidth="1.2"
			fill="none"
		/>
	</svg>
);

// ── Nav config ────────────────────────────────────────

const NAV_ITEMS = [
	{ id: "dashboard", label: "Dashboard", href: "/", Icon: IcoDash },
	{ id: "pages", label: "Pages", href: "/pages", Icon: IcoPage },
	{ id: "collections", label: "Collections", href: "/collections", Icon: IcoColl },
	{ id: "media", label: "Media", href: "/media", Icon: IcoMedia },
	{ id: "apikeys", label: "API Keys", href: "/api-keys", Icon: IcoKey },
] as const;

type NavItemId = (typeof NAV_ITEMS)[number]["id"] | "settings";

export type { NavItemId };

// ── Props ─────────────────────────────────────────────

interface SidebarNavProps {
	activePage: NavItemId;
	apiUrl: string;
}

// ── Component ─────────────────────────────────────────

export const SidebarNav = ({ activePage, apiUrl }: SidebarNavProps): JSX.Element => {
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);

	const handleLogout = async (): Promise<void> => {
		await fetch(`${apiUrl}/auth/logout`, {
			method: "POST",
			credentials: "include",
		}).catch(() => null);
		window.location.href = "/login";
	};

	return (
		<aside
			style={{
				width: 180,
				minHeight: "100vh",
				background: "var(--bg0)",
				borderRight: "1px solid var(--border)",
				display: "flex",
				flexDirection: "column",
				flexShrink: 0,
			}}
		>
			{/* Logo */}
			<div
				style={{
					padding: "13px 14px 11px",
					borderBottom: "1px solid var(--border)",
					display: "flex",
					alignItems: "center",
					gap: 8,
				}}
			>
				<div
					style={{
						width: 22,
						height: 22,
						background: "var(--accent)",
						borderRadius: 5,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 11,
						color: "#fff",
						fontWeight: 700,
						flexShrink: 0,
					}}
				>
					q
				</div>
				<div>
					<div
						style={{
							fontFamily: "Instrument Serif, serif",
							fontStyle: "italic",
							fontSize: 15,
							color: "var(--text0)",
							lineHeight: 1,
						}}
					>
						qqCMS
					</div>
					<div style={{ fontSize: 9, color: "var(--text2)", marginTop: 1 }}>v0.1.0</div>
				</div>
			</div>

			{/* Nav items */}
			<nav style={{ flex: 1, padding: "6px 0" }}>
				{NAV_ITEMS.map(({ id, label, href, Icon }) => {
					const isActive = activePage === id;
					const isHovered = hoveredItem === id;
					return (
						<a
							key={id}
							href={href}
							onMouseEnter={() => setHoveredItem(id)}
							onMouseLeave={() => setHoveredItem(null)}
							style={{
								width: "100%",
								display: "flex",
								alignItems: "center",
								gap: 8,
								padding: "7px 14px",
								background: isActive ? "var(--accent-faint)" : isHovered ? "rgba(255,255,255,0.025)" : "transparent",
								borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
								color: isActive ? "var(--accent)" : isHovered ? "var(--text0)" : "var(--text1)",
								cursor: "pointer",
								fontSize: 11,
								transition: "all 0.13s",
								textDecoration: "none",
							}}
						>
							<Icon />
							<span style={{ flex: 1 }}>{label}</span>
						</a>
					);
				})}
			</nav>

			{/* Footer: Settings + Logout */}
			<div style={{ borderTop: "1px solid var(--border)", padding: "6px 0" }}>
				{(() => {
					const isActive = activePage === "settings";
					return (
						<a
							href="/settings"
							onMouseEnter={() => setHoveredItem("settings")}
							onMouseLeave={() => setHoveredItem(null)}
							style={{
								width: "100%",
								display: "flex",
								alignItems: "center",
								gap: 8,
								padding: "7px 14px",
								background: isActive ? "var(--accent-faint)" : "transparent",
								borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
								color: isActive ? "var(--accent)" : "var(--text1)",
								cursor: "pointer",
								fontSize: 11,
								textDecoration: "none",
							}}
						>
							<IcoGear />
							<span>Settings</span>
						</a>
					);
				})()}
				<button
					type="button"
					onClick={handleLogout}
					onMouseEnter={() => setHoveredItem("logout")}
					onMouseLeave={() => setHoveredItem(null)}
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						gap: 8,
						padding: "7px 14px",
						background: "transparent",
						border: "none",
						borderLeft: "2px solid transparent",
						color: hoveredItem === "logout" ? "var(--coral)" : "var(--text2)",
						cursor: "pointer",
						fontSize: 11,
						transition: "color 0.13s",
						textAlign: "left",
					}}
				>
					<IcoLogout />
					<span>Log out</span>
				</button>
			</div>
		</aside>
	);
};
