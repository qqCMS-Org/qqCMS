interface LogoProps {
	class?: string;
}

export function Logo({ class: className = "mb-10" }: LogoProps = {}) {
	return (
		<div class={`flex items-center gap-2.5 ${className}`}>
			<div class="w-8 h-8 bg-accent rounded-[7px] flex items-center justify-center text-base text-white font-bold">
				q
			</div>
			<span class="font-serif italic text-[26px] text-text0 tracking-[-0.5px]">
				qqCMS
			</span>
		</div>
	);
}
