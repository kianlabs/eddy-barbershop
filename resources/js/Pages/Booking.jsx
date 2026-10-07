import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";

const GOLD = "#c9a227";
const API = "/api";

const inputCls =
    "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 focus:border-amber-500 focus:outline-none";

export default function Booking({ services, barbers }) {
    const [step, setStep] = useState(1);
    const [serviceId, setServiceId] = useState("");
    const [barberId, setBarberId] = useState("");
    const [date, setDate] = useState("");
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const service = services.find((s) => String(s.id) === String(serviceId));
    const barber = barbers.find((b) => String(b.id) === String(barberId));

    useEffect(() => {
        if (step === 3 && barberId && serviceId && date) {
            setSlotsLoading(true);
            setStartTime("");
            fetch(`${API}/available-slots?barber_id=${barberId}&service_id=${serviceId}&date=${date}`)
                .then((r) => r.json())
                .then((d) => setSlots(d.slots || []))
                .catch(() => setSlots([]))
                .finally(() => setSlotsLoading(false));
        }
    }, [step, barberId, serviceId, date]);

    const todayStr = new Date().toISOString().slice(0, 10);

    async function submit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    barber_id: barberId,
                    service_id: serviceId,
                    date,
                    start_time: startTime,
                    name,
                    whatsapp,
                    notes: notes || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                const msg = data.message || "Gagal membuat booking.";
                const detail = data.errors ? Object.values(data.errors).flat().join(" ") : "";
                throw new Error(`${msg} ${detail}`.trim());
            }
            setResult(data);
            setStep(5);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <header className="border-b border-neutral-800">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
                    <Link href="/" className="text-xl font-black tracking-tight">
                        EDDY <span style={{ color: GOLD }}>BARBERSHOP</span>
                    </Link>
                    <span className="text-sm text-neutral-400">Langkah {Math.min(step, 4)} dari 4</span>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-6 py-10">
                {error && (
                    <div className="mb-6 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <section>
                        <h2 className="mb-6 text-2xl font-bold">1. Pilih Layanan</h2>
                        <div className="grid gap-4">
                            {services.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => { setServiceId(s.id); setStep(2); }}
                                    className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-left transition hover:border-amber-500"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold">{s.name}</span>
                                        <span className="font-bold" style={{ color: GOLD }}>
                                            Rp {Number(s.price).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-neutral-400">
                                        {s.description} · ± {s.duration_minutes} menit
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {step === 2 && (
                    <section>
                        <h2 className="mb-6 text-2xl font-bold">2. Pilih Kapster</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {barbers.map((b) => (
                                <button
                                    key={b.id}
                                    onClick={() => { setBarberId(b.id); setStep(3); }}
                                    className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center transition hover:border-amber-500"
                                >
                                    <div
                                        className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-neutral-950"
                                        style={{ backgroundColor: GOLD }}
                                    >
                                        {b.name.charAt(0)}
                                    </div>
                                    <p className="font-bold">{b.name}</p>
                                    <p className="text-sm text-neutral-400">{b.specialty}</p>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(1)} className="mt-6 text-sm text-neutral-400 underline">
                            ← Kembali
                        </button>
                    </section>
                )}

                {step === 3 && (
                    <section>
                        <h2 className="mb-6 text-2xl font-bold">3. Pilih Tanggal &amp; Jam</h2>
                        <p className="mb-4 text-sm text-neutral-400">
                            {service?.name} dengan {barber?.name} · ± {service?.duration_minutes} menit
                        </p>
                        <input
                            type="date"
                            min={todayStr}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={`${inputCls} mb-6`}
                        />
                        {date && (
                            <>
                                {slotsLoading && <p className="text-neutral-400">Memuat slot...</p>}
                                {!slotsLoading && slots.length === 0 && (
                                    <p className="text-neutral-400">Tidak ada slot tersedia (tutup / penuh).</p>
                                )}
                                <div className="grid grid-cols-4 gap-3">
                                    {slots.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setStartTime(s); setStep(4); }}
                                            className="rounded-lg border border-neutral-700 bg-neutral-900 py-3 font-semibold transition hover:border-amber-500"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        <button onClick={() => setStep(2)} className="mt-6 text-sm text-neutral-400 underline">
                            ← Kembali
                        </button>
                    </section>
                )}

                {step === 4 && (
                    <section>
                        <h2 className="mb-6 text-2xl font-bold">4. Data Diri &amp; Konfirmasi</h2>
                        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-sm">
                            <p><span className="text-neutral-400">Layanan:</span> <b>{service?.name}</b></p>
                            <p><span className="text-neutral-400">Kapster:</span> <b>{barber?.name}</b></p>
                            <p><span className="text-neutral-400">Jadwal:</span> <b>{date} · {startTime}</b></p>
                            <p><span className="text-neutral-400">Harga:</span> <b style={{ color: GOLD }}>Rp {Number(service?.price).toLocaleString("id-ID")}</b></p>
                        </div>
                        <form onSubmit={submit} className="grid gap-4">
                            <input placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
                            <input placeholder="No. WhatsApp (08xx)" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required className={inputCls} />
                            <textarea placeholder="Catatan (opsional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-xl px-6 py-4 text-lg font-bold text-neutral-950 transition hover:brightness-110 disabled:opacity-50"
                                style={{ backgroundColor: GOLD }}
                            >
                                {submitting ? "Memproses..." : "Konfirmasi Booking"}
                            </button>
                        </form>
                        <button onClick={() => setStep(3)} className="mt-6 text-sm text-neutral-400 underline">
                            ← Kembali
                        </button>
                    </section>
                )}

                {step === 5 && result && (
                    <section className="py-10 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl" style={{ backgroundColor: GOLD }}>
                            ✓
                        </div>
                        <h2 className="mb-3 text-3xl font-bold">Booking Berhasil!</h2>
                        <p className="mx-auto mb-8 max-w-md text-neutral-400">
                            {result.service?.name} dengan {result.barber?.name} pada {result.date} jam {String(result.start_time).slice(0, 5)}.
                            Tunjukkan halaman ini saat datang. Konfirmasi via WhatsApp menyusul.
                        </p>
                        <Link
                            href="/"
                            className="inline-block rounded-xl px-8 py-3 font-bold text-neutral-950"
                            style={{ backgroundColor: GOLD }}
                        >
                            Kembali ke Beranda
                        </Link>
                    </section>
                )}
            </main>
        </div>
    );
}
