import { Button } from "@repo/ui/Button";
import { Card } from "@repo/ui/Card";
import { Input } from "@repo/ui/Input";
import { Logo } from "@repo/ui/Logo";
import { api } from "@shared/api/client";
import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { useState } from "preact/hooks";

const LoginSchema = Type.Object({
	login: Type.String({ minLength: 1 }),
	password: Type.String({ minLength: 1 }),
});

type LoginInput = Static<typeof LoginSchema>;

interface LoginFormState {
	values: LoginInput;
	error: string;
	loading: boolean;
	showPassword: boolean;
}

const INITIAL_STATE: LoginFormState = {
	values: { login: "", password: "" },
	error: "",
	loading: false,
	showPassword: false,
};

export function LoginForm() {
	const [formState, setFormState] = useState<LoginFormState>(INITIAL_STATE);

	const setField = (field: keyof LoginInput, value: string): void => {
		setFormState((previous) => ({
			...previous,
			values: { ...previous.values, [field]: value },
		}));
	};

	const handleSubmit = async (event: Event): Promise<void> => {
		event.preventDefault();

		if (!Value.Check(LoginSchema, formState.values)) {
			setFormState((previous) => ({ ...previous, error: "Please enter your login and password." }));
			return;
		}

		setFormState((previous) => ({ ...previous, loading: true, error: "" }));

		try {
			const { data, error: apiError } = await api.auth.login.post(formState.values);

			if (apiError) {
				const errValue = apiError.value;
				let message = "Invalid credentials";
				if (
					typeof errValue === "object" &&
					errValue !== null &&
					"error" in errValue &&
					typeof errValue.error === "string"
				) {
					message = errValue.error;
				}
				setFormState((previous) => ({ ...previous, error: message }));
			} else if (data?.ok) {
				window.location.href = "/";
			}
		} catch {
			setFormState((previous) => ({ ...previous, error: "An unexpected error occurred" }));
		} finally {
			setFormState((previous) => ({ ...previous, loading: false }));
		}
	};

	return (
		<div class="min-h-screen bg-bg0 flex flex-col items-center justify-center p-5">
			<Logo />

			<Card>
				<div class="font-serif italic text-[22px] text-text0 mb-1">Sign in</div>
				<div class="mb-6" />

				<form onSubmit={handleSubmit} class="flex flex-col gap-3.5">
					<Input
						type="email"
						label="Email"
						value={formState.values.login}
						onInput={(event) => setField("login", event.currentTarget.value)}
						placeholder="admin@example.com"
						autoComplete="email"
						error={!!formState.error}
					/>

					<Input
						type={formState.showPassword ? "text" : "password"}
						label="Password"
						value={formState.values.password}
						onInput={(event) => setField("password", event.currentTarget.value)}
						placeholder="••••••••"
						autoComplete="current-password"
						error={!!formState.error}
						rightElement={
							<button
								type="button"
								onClick={() => setFormState((previous) => ({ ...previous, showPassword: !previous.showPassword }))}
								aria-label={formState.showPassword ? "Hide password" : "Show password"}
								class="bg-transparent border-none text-text2 cursor-pointer text-xs p-0.5"
							>
								<span aria-hidden="true">{formState.showPassword ? "○" : "●"}</span>
							</button>
						}
					/>

					{formState.error && (
						<div class="px-2.75 py-2 bg-coral-faint border border-coral/30 rounded-[5px] text-[11px] text-coral">
							{formState.error}
						</div>
					)}

					<Button type="submit" loading={formState.loading} class="w-full mt-1">
						Sign in &rarr;
					</Button>
				</form>

				{import.meta.env.DEV && (
					<div class="mt-5 p-3 bg-bg3 border border-ui-border rounded-md">
						<div class="text-[10px] text-text2 mb-1">Demo credentials</div>
						<div class="text-[10px] text-text1 font-mono leading-[1.7]">
							admin@example.com
							<br />
							admin
						</div>
					</div>
				)}
			</Card>

			<div class="mt-6 text-[10px] text-text2">qqCMS v0.1.0</div>
		</div>
	);
}
