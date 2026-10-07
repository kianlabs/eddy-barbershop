/**
 * Komponen UI bersama — gaya Apple Glass (lihat DESIGN.md).
 * Warna/radius/shadow memakai token dari resources/css/app.css.
 */

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

/** Label kecil uppercase berjarak lebar. */
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
                    <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold">
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
                        {label ? <span className="text-gold"> · </span> : null}
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
