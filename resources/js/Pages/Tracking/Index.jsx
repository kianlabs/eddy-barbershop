/**
 * Cek & batalkan booking tanpa akun — form pencarian (Gap 2).
 * Gaya Apple Glass, Bahasa Indonesia, aksesibel.
 */
import { Head, Link, useForm } from "@inertiajs/react";
import { AmbientGlow, Button, Icon, TopBar } from "../../Components/ui";

export default function Index({ flash }) {
    const { data, setData, post, processing, errors } = useForm({
        kode: "",
        whatsapp: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/cek-booking");
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-canvas pb-20">
            <Head title="Cek Booking — Eddy Barbershop" />
            <AmbientGlow />
            <TopBar onBack={() => (window.location.href = "/")} />

            <main className="relative z-10 mx-auto flex max-w-[420px] flex-col px-4 pt-8">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink shadow-sm">
                        <Icon name="event_available" size={26} className="text-gold" />
                    </div>
                    <h1 className="font-display text-4xl uppercase leading-none tracking-wider text-ink">
                        Cek Booking
                    </h1>
                    <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-ink-soft">
                        Masukkan kode booking dan nomor WhatsApp yang dipakai saat memesan
                        untuk melihat status atau membatalkan.
                    </p>
                </div>

                {flash?.success && (
                    <div
                        role="status"
                        className="mb-4 flex items-start gap-2 rounded-ios-sm border border-confirmed/30 bg-confirmed/10 p-3 text-[13px] text-ink"
                    >
                        <Icon name="check_circle" size={18} className="mt-0.5 shrink-0 text-confirmed" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <form onSubmit={submit} className="glass-panel space-y-4 rounded-ios-lg p-5" noValidate>
                    <div>
                        <label htmlFor="kode" className="eyebrow mb-1.5 block text-ink-mute">
                            Kode Booking
                        </label>
                        <input
                            id="kode"
                            name="kode"
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            autoFocus
                            required
                            value={data.kode}
                            onChange={(e) => setData("kode", e.target.value)}
                            placeholder="#EB-12"
                            aria-describedby={errors.kode ? "kode-error" : "kode-hint"}
                            aria-invalid={Boolean(errors.kode)}
                            className="glass-input h-12 w-full rounded-ios-sm px-3.5 text-sm text-ink placeholder:text-ink-mute/70"
                        />
                        <p id="kode-hint" className="mt-1.5 text-[12px] text-ink-mute">
                            Contoh: #EB-12 (tertera pada konfirmasi pemesanan).
                        </p>
                        {errors.kode && (
                            <p
                                id="kode-error"
                                role="alert"
                                className="mt-1.5 flex items-center gap-1 text-[12px] text-[#b42318]"
                            >
                                <Icon name="error" size={14} />
                                {errors.kode}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="whatsapp" className="eyebrow mb-1.5 block text-ink-mute">
                            Nomor WhatsApp
                        </label>
                        <input
                            id="whatsapp"
                            name="whatsapp"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            required
                            value={data.whatsapp}
                            onChange={(e) => setData("whatsapp", e.target.value)}
                            placeholder="08123456789"
                            aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
                            aria-invalid={Boolean(errors.whatsapp)}
                            className="glass-input h-12 w-full rounded-ios-sm px-3.5 text-sm text-ink placeholder:text-ink-mute/70"
                        />
                        {errors.whatsapp && (
                            <p
                                id="whatsapp-error"
                                role="alert"
                                className="mt-1.5 flex items-center gap-1 text-[12px] text-[#b42318]"
                            >
                                <Icon name="error" size={14} />
                                {errors.whatsapp}
                            </p>
                        )}
                    </div>

                    <Button type="submit" className="w-full uppercase tracking-wider" disabled={processing}>
                        <Icon name="search" size={18} className="text-gold" />
                        {processing ? "Mencari…" : "Cari Booking"}
                    </Button>
                </form>

                <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-mute">
                    Belum punya booking?{" "}
                    <Link href="/booking" className="font-semibold text-gold-text underline">
                        Pesan sekarang
                    </Link>
                    .
                </p>
            </main>
        </div>
    );
}
