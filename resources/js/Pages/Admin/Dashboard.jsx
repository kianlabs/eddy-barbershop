/**
 * Dashboard admin — statistik ringkas + booking terbaru.
 * Props dari DashboardController: stats, recent, admin.
 */
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "../../Components/AdminLayout";
import { Icon, StatCard, StatusPill, jamIndo, tanggalIndo } from "../../Components/ui";

export default function Dashboard({ stats, recent }) {
    const cards = [
        { icon: "today", label: "Booking Hari Ini", value: stats.bookings_today, note: "Antrean tanggal ini" },
        { icon: "calendar_month", label: "Total Booking", value: stats.bookings_total, note: `${stats.bookings_pending} menunggu konfirmasi` },
        { icon: "badge", label: "Kapster", value: stats.barbers, note: `${stats.barbers_active} aktif melayani` },
        { icon: "content_cut", label: "Layanan", value: stats.services, note: `${stats.services_active} sedang tayang` },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard Admin — Eddy Barbershop" />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {cards.map((c) => (
                    <StatCard key={c.label} {...c} />
                ))}
            </div>

            <section className="mt-6">
                <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="font-display text-2xl uppercase tracking-wide text-ink">
                        Booking Terbaru
                    </h2>
                    <Link
                        href="/admin/bookings"
                        className="flex items-center gap-1 text-[12px] font-semibold text-gold-text"
                    >
                        Lihat semua
                        <Icon name="arrow_forward" size={15} />
                    </Link>
                </div>

                {recent.length === 0 ? (
                    <div className="glass-card rounded-ios px-4 py-8 text-center text-sm text-ink-mute">
                        Belum ada booking masuk.
                    </div>
                ) : (
                    <ul className="glass-card divide-y divide-black/[0.05] overflow-hidden rounded-ios">
                        {recent.map((b) => (
                            <li key={b.id} className="flex items-center justify-between gap-3 p-3.5">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-semibold text-ink">
                                            {b.customer || "Pelanggan"}
                                        </span>
                                        <span className="tnum text-[11px] text-ink-mute">
                                            #{b.id}
                                        </span>
                                    </div>
                                    <div className="mt-0.5 truncate text-[12px] text-ink-soft">
                                        {b.service} · {b.barber || "Kapster acak"}
                                    </div>
                                    <div className="tnum mt-0.5 text-[11px] text-ink-mute">
                                        {tanggalIndo(b.date)} · {jamIndo(b.start_time)} WIB
                                    </div>
                                </div>
                                <StatusPill status={b.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AdminLayout>
    );
}
