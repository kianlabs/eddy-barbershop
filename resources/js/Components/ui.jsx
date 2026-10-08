/**
 * Komponen UI bersama — gaya Apple Glass (lihat DESIGN.md).
 * Warna/radius/shadow memakai token dari resources/css/app.css.
 */

/**
 * Kontak resmi barbershop — satu sumber kebenaran.
 * Dipakai Home.jsx agar nilai WA/IG/telepon tidak tersebar di banyak tempat.
 */
export const KONTAK = {
    whatsapp: "6289664726691",
    instagram: "eddy.barbershop",
    telepon: "+6289664726691",
};

/** Alamat toko — satu sumber kebenaran (dipakai pesan WhatsApp & halaman Home). */
export const ALAMAT = "Jl. A. Yani No.402, Makamhaji, Kartasura, Sukoharjo";

/**
 * Normalisasi nomor WhatsApp Indonesia ke format internasional tanpa tanda baca.
 *
 * Aturan:
 * - buang semua karakter non-digit (spasi, "+", "-", titik, tanda kurung);
 * - awalan "0" (lokal, mis. 0812-3456-7890) → "62";
 * - nomor yang sudah diawali "62" dibiarkan apa adanya.
 *
 * @example normalizeWa("0812-3456-7890") // "6281234567890"
 * @example normalizeWa("+62 812 3456 7890") // "6281234567890"
 * @returns {string} hanya digit, atau "" bila tidak ada digit.
 */
export function normalizeWa(input) {
    const digits = String(input ?? "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) return `62${digits.slice(1)}`;
    return digits;
}

/** Ikon Material Symbols Outlined. */
export function Icon({ name, className = "", filled = false, size = 20 }) {
    return (
        <span
            aria-hidden="true"
            className={`material-symbols-outlined ${className}`}
            style={{
                fontSize: `${size}px`,
                fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 20`,
            }}
        >
            {name}
        </span>
    );
}

/** Label kecil uppercase berjarak lebar. Ukuran dari utility `.eyebrow` (12px). */
export function Eyebrow({ children, className = "" }) {
    return (
        <span className={`eyebrow text-ink-mute ${className}`}>{children}</span>
    );
}

/** Tombol — primary hitam pekat + ikon emas; secondary kaca. */
export function Button({
    as: Tag = "button",
    variant = "primary",
    className = "",
    children,
    ...props
}) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-ios font-semibold tracking-wide transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45";
    const styles = {
        primary: "h-12 bg-ink px-5 text-sm text-white hover:bg-black shadow-sm",
        secondary: "glass-card h-12 px-5 text-sm text-ink hover:bg-white",
        ghost: "h-11 w-11 bg-black/[0.04] text-ink hover:bg-black/[0.07]",
    };
    return (
        <Tag className={`${base} ${styles[variant]} ${className}`} {...props}>
            {children}
        </Tag>
    );
}

/**
 * Header sticky kaca dengan wordmark brand.
 * `showBack`: tampilkan tombol kembali di kiri (default true).
 * Landing page memakai `showBack={false}` — sisi kiri jadi spacer agar wordmark tetap center.
 */
export function TopBar({ onBack, showBack = true, right }) {
    return (
        <header className="sticky top-0 z-50 border-b border-hairline bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[720px] items-center justify-between px-4 py-3">
                {showBack ? (
                    <button
                        type="button"
                        aria-label="Kembali"
                        onClick={onBack}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.04] bg-black/[0.04] text-ink transition-all active:scale-95 hover:bg-black/[0.07]"
                    >
                        <Icon name="arrow_back_ios_new" size={18} />
                    </button>
                ) : (
                    <span aria-hidden="true" className="h-9 w-9" />
                )}

                <div className="flex flex-col items-center leading-none">
                    <a
                        href="/"
                        className="font-display text-xl uppercase tracking-wider text-black"
                    >
                        Eddy Barbershop
                    </a>
                    <span className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-gold-text">
                        Makamhaji, Sukoharjo
                    </span>
                </div>

                {right ?? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.04] bg-black/[0.04] text-ink">
                        <Icon name="content_cut" size={18} />
                    </div>
                )}
            </div>
        </header>
    );
}

/** Progress bar alur booking — gradient hitam→emas. */
export function ProgressBar({ step, total = 4, label }) {
    const pct = Math.round((Math.min(step, total) / total) * 100);
    return (
        <div className="mx-auto max-w-[720px] px-4 pt-4">
            <div className="glass-card rounded-ios-sm p-3">
                <div className="mb-2 flex items-center justify-between">
                    <span className="eyebrow text-ink">
                        Langkah {Math.min(step, total)} dari {total}
                        {label ? <span aria-hidden="true" className="text-gold-text"> · </span> : null}
                        {label ? (
                            <span className="font-normal text-ink-mute">
                                {label}
                            </span>
                        ) : null}
                    </span>
                    <span className="eyebrow tnum text-ink">{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-ink to-gold transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

/** Judul section dengan eyebrow + heading display. */
export function SectionHeading({ eyebrow, title, note }) {
    return (
        <div className="mb-4 px-1">
            {eyebrow && (
                <div className="mb-1 flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                    <Eyebrow>{eyebrow}</Eyebrow>
                </div>
            )}
            <h2 className="font-display text-3xl uppercase leading-none tracking-wide text-ink">
                {title}
            </h2>
            {note && <p className="mt-1 text-sm text-ink-mute">{note}</p>}
        </div>
    );
}

/** Format rupiah. */
export function rupiah(value) {
    return `Rp${Number(value).toLocaleString("id-ID")}`;
}

/** Format harga layanan — otomatis jadi range bila price_max terisi. */
export function harga(service) {
    if (!service) return "-";
    if (service.price_max && Number(service.price_max) > Number(service.price)) {
        return `${rupiah(service.price)}–${Number(service.price_max).toLocaleString("id-ID")}`;
    }
    return rupiah(service.price);
}

/** True bila layanan punya rentang harga (mis. tergantung panjang rambut). */
export function isRange(service) {
    return Boolean(service && service.price_max && Number(service.price_max) > Number(service.price));
}

/** Tanggal Indonesia: "Senin, 24 Okt 2024". */
export function tanggalIndo(iso) {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/**
 * Tanggal hari ini sebagai "YYYY-MM-DD" memakai zona waktu LOKAL perangkat.
 *
 * Sengaja TIDAK memakai `new Date().toISOString()` karena itu mengonversi ke UTC:
 * di WIB (UTC+7) pukul 00:00–06:59 tanggal UTC masih hari kemarin, sehingga
 * `toISOString().slice(0,10)` bisa menghasilkan tanggal yang beda 1 hari dari
 * tanggal lokal yang dilihat pengguna. Helper ini dibangun dari getFullYear/
 * getMonth/getDate sehingga konsisten dengan `tanggalIndo()` dan `buildWeekStrip()`.
 */
export function todayISO() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/* ------------------------------------------------------------------ *
 * Bagian khusus panel admin
 * ------------------------------------------------------------------ */

/** Orb kabur di latar agar efek kaca terlihat (versi ringkas, dipakai panel admin). */
export function AmbientGlow() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-24 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-[#eadeb5]/30 blur-3xl" />
            <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-[#e8edfc]/40 blur-3xl" />
            <div className="absolute bottom-1/4 -left-20 h-80 w-80 rounded-full bg-[#fcedd9]/35 blur-3xl" />
        </div>
    );
}

/**
 * Metadata status booking — label Indonesia + warna dot.
 * Satu sumber kebenaran agar tabel, filter, dan dashboard konsisten.
 */
export const STATUS_BOOKING = {
    pending: { label: "Menunggu", dot: "bg-amber-400", pill: "bg-amber-400/15 text-amber-700" },
    confirmed: { label: "Dikonfirmasi", dot: "bg-confirmed", pill: "bg-confirmed/15 text-confirmed" },
    done: { label: "Selesai", dot: "bg-ink", pill: "bg-ink/10 text-ink" },
    cancelled: { label: "Batal", dot: "bg-ink-mute", pill: "bg-black/[0.06] text-ink-mute" },
};

export function statusInfo(status) {
    return STATUS_BOOKING[status] ?? { label: status || "-", dot: "bg-ink-mute", pill: "bg-black/[0.06] text-ink-mute" };
}

/** Format "HH:MM" -> "HH.MM" (gaya Indonesia) untuk waktu. */
export function jamIndo(time) {
    return String(time || "").slice(0, 5).replace(":", ".");
}

/**
 * Alias dari `normalizeWa()` — dipertahankan agar pemanggil lama (mis. waLink,
 * halaman admin) tetap jalan. Implementasi tunggal ada di `normalizeWa()`.
 */
export function waNumber(value) {
    return normalizeWa(value);
}

/** Tautan chat WhatsApp dengan template pesan opsional. */
export function waLink(number, text) {
    const base = `https://wa.me/${waNumber(number)}`;
    return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Tombol aksi kecil (ubah status / toggle) dengan ikon. */
export function IconAction({ icon, label, tone = "default", className = "", ...props }) {
    const tones = {
        default: "border-black/[0.06] bg-black/[0.04] text-ink hover:bg-black/[0.07]",
        danger: "border-transparent bg-[#d92d20]/10 text-[#b42318] hover:bg-[#d92d20]/15",
        gold: "border-gold/30 bg-gold/10 text-[#8a6d12] hover:bg-gold/15",
    };
    return (
        <button
            type="button"
            aria-label={label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone] ?? tones.default} ${className}`}
            {...props}
        >
            <Icon name={icon} size={15} />
            {label}
        </button>
    );
}

/** Pill status booking (label + dot warna). */
export function StatusPill({ status }) {
    const info = statusInfo(status);
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${info.pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
            {info.label}
        </span>
    );
}

/** Kartu statistik (dipakai dashboard). */
export function StatCard({ icon, label, value, note }) {
    return (
        <div className="glass-card rounded-ios p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
                <Icon name={icon} size={18} className="text-gold" />
            </div>
            <div className="tnum font-display text-3xl font-bold leading-none tracking-wide text-ink">
                {value}
            </div>
            <div className="mt-1 text-[13px] font-semibold text-ink">{label}</div>
            {note && <div className="mt-0.5 text-[11px] text-ink-mute">{note}</div>}
        </div>
    );
}
