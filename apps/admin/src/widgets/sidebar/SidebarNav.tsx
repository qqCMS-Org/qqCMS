import { api } from "@shared/api/client";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { IcoBurger, IcoColl, IcoDash, IcoGear, IcoKey, IcoLang, IcoLogout, IcoMedia, IcoNav, IcoPage } from "./icons";

const NAV_ITEMS = [
	{ id: "dashboard", label: "Dashboard", href: "/", Icon: IcoDash },
	{ id: "pages", label: "Pages", href: "/pages", Icon: IcoPage },
	{ id: "languages", label: "Languages", href: "/languages", Icon: IcoLang },
	{ id: "navigation", label: "Navigation", href: "/navigation", Icon: IcoNav },
	{ id: "collections", label: "Collections", href: "/collections", Icon: IcoColl },
	{ id: "media", label: "Media", href: "/media", Icon: IcoMedia },
	{ id: "apikeys", label: "API Keys", href: "/api-keys", Icon: IcoKey },
] as const;

type NavItemId = (typeof NAV_ITEMS)[number]["id"] | "settings";

export type { NavItemId };

interface SidebarNavProps {
	activePage: NavItemId;
}

export const SidebarNav = ({ activePage }: SidebarNavProps): JSX.Element => {
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = async (): Promise<void> => {
		await api.auth.logout.post().catch(() => null);
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
				<div class="px-3.5 pt-[13px] pb-[11px] border-b border-ui-border flex items-center gap-2">
					<div class="w-[22px] h-[22px] bg-accent rounded-[5px] flex items-center justify-center text-[11px] text-white font-bold shrink-0">
						q
					</div>
					<div>
						<div class="font-serif italic text-[15px] text-text0 leading-none">qqCMS</div>
						<div class="text-[9px] text-text2 mt-px">v0.1.0</div>
					</div>
				</div>

				{/* Nav items */}
				<nav class="flex-1 py-1.5">
					{NAV_ITEMS.map(({ id, label, href, Icon }) => {
						const isActive = activePage === id;
						const isHovered = hoveredItem === id;
						return (
							<a
								key={id}
								href={href}
								onMouseEnter={() => setHoveredItem(id)}
								onMouseLeave={() => setHoveredItem(null)}
								class={`w-full flex items-center gap-2 px-3.5 py-[7px] text-[11px] transition-all duration-150 no-underline cursor-pointer border-l-2
									${
										isActive
											? "bg-accent-faint border-accent text-accent"
											: isHovered
												? "bg-white/5 border-transparent text-text0"
												: "bg-transparent border-transparent text-text1"
									}`}
							>
								<Icon />
								<span class="flex-1">{label}</span>
							</a>
						);
					})}
				</nav>

				{/* Footer: Settings + Logout */}
				<div class="border-t border-ui-border py-1.5">
					{(() => {
						const isActive = activePage === "settings";
						const isHovered = hoveredItem === "settings";
						return (
							<a
								href="/settings"
								onMouseEnter={() => setHoveredItem("settings")}
								onMouseLeave={() => setHoveredItem(null)}
								class={`w-full flex items-center gap-2 px-3.5 py-[7px] text-[11px] transition-all duration-150 no-underline cursor-pointer border-l-2
									${
										isActive
											? "bg-accent-faint border-accent text-accent"
											: isHovered
												? "bg-white/5 border-transparent text-text0"
												: "bg-transparent border-transparent text-text1"
									}`}
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
						class={`w-full flex items-center gap-2 px-3.5 py-[7px] text-[11px] transition-colors duration-150 bg-transparent border-none border-l-2 border-transparent cursor-pointer text-left
							${hoveredItem === "logout" ? "text-coral" : "text-text2"}`}
					>
						<IcoLogout />
						<span>Log out</span>
					</button>
				</div>
			</aside>

			{/* ── Mobile tab bar + overflow sheet (hidden on desktop via CSS) ── */}
			<div class="sidebar-mobile">
				{/* Overflow sheet */}
				{menuOpen && (
					<>
						<button
							type="button"
							aria-label="Close menu"
							class="fixed inset-0 z-[300] bg-transparent border-none cursor-default"
							onClick={() => setMenuOpen(false)}
						/>
						<div class="fixed bottom-[56px] left-0 right-0 bg-bg1 border-t border-ui-border flex flex-col z-[301]">
							{overflowItems.map(({ id, label, href, Icon }) => {
								const isActive = activePage === id;
								return (
									<a
										key={id}
										href={href}
										onClick={() => setMenuOpen(false)}
										class={`flex items-center gap-3 px-5 py-[13px] border-b border-ui-border text-[13px] no-underline transition-colors
											${isActive ? "bg-accent-faint text-accent" : "bg-transparent text-text0"}`}
									>
										<Icon />
										<span>{label}</span>
									</a>
								);
							})}
							<button
								type="button"
								onClick={handleLogout}
								class="flex items-center gap-3 px-5 py-[13px] bg-transparent border-none text-coral cursor-pointer text-[13px] text-left"
							>
								<IcoLogout />
								<span>Log out</span>
							</button>
						</div>
					</>
				)}

				{/* Bottom tab bar */}
				<nav class="fixed bottom-0 left-0 right-0 h-[56px] bg-bg0 border-t border-ui-border flex z-[200]">
					{primaryItems.map(({ id, label, href, Icon }) => {
						const isActive = activePage === id;
						return (
							<a
								key={id}
								href={href}
								class={`flex-1 flex flex-col items-center justify-center gap-1 text-[9px] no-underline border-t-2 transition-colors duration-150
									${isActive ? "text-accent border-accent" : "text-text2 border-transparent"}`}
							>
								<Icon />
								<span class="leading-none">{label}</span>
							</a>
						);
					})}
					<button
						type="button"
						onClick={() => setMenuOpen((open) => !open)}
						class={`flex-1 flex flex-col items-center justify-center gap-1 bg-transparent border-none border-t-2 cursor-pointer text-[9px] transition-colors duration-150
							${isOverflowActive || menuOpen ? "text-accent border-accent" : "text-text2 border-transparent"}`}
					>
						<IcoBurger open={menuOpen} />
						<span class="leading-none">More</span>
					</button>
				</nav>
			</div>
		</>
	);
};
