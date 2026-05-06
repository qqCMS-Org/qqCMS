import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { IcoBurger, IcoColl, IcoDash, IcoGear, IcoKey, IcoLogout, IcoMedia, IcoPage } from "./icons";

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
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = async (): Promise<void> => {
		await fetch(`${apiUrl}/auth/logout`, {
			method: "POST",
			credentials: "include",
		}).catch(() => null);
		window.location.href = "/login";
	};

	const PRIMARY_IDS = ["dashboard", "pages", "media"] as const;
	const primaryItems = NAV_ITEMS.filter((item) => (PRIMARY_IDS as readonly string[]).includes(item.id));
	const overflowItems = [
		...NAV_ITEMS.filter((item) => !(PRIMARY_IDS as readonly string[]).includes(item.id)),
		{ id: "settings" as const, label: "Settings", href: "/settings", Icon: IcoGear },
	];
	const isOverflowActive = overflowItems.some((item) => item.id === activePage);

	return (
		<>
			{/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
			<aside class="sidebar-desktop">
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

			{/* ── Mobile tab bar + overflow sheet (hidden on desktop via CSS) ── */}
			<div class="sidebar-mobile">
				{/* Overflow sheet — overlay and panel are siblings so no stopPropagation needed */}
				{menuOpen && (
					<>
						<button
							type="button"
							aria-label="Close menu"
							style={{
								position: "fixed",
								inset: 0,
								zIndex: 300,
								background: "transparent",
								border: "none",
								cursor: "default",
							}}
							onClick={() => setMenuOpen(false)}
						/>
						<div
							style={{
								position: "fixed",
								bottom: 56,
								left: 0,
								right: 0,
								background: "var(--bg1)",
								borderTop: "1px solid var(--border)",
								display: "flex",
								flexDirection: "column",
								zIndex: 301,
							}}
						>
							{overflowItems.map(({ id, label, href, Icon }) => {
								const isActive = activePage === id;
								return (
									<a
										key={id}
										href={href}
										onClick={() => setMenuOpen(false)}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 12,
											padding: "13px 20px",
											borderBottom: "1px solid var(--border)",
											color: isActive ? "var(--accent)" : "var(--text0)",
											textDecoration: "none",
											fontSize: 13,
											background: isActive ? "var(--accent-faint)" : "transparent",
										}}
									>
										<Icon />
										<span>{label}</span>
									</a>
								);
							})}
							<button
								type="button"
								onClick={handleLogout}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 12,
									padding: "13px 20px",
									background: "transparent",
									border: "none",
									color: "var(--coral)",
									cursor: "pointer",
									fontSize: 13,
									textAlign: "left",
								}}
							>
								<IcoLogout />
								<span>Log out</span>
							</button>
						</div>
					</>
				)}

				{/* Bottom tab bar */}
				<nav
					style={{
						position: "fixed",
						bottom: 0,
						left: 0,
						right: 0,
						height: 56,
						background: "var(--bg0)",
						borderTop: "1px solid var(--border)",
						display: "flex",
						zIndex: 200,
					}}
				>
					{primaryItems.map(({ id, label, href, Icon }) => {
						const isActive = activePage === id;
						return (
							<a
								key={id}
								href={href}
								style={{
									flex: 1,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									gap: 3,
									color: isActive ? "var(--accent)" : "var(--text2)",
									textDecoration: "none",
									fontSize: 9,
									borderTop: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
									transition: "color 0.13s",
								}}
							>
								<Icon />
								<span style={{ lineHeight: 1 }}>{label}</span>
							</a>
						);
					})}
					<button
						type="button"
						onClick={() => setMenuOpen((open) => !open)}
						style={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: 3,
							background: "none",
							border: "none",
							borderTop: `2px solid ${isOverflowActive || menuOpen ? "var(--accent)" : "transparent"}`,
							color: isOverflowActive || menuOpen ? "var(--accent)" : "var(--text2)",
							cursor: "pointer",
							fontSize: 9,
							transition: "color 0.13s",
						}}
					>
						<IcoBurger open={menuOpen} />
						<span style={{ lineHeight: 1 }}>More</span>
					</button>
				</nav>
			</div>
		</>
	);
};
