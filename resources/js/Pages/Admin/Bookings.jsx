/**
 * Daftar booking admin — tabel + filter (tanggal/status/kapster) + aksi.
 * Props: bookings (paginator), filters, barbers, statuses.
 */
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "../../Components/AdminLayout";
import {
    Button,
    Icon,
    IconAction,
    StatusPill,
    jamIndo,
    rupiah,
    statusInfo,
    tanggalIndo,
    waLink,
} from "../../Components/ui";

export default function Bookings({ bookings, filters, barbers, statuses }) {
    const [form, setForm] = useState({
        date: filters.date || "",
        status: filters.status || "",
        barber_id: filters.barber_id || "",
    });

    const rows = bookings.data || [];
    const links = bookings.links || [];

    const applyFilters = (next = form) => {
        router.get("/admin/bookings", clean(next), { preserveState: true, replace: true });
    };

    const onFilterChange = (key, value) => {
        const next = { ...form, [key]: value };
        setForm(next);
        applyFilters(next);
    };

    const resetFilter = () => {
        const blank = { date: "", status: "", barber_id: "" };
        setForm(blank);
        applyFilters(blank);
    };

    const changeStatus = (booking, status) => {
        router.patch(
            `/admin/bookings/${booking.id}/status`,
            { status },
            { preserveScroll: true }
        );
    };

    const hasFilter = Boolean(form.date || form.status || form.barber_id);

    return (
        <AdminLayout title="Daftar Booking" eyebrow="Kelola Jadwal">
            <Head title="Booking — Admin Eddy Barbershop" />

            {/* Filter */}
            <div className="glass-card mb-4 rounded-ios p-3.5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field label="Tanggal" icon="calendar_today">
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => onFilterChange("date", e.target.value)}
                            className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                        />
                    </Field>

                    <Field label="Status" icon="fact_check">
                        <select
                            value={form.status}
                            onChange={(e) => onFilterChange("status", e.target.value)}
                            className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                        >
                            <option value="">Semua status</option>
                            {statuses.map((s) => (
                                <option key={s} value={s}>
                                    {statusInfo(s).label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Kapster" icon="badge">
                        <select
                            value={form.barber_id}
                            onChange={(e) => onFilterChange("barber_id", e.target.value)}
                            className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                        >
                            <option value="">Semua kapster</option>
                            {barbers.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                {hasFilter && (
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={resetFilter}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft hover:text-ink"
                        >
                            <Icon name="filter_alt_off" size={15} />
                            Bersihkan filter
                        </button>
                    </div>
                )}
            </div>

            {/* Tabel */}
            {rows.length === 0 ? (
                <div className="glass-card rounded-ios px-4 py-10 text-center text-sm text-ink-mute">
                    Tidak ada booking yang cocok dengan filter ini.
                </div>
            ) : (
                <>
                    {/* Desktop: tabel */}
                    <div className="glass-card hidden overflow-hidden rounded-ios md:block">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-hairline text-[11px] uppercase tracking-wider text-ink-mute">
                                    <th className="px-3.5 py-2.5 font-semibold">Waktu</th>
                                    <th className="px-3.5 py-2.5 font-semibold">Pelanggan</th>
                                    <th className="px-3.5 py-2.5 font-semibold">Kapster</th>
                                    <th className="px-3.5 py-2.5 font-semibold">Layanan</th>
                                    <th className="px-3.5 py-2.5 font-semibold">Status</th>
                                    <th className="px-3.5 py-2.5 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.05]">
                                {rows.map((b) => (
                                    <tr key={b.id} className="align-top transition-colors hover:bg-black/[0.02]">
                                        <td className="px-3.5 py-3">
                                            <div className="tnum font-semibold text-ink">{jamIndo(b.start_time)}</div>
                                            <div className="text-[11px] text-ink-mute">{tanggalIndo(b.date)}</div>
                                            <div className="tnum text-[11px] text-ink-mute">#{b.id}</div>
                                        </td>
                                        <td className="px-3.5 py-3">
                                            <div className="font-semibold text-ink">{b.customer || "Pelanggan"}</div>
                                            <a
                                                href={waLink(b.whatsapp, `Halo ${b.customer || ""}, konfirmasi booking Eddy Barbershop #${b.id} pada ${tanggalIndo(b.date)} jam ${jamIndo(b.start_time)} WIB.`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-confirmed"
                                            >
                                                <Icon name="chat" size={13} />
                                                {b.whatsapp || "-"}
                                            </a>
                                        </td>
                                        <td className="px-3.5 py-3 text-ink-soft">{b.barber || "—"}</td>
                                        <td className="px-3.5 py-3">
                                            <div className="text-ink-soft">{b.service || "—"}</div>
                                            <div className="tnum text-[11px] text-ink-mute">{rupiah(b.price || 0)}</div>
                                        </td>
                                        <td className="px-3.5 py-3">
                                            <StatusPill status={b.status} />
                                        </td>
                                        <td className="px-3.5 py-3">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <Link
                                                    href={`/admin/bookings/${b.id}`}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-text hover:underline"
                                                >
                                                    <Icon name="visibility" size={13} />
                                                    Detail
                                                </Link>
                                                <StatusActions booking={b} onChange={changeStatus} align="right" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile: kartu */}
                    <ul className="space-y-3 md:hidden">
                        {rows.map((b) => (
                            <li key={b.id} className="glass-card rounded-ios p-3.5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="tnum font-display text-xl leading-none tracking-wide text-ink">
                                            {jamIndo(b.start_time)}
                                        </div>
                                        <div className="text-[11px] text-ink-mute">
                                            {tanggalIndo(b.date)} · #{b.id}
                                        </div>
                                    </div>
                                    <StatusPill status={b.status} />
                                </div>

                                <div className="mt-2.5 border-t border-hairline pt-2.5">
                                    <div className="text-[14px] font-semibold text-ink">
                                        {b.customer || "Pelanggan"}
                                    </div>
                                    <a
                                        href={waLink(b.whatsapp)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-semibold text-confirmed"
                                    >
                                        <Icon name="chat" size={14} />
                                        {b.whatsapp || "-"}
                                    </a>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-soft">
                                    <span className="inline-flex items-center gap-1">
                                        <Icon name="badge" size={14} className="text-ink-mute" />
                                        {b.barber || "Kapster acak"}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Icon name="content_cut" size={14} className="text-ink-mute" />
                                        {b.service || "—"}
                                    </span>
                                    <span className="tnum inline-flex items-center gap-1 font-semibold text-ink">
                                        {rupiah(b.price || 0)}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2.5">
                                    <Link
                                        href={`/admin/bookings/${b.id}`}
                                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-gold-text hover:underline"
                                    >
                                        <Icon name="visibility" size={14} />
                                        Lihat Detail Lengkap
                                    </Link>
                                    <StatusActions booking={b} onChange={changeStatus} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* Paginasi */}
            {links.length > 3 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || "#"}
                            preserveScroll
                            className={`rounded-ios-sm px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                                link.active
                                    ? "bg-ink text-white"
                                    : link.url
                                      ? "glass-card text-ink hover:bg-white"
                                      : "pointer-events-none text-ink-mute opacity-50"
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

/** Field berlabel untuk baris filter. */
function Field({ label, icon, children }) {
    return (
        <div>
            <label className="eyebrow mb-1.5 flex items-center gap-1.5 text-ink-mute">
                <Icon name={icon} size={14} />
                {label}
            </label>
            {children}
        </div>
    );
}

/**
 * Tombol aksi status. Status aktif (current) tidak ditampilkan sebagai tombol
 * agar tidak ada aksi "ubah ke status yang sama".
 */
function StatusActions({ booking, onChange, align = "left" }) {
    const all = [
        { key: "confirmed", label: "Konfirmasi", icon: "check_circle", tone: "default" },
        { key: "done", label: "Selesai", icon: "task_alt", tone: "default" },
        { key: "cancelled", label: "Batal", icon: "cancel", tone: "danger" },
    ];
    const actions = all.filter((a) => a.key !== booking.status);

    return (
        <div className={`flex flex-wrap gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
            {actions.map((a) => (
                <IconAction
                    key={a.key}
                    icon={a.icon}
                    label={a.label}
                    tone={a.tone}
                    onClick={() => onChange(booking, a.key)}
                />
            ))}
        </div>
    );
}

/** Buang kunci filter yang kosong sebelum dikirim ke query string. */
function clean(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v != null));
}
