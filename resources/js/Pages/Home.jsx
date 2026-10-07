import { Link } from "@inertiajs/react";

const GOLD = "#c9a227";

export default function Home({ services, barbers }) {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            {/* HERO */}
            <header className="border-b border-neutral-800">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
                    <div className="text-2xl font-black tracking-tight">
                        EDDY <span style={{ color: GOLD }}>BARBERSHOP</span>
                    </div>
                    <Link
                        href="/booking"
                        className="rounded-lg px-5 py-2.5 font-semibold text-neutral-950 transition hover:brightness-110"
                        style={{ backgroundColor: GOLD }}
                    >
                        Booking Sekarang
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6">
                <section className="py-20 text-center">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                        Barbershop — Kartasura, Sukoharjo
                    </p>
                    <h1 className="mb-6 text-5xl font-black leading-tight md:text-6xl">
                        Tampil Tajam,
                        <br />
                        Tanpa Antre.
                    </h1>
                    <p className="mx-auto mb-10 max-w-xl text-neutral-400">
                        Booking jadwal potong rambut online. Pilih kapster favoritmu,
                        tentukan jamnya, datang tinggal duduk. Buka Senin–Sabtu, 09.00–21.00.
                    </p>
                    <Link
                        href="/booking"
                        className="inline-block rounded-xl px-8 py-4 text-lg font-bold text-neutral-950 transition hover:brightness-110"
                        style={{ backgroundColor: GOLD }}
                    >
                        Booking Jadwal
                    </Link>
                </section>

                {/* LAYANAN */}
                <section className="py-12">
                    <h2 className="mb-8 text-3xl font-bold">
                        Layanan <span style={{ color: GOLD }}>Kami</span>
                    </h2>
                    <div className="grid gap-5 md:grid-cols-2">
                        {services.map((s) => (
                            <div key={s.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-xl font-bold">{s.name}</h3>
                                    <span className="font-bold" style={{ color: GOLD }}>
                                        Rp {Number(s.price).toLocaleString("id-ID")}
                                    </span>
                                </div>
                                <p className="mb-3 text-sm text-neutral-400">{s.description}</p>
                                <p className="text-xs uppercase tracking-wider text-neutral-500">
                                    ± {s.duration_minutes} menit
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* KAPSTER */}
                <section className="py-12">
                    <h2 className="mb-8 text-3xl font-bold">
                        Kapster <span style={{ color: GOLD }}>Kami</span>
                    </h2>
                    <div className="grid gap-5 md:grid-cols-3">
                        {barbers.map((b) => (
                            <div key={b.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
                                <div
                                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black text-neutral-950"
                                    style={{ backgroundColor: GOLD }}
                                >
                                    {b.name.charAt(0)}
                                </div>
                                <h3 className="text-lg font-bold">{b.name}</h3>
                                <p className="text-sm text-neutral-400">{b.specialty}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="border-t border-neutral-800 py-10 text-center text-sm text-neutral-500">
                    <p className="mb-1 font-bold text-neutral-300">EDDY BARBERSHOP — Kartasura, Sukoharjo</p>
                    <p>Senin–Sabtu · 09.00–21.00 · Minggu tutup</p>
                </footer>
            </main>
        </div>
    );
}
