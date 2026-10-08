/**
 * Detail booking + tombol batal (Gap 2). Gaya Apple Glass, Bahasa Indonesia.
 * Props:
 *  - booking: detail aman (kode, status, tanggal, jam, kapster, layanan, harga)
 *  - canCancel: boolean — status masih bisa dibatalkan (dihitung server)
 */
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    AmbientGlow,
    Button,
    Icon,
    STATUS_BOOKING,
    StatusPill,
    TopBar,
    jamIndo,
    rupiah,
} from "../../Components/ui";
import { normalizeWa } from "../../Components/ui";

/** Baris detail: label kiri, nilai kanan. */
function Row({ icon, label, children }) {
    return (
        <div className="flex items-start gap-3 py-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-ink">
                <Icon name={icon} size={17} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="eyebrow text-ink-mute">{label}</div>
                <div className="text-[14px] font-medium text-ink">{children}</div>
            </div>
        </div>
    );
}

export default function Show({ booking, canCancel }) {
    const [confirming, setConfirming] = useState(false);
    const [whatsapp, setWhatsapp] = useState("");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    const passed = booking.has_passed || booking.status === "cancelled";

    const doCancel = () => {
        setProcessing(true);
        setError("");
        router.post(
            `/cek-booking/${encodeURIComponent(booking.kode)}/batal`,
            { whatsapp: normalizeWa(whatsapp) || whatsapp },
            {
                onError: (errs) => {
                    setError(errs.whatsapp || "Gagal membatalkan booking.");
                },
                onFinish: () => {
                    setProcessing(false);
                    setConfirming(false);
                },
            }
        );
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-canvas pb-28">
            <Head title={`Booking ${booking.kode} — Eddy Barbershop`} />
            <AmbientGlow />
            <TopBar onBack={() => router.visit("/cek-booking")} />

            <main className="relative z-10 mx-auto max-w-[420px] px-4 pt-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <div className="eyebrow text-ink-mute">Kode Booking</div>
                        <h1 className="tnum font-display text-4xl uppercase leading-none tracking-wide text-ink">
                            {booking.kode}
                        </h1>
                    </div>
                    <StatusPill status={booking.status} />
                </div>

                <section className="glass-panel rounded-ios-lg px-4 py-2" aria-label="Detail booking">
                    <Row icon="content_cut" label="Layanan">
                        {booking.service || "-"}
                        {booking.duration_minutes ? (
                            <span className="text-ink-mute"> · {booking.duration_minutes} menit</span>
                        ) : null}
                    </Row>
                    <div className="border-t border-hairline" />
                    <Row icon="person" label="Kapster">
                        {booking.barber || "Diacak oleh barbershop"}
                    </Row>
                    <div className="border-t border-hairline" />
                    <Row icon="calendar_month" label="Tanggal">
                        {booking.date_label}
                    </Row>
                    <div className="border-t border-hairline" />
                    <Row icon="schedule" label="Jam">
                        <span className="tnum">
                            {jamIndo(booking.start_time)} – {jamIndo(booking.end_time)} WIB
                        </span>
                    </Row>
                    {booking.price != null && (
                        <>
                            <div className="border-t border-hairline" />
                            <Row icon="payments" label="Harga">
                                <span className="tnum">{rupiah(booking.price)}</span>
                            </Row>
                        </>
                    )}
                    {booking.notes && (
                        <>
                            <div className="border-t border-hairline" />
                            <Row icon="sticky_note_2" label="Catatan">{booking.notes}</Row>
                        </>
                    )}
                </section>

                {/* Status & aksi batal */}
                <section className="mt-5">
                    {canCancel && !passed ? (
                        <>
                            {!confirming ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full border-[#d92d20]/20 text-[#b42318]"
                                    onClick={() => setConfirming(true)}
                                >
                                    <Icon name="cancel" size={18} />
                                    Batalkan Booking
                                </Button>
                            ) : (
                                <div
                                    role="alertdialog"
                                    aria-labelledby="konfirmasi-batal"
                                    className="glass-panel rounded-ios-lg p-4"
                                >
                                    <h2
                                        id="konfirmasi-batal"
                                        className="flex items-center gap-2 text-[15px] font-semibold text-ink"
                                    >
                                        <Icon name="warning" size={18} className="text-[#b42318]" />
                                        Batalkan booking ini?
                                    </h2>
                                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                                        Slot akan dilepas. Tindakan ini tidak bisa dibatalkan.
                                        Masukkan nomor WhatsApp untuk konfirmasi.
                                    </p>

                                    <label htmlFor="wa-konfirmasi" className="eyebrow mb-1.5 mt-3 block text-ink-mute">
                                        Nomor WhatsApp
                                    </label>
                                    <input
                                        id="wa-konfirmasi"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        placeholder="08123456789"
                                        aria-invalid={Boolean(error)}
                                        aria-describedby={error ? "wa-batal-error" : undefined}
                                        className="glass-input h-11 w-full rounded-ios-sm px-3.5 text-sm text-ink placeholder:text-ink-mute/70"
                                    />
                                    {error && (
                                        <p
                                            id="wa-batal-error"
                                            role="alert"
                                            className="mt-1.5 flex items-center gap-1 text-[12px] text-[#b42318]"
                                        >
                                            <Icon name="error" size={14} />
                                            {error}
                                        </p>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            type="button"
                                            className="flex-1"
                                            disabled={processing || !whatsapp.trim()}
                                            onClick={doCancel}
                                        >
                                            <Icon name="check" size={18} className="text-gold" />
                                            {processing ? "Memproses…" : "Ya, Batalkan"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="px-4 text-[13px]"
                                            onClick={() => {
                                                setConfirming(false);
                                                setError("");
                                            }}
                                        >
                                            Tidak
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className="glass-card rounded-ios p-4 text-[13px] leading-relaxed text-ink-soft"
                            role="status"
                        >
                            <p className="flex items-center gap-2 font-semibold text-ink">
                                <Icon
                                    name={booking.status === "cancelled" ? "block" : "info"}
                                    size={18}
                                    className="text-ink-mute"
                                />
                                {booking.status === "cancelled"
                                    ? "Booking ini sudah dibatalkan."
                                    : booking.status === "done"
                                      ? "Booking ini sudah selesai."
                                      : "Jadwal sudah lewat — pembatalan online tidak tersedia."}
                            </p>
                            {passed && booking.status !== "cancelled" && booking.status !== "done" && (
                                <p className="mt-2">
                                    Silakan hubungi admin via{" "}
                                    <Link href="/" className="font-semibold text-gold-text underline">
                                        halaman utama
                                    </Link>{" "}
                                    untuk bantuan lebih lanjut.
                                </p>
                            )}
                        </div>
                    )}

                    <p className="mt-4 text-center text-[12px] text-ink-mute">
                        Status saat ini:{" "}
                        <span className="font-semibold text-ink">
                            {STATUS_BOOKING[booking.status]?.label ?? booking.status}
                        </span>
                    </p>
                </section>
            </main>
        </div>
    );
}
