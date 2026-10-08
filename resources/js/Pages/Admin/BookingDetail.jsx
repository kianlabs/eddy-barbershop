/**
 * Detail Booking Admin (Gap 6) — menampilkan semua field yang tersimpan
 * (pelanggan, kontak WA, kapster, layanan, tanggal, jam, catatan, harga)
 * serta aksi ubah status langsung dari halaman detail.
 * Props: booking, statuses.
 */
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "../../Components/AdminLayout";
import {
    Button,
    Icon,
    IconAction,
    StatusPill,
    harga,
    jamIndo,
    rupiah,
    tanggalIndo,
    waLink,
} from "../../Components/ui";

export default function BookingDetail({ booking, statuses }) {
    const changeStatus = (status) => {
        router.patch(
            `/admin/bookings/${booking.id}/status`,
            { status },
            { preserveScroll: true }
        );
    };

    const statusOptions = [
        { key: "confirmed", label: "Konfirmasi Booking", icon: "check_circle", tone: "default" },
        { key: "done", label: "Tandai Selesai", icon: "task_alt", tone: "default" },
        { key: "cancelled", label: "Batalkan Booking", icon: "cancel", tone: "danger" },
    ].filter((s) => s.key !== booking.status);

    return (
        <AdminLayout
            title={`Booking #${booking.id}`}
            eyebrow="Rincian Booking"
            action={
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/bookings"
                        className="glass-card inline-flex h-10 items-center gap-1 rounded-ios px-3 text-xs font-semibold text-ink hover:bg-white"
                    >
                        <Icon name="arrow_back" size={16} />
                        Semua Booking
                    </Link>
                </div>
            }
        >
            <Head title={`Booking #${booking.id} — Admin Eddy Barbershop`} />

            {/* Header Ringkasan */}
            <div className="glass-card mb-4 flex flex-wrap items-center justify-between gap-3 rounded-ios p-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-display text-2xl uppercase tracking-wide text-ink">
                            #{booking.id}
                        </span>
                        <StatusPill status={booking.status} />
                    </div>
                    <div className="tnum mt-1 text-xs text-ink-mute">
                        Dibuat: {booking.created_at ? new Date(booking.created_at).toLocaleString("id-ID") : "-"}
                    </div>
                </div>

                {/* Aksi cepat status */}
                <div className="flex flex-wrap items-center gap-2">
                    {statusOptions.map((opt) => (
                        <IconAction
                            key={opt.key}
                            icon={opt.icon}
                            label={opt.label}
                            tone={opt.tone}
                            onClick={() => changeStatus(opt.key)}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Kartu 1: Pelanggan & Kontak */}
                <div className="glass-card rounded-ios p-4">
                    <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
                        <Icon name="person" size={18} className="text-gold-text" />
                        <h2 className="font-display text-lg uppercase tracking-wide text-ink">
                            Informasi Pelanggan
                        </h2>
                    </div>

                    <dl className="space-y-2.5 text-xs">
                        <div>
                            <dt className="eyebrow text-ink-mute">Nama Pelanggan</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-ink">
                                {booking.customer?.name || "Pelanggan Tanpa Nama"}
                            </dd>
                        </div>

                        <div>
                            <dt className="eyebrow text-ink-mute">Nomor WhatsApp</dt>
                            <dd className="mt-0.5">
                                <a
                                    href={waLink(
                                        booking.whatsapp || booking.customer?.whatsapp,
                                        `Halo ${booking.customer?.name || ""}, konfirmasi booking Eddy Barbershop #${booking.id} pada ${tanggalIndo(booking.date)} jam ${jamIndo(booking.start_time)} WIB.`
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-confirmed hover:underline"
                                >
                                    <Icon name="chat" size={15} />
                                    {booking.whatsapp || booking.customer?.whatsapp || "-"}
                                </a>
                            </dd>
                        </div>

                        {booking.customer?.email && (
                            <div>
                                <dt className="eyebrow text-ink-mute">Email Akun</dt>
                                <dd className="mt-0.5 text-ink-soft">{booking.customer.email}</dd>
                            </div>
                        )}

                        <div>
                            <dt className="eyebrow text-ink-mute">Catatan Khusus</dt>
                            <dd className="mt-0.5 rounded-ios-sm bg-black/[0.03] p-2.5 text-xs leading-relaxed text-ink-soft">
                                {booking.notes ? (
                                    <span className="whitespace-pre-line">{booking.notes}</span>
                                ) : (
                                    <span className="italic text-ink-mute">Tidak ada catatan dari pelanggan.</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Kartu 2: Jadwal & Layanan */}
                <div className="glass-card rounded-ios p-4">
                    <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
                        <Icon name="calendar_month" size={18} className="text-gold-text" />
                        <h2 className="font-display text-lg uppercase tracking-wide text-ink">
                            Jadwal & Layanan
                        </h2>
                    </div>

                    <dl className="space-y-2.5 text-xs">
                        <div>
                            <dt className="eyebrow text-ink-mute">Tanggal & Jam Booking</dt>
                            <dd className="tnum mt-0.5 text-sm font-semibold text-ink">
                                {tanggalIndo(booking.date)} · {jamIndo(booking.start_time)} – {jamIndo(booking.end_time)} WIB
                            </dd>
                        </div>

                        <div>
                            <dt className="eyebrow text-ink-mute">Kapster Pilihan</dt>
                            <dd className="mt-0.5 flex items-center gap-2">
                                <span className="text-sm font-semibold text-ink">
                                    {booking.barber?.name || "Kapster Acak"}
                                </span>
                                {booking.barber?.specialty && (
                                    <span className="text-[11px] text-ink-soft">
                                        ({booking.barber.specialty})
                                    </span>
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt className="eyebrow text-ink-mute">Layanan Dipilih</dt>
                            <dd className="mt-0.5">
                                <div className="text-sm font-semibold text-ink">
                                    {booking.service?.name || "—"}
                                </div>
                                {booking.service?.description && (
                                    <div className="mt-0.5 text-[11px] text-ink-soft">
                                        {booking.service.description}
                                    </div>
                                )}
                            </dd>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-hairline pt-2">
                            <div>
                                <dt className="eyebrow text-ink-mute">Durasi</dt>
                                <dd className="tnum mt-0.5 text-sm font-semibold text-ink">
                                    {booking.service?.duration_minutes ?? 30} menit
                                </dd>
                            </div>
                            <div>
                                <dt className="eyebrow text-ink-mute">Tarif Layanan</dt>
                                <dd className="tnum mt-0.5 text-sm font-semibold text-ink">
                                    {harga(booking.service)}
                                </dd>
                            </div>
                        </div>
                    </dl>
                </div>
            </div>
        </AdminLayout>
    );
}
