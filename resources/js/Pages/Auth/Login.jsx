/**
 * Halaman login panel admin — gaya Apple Glass (lihat DESIGN.md).
 * Form dikirim lewat Inertia `useForm` (CSRF ditangani otomatis oleh Laravel).
 */
import { Head, useForm } from "@inertiajs/react";
import { AmbientGlow, Button, Icon, TopBar } from "../../Components/ui";

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post("/login", {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-canvas">
            <Head title="Masuk Admin — Eddy Barbershop" />
            <AmbientGlow />
            <TopBar onBack={() => (window.location.href = "/")} />

            <main className="relative z-10 mx-auto flex max-w-[420px] flex-col px-4 pt-8 pb-16">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink shadow-sm">
                        <Icon name="lock" size={26} className="text-gold" />
                    </div>
                    <h1 className="font-display text-4xl uppercase leading-none tracking-wider text-ink">
                        Masuk Panel Admin
                    </h1>
                    <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-ink-soft">
                        Khusus pengelola Eddy Barbershop. Kelola booking, layanan, dan kapster.
                    </p>
                </div>

                <form onSubmit={submit} className="glass-panel space-y-4 rounded-ios-lg p-5">
                    <div>
                        <label htmlFor="email" className="eyebrow mb-1.5 block text-ink-mute">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="username"
                            autoFocus
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="admin@eddybarber.test"
                            className="glass-input h-12 w-full rounded-ios-sm px-3.5 text-sm text-ink placeholder:text-ink-mute/70"
                        />
                        {errors.email && (
                            <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#b42318]">
                                <Icon name="error" size={14} />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="eyebrow mb-1.5 block text-ink-mute">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            placeholder="••••••••"
                            className="glass-input h-12 w-full rounded-ios-sm px-3.5 text-sm text-ink placeholder:text-ink-mute/70"
                        />
                        {errors.password && (
                            <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#b42318]">
                                <Icon name="error" size={14} />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-soft">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData("remember", e.target.checked)}
                            className="h-4 w-4 rounded border-black/20 text-gold focus:ring-gold"
                        />
                        Ingat saya di perangkat ini
                    </label>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full uppercase tracking-wider"
                    >
                        <Icon name="login" size={18} className="text-gold" />
                        {processing ? "Memproses…" : "Masuk"}
                    </Button>
                </form>

                <p className="mt-5 text-center text-[11px] text-ink-mute">
                    Duduk Anteng, Pulang Ganteng — Panel internal.
                </p>
            </main>
        </div>
    );
}
