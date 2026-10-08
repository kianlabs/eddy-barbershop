/**
 * Layout panel admin — gaya Apple Glass (lihat DESIGN.md).
 *
 * Dipakai bersama oleh semua halaman Admin/*. Sidebar (desktop) dan nav
 * horizontal (mobile) berisi tautan utama panel; kanan atas ada aksi keluar.
 * Nav memakai kunjungan Inertia <Link> agar tanpa full reload.
 */
import { Link, router, usePage } from "@inertiajs/react";
import { AmbientGlow, Icon } from "./ui";

const NAV = [
    { href: "/admin", label: "Dashboard", icon: "dashboard", match: (url) => url === "/admin" },
    { href: "/admin/bookings", label: "Booking", icon: "calendar_month", match: (url) => url.startsWith("/admin/bookings") },
    { href: "/admin/services", label: "Layanan", icon: "content_cut", match: (url) => url.startsWith("/admin/services") },
    { href: "/admin/barbers", label: "Kapster", icon: "badge", match: (url) => url.startsWith("/admin/barbers") },
];

export default function AdminLayout({ title, eyebrow = "Panel Admin", action, children }) {
    const { url, props } = usePage();
    const adminName = props.admin || "Admin";
    const flash = props.flash || {};
    const errors = props.errors || {};

    const logout = () => router.post("/logout");

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-canvas">
            <AmbientGlow />

            <div className="relative z-10 mx-auto flex max-w-[1100px] gap-6 px-4 py-5">
                {/* Sidebar — desktop */}
                <aside className="sticky top-5 hidden h-fit w-56 shrink-0 md:block">
                    <div className="glass-panel rounded-ios-lg p-4">
                        <div className="mb-4 flex flex-col leading-none">
                            <span className="font-display text-2xl uppercase tracking-wider text-ink">
                                Eddy Barbershop
                            </span>
                            <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-gold-text">
                                Panel Admin
                            </span>
                        </div>

                        <nav className="space-y-1">
                            {NAV.map((item) => {
                                const active = item.match(url);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2.5 rounded-ios px-3 py-2.5 text-sm font-semibold transition-all ${
                                            active
                                                ? "bg-ink text-white shadow-sm"
                                                : "text-ink-soft hover:bg-black/[0.04] hover:text-ink"
                                        }`}
                                    >
                                        <Icon
                                            name={item.icon}
                                            size={19}
                                            className={active ? "text-gold" : ""}
                                        />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-4 border-t border-hairline pt-3">
                            <div className="mb-2 px-1 text-[11px] text-ink-mute">
                                Masuk sebagai <span className="font-semibold text-ink">{adminName}</span>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href="/"
                                    className="glass-card flex h-10 flex-1 items-center justify-center gap-1.5 rounded-ios text-xs font-semibold text-ink"
                                >
                                    <Icon name="storefront" size={16} />
                                    Situs
                                </Link>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="glass-card flex h-10 flex-1 items-center justify-center gap-1.5 rounded-ios text-xs font-semibold text-ink transition-colors hover:bg-white"
                                >
                                    <Icon name="logout" size={16} />
                                    Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Konten */}
                <div className="min-w-0 flex-1 pb-24 md:pb-6">
                    {/* Top bar mobile */}
                    <div className="mb-4 flex items-center justify-between md:hidden">
                        <div className="flex flex-col leading-none">
                            <span className="font-display text-xl uppercase tracking-wider text-ink">
                                Eddy Barbershop
                            </span>
                            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold-text">
                                Panel Admin
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={logout}
                            aria-label="Keluar"
                            className="glass-card flex h-10 w-10 items-center justify-center rounded-full text-ink"
                        >
                            <Icon name="logout" size={18} />
                        </button>
                    </div>

                    {/* Judul halaman */}
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
                        <div>
                            <div className="mb-1 flex items-center gap-1.5">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                                <span className="eyebrow text-ink-mute">{eyebrow}</span>
                            </div>
                            <h1 className="font-display text-3xl uppercase leading-none tracking-wide text-ink">
                                {title}
                            </h1>
                        </div>
                        {action}
                    </div>

                    {/* Flash pesan sukses */}
                    {flash.success && (
                        <div className="glass-card mb-3 flex items-center gap-2 rounded-ios border-l-4 border-l-confirmed px-4 py-3 text-sm text-ink">
                            <Icon name="check_circle" size={18} className="text-confirmed" />
                            {flash.success}
                        </div>
                    )}

                    {/* Ringkasan error validasi (fallback bila form tidak memetakannya) */}
                    {Object.keys(errors).length > 0 && (
                        <div className="glass-card mb-3 rounded-ios border-l-4 border-l-gold px-4 py-3 text-sm text-ink">
                            <div className="mb-1 flex items-center gap-2 font-semibold">
                                <Icon name="error" size={18} className="text-gold-text" />
                                Periksa kembali isian Anda
                            </div>
                            <ul className="list-inside list-disc text-[13px] text-ink-soft">
                                {Object.values(errors).map((msg, i) => (
                                    <li key={i}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {children}
                </div>
            </div>

            {/* Nav bawah — mobile */}
            <nav className="glass-bar fixed inset-x-0 bottom-0 z-40 flex items-center justify-around px-2 py-2 md:hidden">
                {NAV.map((item) => {
                    const active = item.match(url);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center px-3 py-1 transition-colors active:scale-95 ${
                                active ? "text-ink" : "text-ink-mute"
                            }`}
                        >
                            <Icon name={item.icon} size={20} />
                            <span
                                className={`mt-0.5 flex items-center gap-1 text-[11px] tracking-wider ${
                                    active ? "font-bold" : "font-medium"
                                }`}
                            >
                                {item.label}
                                {active && <span className="inline-block h-1 w-1 rounded-full bg-gold" />}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
