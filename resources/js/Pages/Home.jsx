import { Button, Eyebrow, Icon, SectionHeading, TopBar, harga, isRange } from "../Components/ui";

const FACILITIES = [
    { icon: "chair", title: "3 Kursi Nyaman", note: "Ruangan Ber-AC" },
    { icon: "local_cafe", title: "Free Es Teh", note: "Racikan Khas Solo" },
    { icon: "wifi", title: "Fast WiFi", note: "Anteng Menunggu" },
];

export default function Home({ services, barbers }) {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-canvas pb-36">
            <AmbientGlow />
            <TopBar showBack={false} />

            <main className="relative z-10 mx-auto max-w-[720px] px-4">
                {/* HERO */}
                <section className="py-8 text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-white/70 px-3.5 py-1.5 shadow-sm backdrop-blur-xl">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
                        <span className="text-[11px] font-semibold text-ink">Buka Hari Ini</span>
                        <span className="text-[11px] text-ink-mute">•</span>
                        <span className="text-[11px] font-medium text-ink-soft">10.00 – 23.00 WIB</span>
                    </div>

                    <h1 className="font-display text-5xl uppercase leading-none tracking-wider text-ink sm:text-6xl">
                        Eddy Barbershop &amp; Shaves
                    </h1>
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ink-soft">
                        Duduk Anteng
                        <span className="text-[10px] text-gold">◆</span>
                        Pulang Ganteng
                    </p>
                    <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink-soft">
                        Potong ganteng, harga bersahabat khas Kartasura. Dari pompadour rapi
                        sampai skin fade presisi.
                    </p>

                    <div className="mt-6">
                        <Button as="a" href="/booking" className="w-full uppercase tracking-wider">
                            <Icon name="content_cut" size={18} className="text-gold" />
                            Booking Sekarang
                        </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {FACILITIES.map((f) => (
                            <div
                                key={f.title}
                                className="glass-card rounded-ios p-3.5 text-center transition-transform hover:-translate-y-0.5"
                            >
                                <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.04] bg-black/[0.04]">
                                    <Icon name={f.icon} size={18} />
                                </div>
                                <div className="text-xs font-semibold text-ink">{f.title}</div>
                                <div className="mt-0.5 text-[10px] text-ink-mute">{f.note}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LAYANAN */}
                <section id="layanan" className="py-4">
                    <div className="flex items-end justify-between px-1">
                        <SectionHeading eyebrow="Pilihan Menu & Tarif" title="Layanan Unggulan" />
                        <span className="mb-4 text-xs font-medium text-ink-mute">Transparan & Lengkap</span>
                    </div>

                    <div className="glass-card divide-y divide-black/[0.05] overflow-hidden rounded-ios">
                        {services.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-black/[0.02]"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[15px] font-semibold text-ink">{s.name}</h3>
                                        {s.name === "Potong + Cuci + Pijat + Vit" && (
                                            <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                                Best Choice
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.description}</p>
                                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-mute">
                                        <Icon name="schedule" size={14} className="text-gold" />± {s.duration_minutes} menit
                                    </span>
                                    {isRange(s) && (
                                        <span className="mt-0.5 block text-[11px] italic text-gold">
                                            *harga tergantung panjang rambut
                                        </span>
                                    )}
                                </div>
                                <span className="tnum shrink-0 font-display text-2xl font-bold tracking-wide text-ink">
                                    {harga(s)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* KAPSTER */}
                <section id="kapster" className="py-4">
                    <SectionHeading eyebrow="Tim Profesional" title="Kapster Bertalenta" />
                    <div className="space-y-3">
                        {barbers.map((b, i) => (
                            <div key={b.id} className="glass-card rounded-ios p-4 transition-transform hover:-translate-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-semibold text-ink">{b.name}</h3>
                                    {i === 0 && (
                                        <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                            Pilihan Utama
                                        </span>
                                    )}
                                </div>
                                <div className="mt-0.5 text-xs font-semibold text-gold">{b.specialty}</div>
                                <div className="mt-3 flex items-center gap-1.5 border-t border-black/[0.05] pt-2.5 text-[11px] text-ink-mute">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                                    Aktif melayani hari ini
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LOKASI */}
                <section id="lokasi" className="py-4">
                    <SectionHeading eyebrow="Maps & Informasi" title="Lokasi & Kontak" />
                    <div className="glass-card space-y-4 rounded-ios p-4">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white shadow-sm">
                                <Icon name="location_on" size={20} className="text-gold" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[15px] font-semibold text-ink">Jl. A. Yani No.402, Makamhaji</div>
                                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                                    Kecamatan Kartasura, Kabupaten Sukoharjo, Jawa Tengah 57161
                                </p>
                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-black/[0.04] bg-black/[0.03] px-2.5 py-1 text-[11px] text-ink">
                                    <Icon name="explore" size={14} className="text-ink-soft" />
                                    ±150m timur Tugu Kartasura, seberang warung soto
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-black/[0.05] pt-3.5">
                            <InfoMini icon="schedule" label="Jam Buka" value="10.00 – 23.00 WIB" note="Setiap Hari" />
                            <InfoMini icon="payments" label="Pembayaran" value="Cash / QRIS" note="Semua Bank" />
                        </div>

                        <a
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-black/20 bg-black text-xs font-medium tracking-wide text-white transition-all active:scale-[0.99] hover:bg-neutral-900"
                        >
                            <Icon name="map" size={17} className="text-gold" />
                            Buka Petunjuk Arah di Google Maps
                        </a>
                    </div>
                </section>

                {/* TESTIMONI */}
                <section className="py-4">
                    <SectionHeading eyebrow="Kata Pelanggan" title="Cerita Dari Kursi Cukur" />
                    <div className="glass-panel space-y-2 rounded-ios-lg p-4">
                        <div className="flex items-center gap-1 text-gold">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Icon key={i} name="star" size={17} filled />
                            ))}
                            <span className="ml-1.5 text-xs font-bold text-ink">4.9 / 5.0 (280+ ulasan)</span>
                        </div>
                        <p className="text-xs italic leading-relaxed text-ink/85">
                            "Langganan dari jaman kuliah di UMS sampai sekarang sudah kerja. Mas Eddy
                            cukurnya detail banget, gradasi fade-nya alus. Tempat adem, dapet es teh mantap."
                        </p>
                        <div className="flex items-center justify-between border-t border-black/[0.05] pt-2.5 text-[11px] text-ink-mute">
                            <span className="font-semibold text-ink">— Dimas P., Gonilan Kartasura</span>
                            <span>Reguler sejak 2021</span>
                        </div>
                    </div>
                </section>

                <footer className="mt-6 border-t border-black/[0.05] pt-8 pb-8 text-center">
                    <div className="font-display text-3xl uppercase tracking-wider text-ink">
                        Eddy Barbershop
                    </div>
                    <p className="mt-1.5 text-xs text-ink-soft">Citarasa Pangkas Rambut Asli Makamhaji, Sukoharjo.</p>
                    <div className="mt-2.5 text-[11px] text-ink-mute">© 2025 Eddy Barbershop. Duduk Anteng, Pulang Ganteng.</div>
                </footer>
            </main>

            <FloatingBar />
        </div>
    );
}

function InfoMini({ icon, label, value, note }) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-ink">
                <Icon name={icon} size={16} />
            </div>
            <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">{label}</div>
                <div className="text-[11px] text-ink-soft">{note}</div>
                <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-ink">
                    {value}
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                </div>
            </div>
        </div>
    );
}

/** Orb kabur di latar agar efek kaca terlihat. */
function AmbientGlow() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-24 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-[#eadeb5]/30 blur-3xl" />
            <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-[#e8edfc]/40 blur-3xl" />
            <div className="absolute bottom-1/4 -left-20 h-80 w-80 rounded-full bg-[#fcedd9]/35 blur-3xl" />
        </div>
    );
}

/** Bar melayang bawah: quick action + nav dock. */
function FloatingBar() {
    const items = [
        { icon: "spa", label: "Layanan", href: "#layanan", active: true },
        { icon: "badge", label: "Kapster", href: "#kapster" },
        { icon: "location_on", label: "Lokasi", href: "#lokasi" },
        { icon: "calendar_today", label: "Booking", href: "/booking" },
    ];
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 mx-auto max-w-[720px] px-3">
            <div className="pointer-events-auto space-y-2">
                <div className="glass-bar flex items-center justify-between gap-3 rounded-ios-lg px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold uppercase tracking-wide text-ink">
                            Siap Tampil Ganteng?
                        </div>
                        <div className="truncate text-[11px] text-ink-soft">Antrean online langsung direspon</div>
                    </div>
                    <Button as="a" href="/booking" className="h-9 shrink-0 px-4 text-xs uppercase tracking-wider">
                        <Icon name="content_cut" size={15} className="text-gold" />
                        Booking Kursi
                    </Button>
                </div>

                <nav className="glass-bar flex items-center justify-around rounded-ios-lg px-3 py-1.5">
                    {items.map((it) => (
                        <a
                            key={it.label}
                            href={it.href}
                            className={`flex flex-col items-center justify-center px-3 py-1 transition-colors active:scale-95 ${
                                it.active ? "text-ink" : "text-ink-mute hover:text-ink"
                            }`}
                        >
                            <Icon name={it.icon} size={20} />
                            <span
                                className={`mt-0.5 flex items-center gap-1 text-[9px] tracking-wider ${
                                    it.active ? "font-bold" : "font-medium"
                                }`}
                            >
                                {it.label}
                                {it.active && <span className="inline-block h-1 w-1 rounded-full bg-gold" />}
                            </span>
                        </a>
                    ))}
                </nav>
            </div>
        </div>
    );
}
