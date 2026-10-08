import { useEffect, useMemo, useState } from "react";
import {
    ALAMAT,
    Button,
    Eyebrow,
    Icon,
    KONTAK,
    ProgressBar,
    TopBar,
    harga,
    isRange,
    normalizeWa,
    tanggalIndo,
    todayISO,
} from "../Components/ui";

const API = "/api";

/** Kelompokkan jam jadi sesi Pagi / Siang-Sore / Malam. */
function groupSlots(slots) {
    const groups = { Pagi: [], "Siang & Sore": [], Malam: [] };
    slots.forEach((s) => {
        const hour = parseInt(s.slice(0, 2), 10);
        if (hour < 12) groups["Pagi"].push(s);
        else if (hour < 18) groups["Siang & Sore"].push(s);
        else groups["Malam"].push(s);
    });
    return groups;
}

const SESSION_ICON = { Pagi: "wb_sunny", "Siang & Sore": "sunny", Malam: "dark_mode" };

const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN_SINGKAT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** Susun 7 hari mulai dari hari ini (lokal) sebagai opsi cepat pemilih tanggal. */
function buildWeekStrip(count = 7) {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}`;
        return {
            iso,
            dayShort: HARI_SINGKAT[d.getDay()],
            dayNum: d.getDate(),
            monthShort: BULAN_SINGKAT[d.getMonth()],
            isWeekend: d.getDay() === 0,
        };
    });
}

/**
 * Ambil slot satu kapster. Selalu mengembalikan array (aman dari error jaringan).
 * Bentuk respons backend: { slots: string[] }.
 */
async function fetchSlotsForBarber(barberId, serviceId, date) {
    try {
        const res = await fetch(
            `${API}/available-slots?barber_id=${barberId}&service_id=${serviceId}&date=${date}`,
        );
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.slots) ? data.slots : [];
    } catch {
        return [];
    }
}

/**
 * Coba ENDPOINT BARU satu-request untuk mode "acak": `?all=1&service_id=..&date=..`
 * yang mengembalikan union slot SEMUA kapster sekaligus.
 *
 * Defensif — backend saat ini BELUM tentu mendukung `all=1` (validasi `barber_id`
 * masih `required`, jadi request ini bisa balas 4xx). Karena itu fungsi ini
 * mengembalikan `null` bila respons tidak berbentuk yang diharapkan, dan pemanggil
 * WAJIB fallback ke cara lama (Promise.all per kapster).
 *
 * @returns {Promise<{barbersByTime: Record<string, number[]>, slots: string[]}|null>}
 */
async function fetchAllSlots(serviceId, date) {
    try {
        const res = await fetch(`${API}/available-slots?all=1&service_id=${serviceId}&date=${date}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (!Array.isArray(data?.slots)) return null;

        // Bila backend mengirim peta jam -> daftar id kapster, pakai langsung.
        if (data.barbers_by_time && typeof data.barbers_by_time === "object") {
            return {
                barbersByTime: data.barbers_by_time,
                slots: [...data.slots].sort(),
            };
        }

        // Bila hanya union slot (tanpa pemetaan kapster), slot tetap bisa dipilih;
        // pemilihan kapster konkret ditentukan backend/ di titik booking.
        return { barbersByTime: {}, slots: [...data.slots].sort() };
    } catch {
        return null;
    }
}

/** Mode acak cara lama: N request paralel, satu per kapster, lalu gabung per jam. */
async function fetchSlotsPerBarber(barbers, serviceId, date) {
    const results = await Promise.all(
        barbers.map(async (b) => ({
            barberId: b.id,
            slots: await fetchSlotsForBarber(b.id, serviceId, date),
        })),
    );
    const barbersByTime = {};
    results.forEach(({ barberId: id, slots: s }) => {
        s.forEach((t) => {
            (barbersByTime[t] ||= []).push(id);
        });
    });
    return { barbersByTime, slots: Object.keys(barbersByTime).sort() };
}

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
    // Pilihan "acak" disimpan sebagai sentinel "any" agar tidak ikut mencentang kapster mana pun.
    const isAnyBarber = barberId === "any";
    // Peta jam -> daftar id kapster yang bebas pada jam itu (dipakai mode acak).
    const [slotBarbers, setSlotBarbers] = useState({});
    // Nama kapster terpilih untuk ditampilkan — mode acak disembunyikan.
    const barber = isAnyBarber
        ? { name: "Bebas Siapa Saja", specialty: "Kapster tercepat yang siap" }
        : barbers.find((b) => String(b.id) === String(barberId));

    // Dependency untuk effect slot: string id kapster yang stabil, bukan array `barbers`.
    // Array referensi bisa berubah tiap render parent walau isinya sama dan memicu refetch.
    const barberIdsKey = useMemo(() => barbers.map((b) => b.id).join(","), [barbers]);

    useEffect(() => {
        if (step !== 3 || !serviceId || !date) return;

        // Batalkan hasil fetch yang sudah usang (mis. user ganti tanggal/kapster cepat).
        let cancelled = false;
        setSlotsLoading(true);
        setStartTime("");

        const applyResult = ({ barbersByTime, slots }) => {
            if (cancelled) return;
            setSlotBarbers(barbersByTime);
            setSlots(slots);
        };

        const run = async () => {
            try {
                // Mode acak: coba SATU request union (`all=1`) dulu untuk menekan beban.
                if (isAnyBarber) {
                    const all = await fetchAllSlots(serviceId, date);
                    if (all) {
                        applyResult(all);
                        return;
                    }
                    // Fallback: backend belum dukung `all=1` → N request paralel (cara lama).
                    applyResult(await fetchSlotsPerBarber(barbers, serviceId, date));
                    return;
                }

                // Mode kapster tetap.
                const slots = await fetchSlotsForBarber(barberId, serviceId, date);
                if (cancelled) return;
                setSlots(slots);
                setSlotBarbers({});
            } finally {
                if (!cancelled) setSlotsLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
        // `barberIdsKey` menggantikan `barbers` agar tidak refetch saat referensi array berubah.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, isAnyBarber, barberId, barberIdsKey, serviceId, date]);

    const todayStr = todayISO();
    const stepLabel = ["Pilih Layanan", "Pilih Kapster", "Pilih Jadwal", "Konfirmasi"][step - 1];

    /** Kapster yang dipakai untuk booking: acak di antara yang bebas di jam itu. */
    function pickBarberIdForBooking() {
        if (!isAnyBarber) return barberId;
        const candidates = slotBarbers[startTime] || [];
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    async function submit(e) {
        e.preventDefault();
        setError("");

        const bookingBarberId = pickBarberIdForBooking();
        if (!bookingBarberId) {
            setError("Tidak ada kapster yang bebas di jam ini. Pilih jam lain.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    barber_id: bookingBarberId,
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

    const goBack = () => {
        if (step === 1) window.location.href = "/";
        else setStep(step - 1);
    };

    // Maju dari sticky bar — hanya bila prasyarat step terpenuhi.
    const goNext = () => {
        setError("");
        if (step === 1) {
            if (service) setStep(2);
            else setError("Pilih salah satu layanan dulu.");
        } else if (step === 2) {
            if (barber) setStep(3);
            else setError("Pilih kapster dulu.");
        } else if (step === 3) {
            if (startTime) setStep(4);
            else setError("Pilih jam kunjungan dulu.");
        }
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-canvas pb-40">
            <AmbientGlow />
            <TopBar onBack={goBack} />
            {step <= 4 && <ProgressBar step={step} label={stepLabel} />}

            <main className="relative z-10 mx-auto max-w-[720px] px-4 pt-4">
                {error && (
                    <div
                        role="alert"
                        className="glass-card sticky top-16 z-40 mb-4 rounded-ios border-l-[3px] border-l-rose-500 p-3 text-sm text-rose-600 shadow-md"
                    >
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <StepLayanan
                        services={services}
                        serviceId={serviceId}
                        onSelect={setServiceId}
                    />
                )}

                {step === 2 && (
                    <StepKapster
                        barbers={barbers}
                        barberId={barberId}
                        onSelect={setBarberId}
                    />
                )}

                {step === 3 && (
                    <StepJadwal
                        service={service}
                        barber={barber}
                        date={date}
                        setDate={setDate}
                        todayStr={todayStr}
                        slots={slots}
                        loading={slotsLoading}
                        startTime={startTime}
                        onSelect={setStartTime}
                    />
                )}

                {step === 4 && (
                    <StepKonfirmasi
                        service={service}
                        barber={barber}
                        date={date}
                        startTime={startTime}
                        name={name}
                        setName={setName}
                        whatsapp={whatsapp}
                        setWhatsapp={setWhatsapp}
                        notes={notes}
                        setNotes={setNotes}
                        submitting={submitting}
                        onSubmit={submit}
                    />
                )}

                {step === 5 && result && (
                    <StepSukses
                        result={result}
                        name={name}
                        whatsapp={whatsapp}
                        anonymizeBarber={isAnyBarber}
                    />
                )}

                {step > 1 && step < 4 && (
                    <button
                        onClick={goBack}
                        className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-mute transition-colors hover:text-ink"
                    >
                        <Icon name="chevron_left" size={16} /> Kembali
                    </button>
                )}
            </main>

            {step <= 4 && (
                <StickySummary
                    step={step}
                    service={service}
                    barber={barber}
                    date={date}
                    startTime={startTime}
                    onBack={goBack}
                    onNext={goNext}
                />
            )}
        </div>
    );
}

/* ---------------- STEP 1: LAYANAN ---------------- */
function StepLayanan({ services, serviceId, onSelect }) {
    return (
        <section className="rise">
            <StepTitle no={1} title="Pilih Layanan" note="Pilih paket potong dan perawatan rambut yang Anda inginkan, lalu tekan Lanjut." />
            <div className="space-y-3.5">
                {services.map((s) => {
                    const selected = String(serviceId) === String(s.id);
                    return (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => onSelect(s.id)}
                            aria-pressed={selected}
                            className={`group block w-full rounded-ios p-4 text-left transition-all active:scale-[0.99] ${
                                selected ? "glass-selected" : "glass-card hover:bg-white/95 hover:shadow-md"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 pr-3">
                                    <span className="mb-1 flex items-center gap-1 text-xs font-medium text-ink-mute">
                                        <Icon name="schedule" size={14} /> {s.duration_minutes} Menit
                                    </span>
                                    <h3 className="text-base font-semibold leading-snug tracking-tight text-ink">
                                        {s.name}
                                    </h3>
                                    <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{s.description}</p>
                                    {isRange(s) && (
                                        <span className="mt-1 block text-[11px] italic text-gold-text">
                                            *harga tergantung panjang rambut
                                        </span>
                                    )}
                                </div>
                                <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
                                    <RadioDot selected={selected} />
                                    <span className="tnum mt-2 max-w-[130px] text-right font-display text-xl font-bold tracking-tight text-ink">
                                        {harga(s)}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            <div className="glass-card mt-4 flex items-center gap-3 rounded-ios p-3.5 text-ink-soft">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-black/[0.04] bg-black/[0.04] text-gold">
                    <Icon name="local_cafe" size={18} />
                </div>
                <p className="text-[12.5px] leading-snug text-ink-soft">
                    <span className="font-semibold text-ink">Gratis Teh Hangat / Kopi</span> untuk pengunjung di ruang tunggu.
                </p>
            </div>
        </section>
    );
}

/* ---------------- STEP 2: KAPSTER ---------------- */
function StepKapster({ barbers, barberId, onSelect }) {
    const anySelected = barberId === "any";
    return (
        <section className="rise">
            <StepTitle
                no={2}
                title="Pilih Kapster"
                note="Pilih kapster langganan Anda atau pilih acak, lalu tekan Lanjut."
            />

            <button
                type="button"
                onClick={() => onSelect("any")}
                aria-pressed={anySelected}
                className={`mb-4 flex w-full items-center justify-between rounded-ios p-4 text-left transition-all active:scale-[0.99] ${
                    anySelected ? "glass-selected" : "glass-card hover:bg-white/95 hover:shadow-md"
                }`}
            >
                <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/[0.05]">
                        <Icon name="shuffle" size={22} className="text-gold" />
                    </div>
                    <div>
                        <span className="block text-sm font-semibold tracking-tight text-ink">
                            Pilih Acak / Bebas Siapa Saja
                        </span>
                        <p className="mt-0.5 text-xs text-ink-soft">Penanganan tercepat oleh kapster yang pertama siap</p>
                    </div>
                </div>
                <RadioDot selected={anySelected} />
            </button>

            <div className="mb-2 flex items-center justify-between px-0.5">
                <span className="font-display text-base uppercase tracking-wider text-ink-mute">Kapster Tetap</span>
                <span className="text-[11px] font-medium text-ink-mute">{barbers.length} Aktif Hari Ini</span>
            </div>

            <div className="space-y-3">
                {barbers.map((b) => {
                    const selected = String(barberId) === String(b.id);
                    return (
                        <button
                            key={b.id}
                            type="button"
                            onClick={() => onSelect(b.id)}
                            aria-pressed={selected}
                            className={`block w-full rounded-ios p-4 text-left transition-all active:scale-[0.99] ${
                                selected ? "glass-selected" : "glass-card hover:bg-white/95 hover:shadow-md"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <h2 className="text-base font-bold tracking-tight text-ink">{b.name}</h2>
                                    <p className="text-xs font-semibold text-gold-text">{b.specialty}</p>
                                </div>
                                <RadioDot selected={selected} />
                            </div>
                            <div className="mt-2.5 flex items-center justify-between border-t border-black/[0.06] pt-2.5">
                                <span className="text-xs font-medium text-ink-soft">Siap Melayani</span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Aktif
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

/* ---------------- STEP 3: JADWAL ---------------- */
function StepJadwal({ service, barber, date, setDate, todayStr, slots, loading, startTime, onSelect }) {
    const groups = groupSlots(slots);
    const week = buildWeekStrip(7);
    return (
        <section className="rise">
            <StepTitle no={3} title="Tentukan Waktu Kunjungan" />
            <p className="-mt-2 mb-4 text-[13px] text-ink-soft">
                {service?.name} dengan {barber?.name} · ± {service?.duration_minutes} menit
            </p>

            <div className="glass-card mb-4 rounded-ios p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-ink-soft">
                    <Icon name="storefront" size={15} className="text-ink" />
                    Buka Setiap Hari: <strong className="font-semibold text-ink">10.00 – 23.00 WIB</strong>
                </div>

                {/* Pemilih cepat: strip 7 hari */}
                <label className="eyebrow mb-2 block text-ink-mute">Pilih Cepat</label>
                <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
                    {week.map((d) => {
                        const active = date === d.iso;
                        return (
                            <button
                                key={d.iso}
                                type="button"
                                onClick={() => setDate(d.iso)}
                                aria-pressed={active}
                                className={`flex min-w-[56px] shrink-0 flex-col items-center rounded-2xl px-3 py-2.5 transition-all active:scale-95 ${
                                    active
                                        ? "bg-ink text-white shadow-md"
                                        : "glass-card text-ink hover:bg-white"
                                }`}
                            >
                                <span
                                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                                        active ? "text-white/80" : "text-ink-mute"
                                    }`}
                                >
                                    {d.dayShort}
                                </span>
                                <span className="tnum mt-0.5 font-display text-xl font-bold leading-none">
                                    {d.dayNum}
                                </span>
                                <span
                                    className={`mt-0.5 text-[11px] font-medium ${
                                        active ? "text-white/70" : "text-ink-mute"
                                    }`}
                                >
                                    {d.monthShort}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className={`mt-1 h-1.5 w-1.5 rounded-full ${
                                        active ? "bg-gold" : "bg-transparent"
                                    }`}
                                />
                            </button>
                        );
                    })}
                </div>

                <label htmlFor="tanggal" className="eyebrow mb-1.5 block text-ink-mute">
                    Atau Pilih Tanggal Lain
                </label>
                <input
                    id="tanggal"
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input tnum w-full rounded-ios-sm px-4 py-3 text-sm font-medium text-ink"
                />
            </div>

            {date && loading && (
                <div aria-hidden="true" className="glass-panel rounded-ios p-4">
                    <div className="mb-3 flex items-center justify-between border-b border-black/5 pb-2">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-black/[0.07]" />
                        <div className="h-3 w-16 animate-pulse rounded-full bg-black/[0.06]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-[42px] animate-pulse rounded-xl bg-black/[0.06]"
                                style={{ animationDelay: `${i * 90}ms` }}
                            />
                        ))}
                    </div>
                </div>
            )}
            {date && !loading && slots.length === 0 && (
                <p className="text-sm text-ink-soft">Tidak ada slot tersedia — tutup atau penuh.</p>
            )}

            {date && !loading && slots.length > 0 && (
                <div className="space-y-4">
                    {Object.entries(groups).map(([session, times]) =>
                        times.length === 0 ? null : (
                            <div key={session} className="glass-panel rounded-ios p-4">
                                <div className="mb-3 flex items-center justify-between border-b border-black/5 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Icon name={SESSION_ICON[session]} size={16} className="text-ink" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-ink">{session}</span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-ink-mute">
                                        {times.length} Slot Tersedia
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {times.map((t) => {
                                        const selected = startTime === t;
                                        return (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => onSelect(t)}
                                                aria-pressed={selected}
                                                className={`tnum rounded-xl p-3 text-center text-sm font-semibold transition-all active:scale-95 ${
                                                    selected
                                                        ? "bg-ink text-white shadow-md ring-2 ring-gold/40"
                                                        : "glass-card text-ink hover:bg-white"
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            <div className="glass-card mx-auto mt-4 flex max-w-sm items-center justify-center gap-6 rounded-full px-4 py-2.5 text-xs">
                <LegendDot className="border border-black/10 bg-white" label="Tersedia" />
                <LegendDot className="bg-ink" label="Terpilih" strong />
                <LegendDot className="bg-ink-mute/40" label="Penuh" muted />
            </div>
        </section>
    );
}

/* ---------------- STEP 4: KONFIRMASI ---------------- */
function StepKonfirmasi({
    service,
    barber,
    date,
    startTime,
    name,
    setName,
    whatsapp,
    setWhatsapp,
    notes,
    setNotes,
    submitting,
    onSubmit,
}) {
    return (
        <section className="rise">
            <StepTitle no={4} title="Konfirmasi Booking" note="Periksa ringkasan pesanan & lengkapi nomor WhatsApp aktif Anda." />

            {/* Kartu tiket */}
            <div className="glass-card mb-5 overflow-hidden rounded-ios">
                <div className="p-5">
                    <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
                        <div>
                            <span className="block font-display text-lg uppercase tracking-wider text-ink">
                                Ringkasan Reservasi
                            </span>
                            <span className="mt-1 block text-[11px] text-ink-mute">Eddy Barber Pass • Sukoharjo</span>
                        </div>
                    </div>

                    <dl className="divide-y divide-black/[0.04] text-[13px]">
                        <SummaryRow label="Layanan" value={service?.name} sub={service?.description} />
                        <SummaryRow label="Kapster" value={barber?.name} />
                        <SummaryRow
                            label="Waktu Kunjungan"
                            value={date ? `${tanggalIndo(date)} • ${startTime} WIB` : "-"}
                        />
                    </dl>

                    <div className="my-2 border-b border-dashed border-neutral-300" />

                    <div className="flex items-end justify-between pt-2">
                        <div>
                            <div className="eyebrow text-ink-mute">Total Pembayaran</div>
                            <div className="mt-0.5 text-[11.5px] text-ink-mute">Bayar di kasir</div>
                            {isRange(service) && (
                                <div className="mt-0.5 text-[11px] italic text-gold-text">
                                    *harga tergantung panjang rambut
                                </div>
                            )}
                        </div>
                        <span className="tnum font-display text-3xl font-bold leading-none tracking-wide text-ink">
                            {harga(service)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Data pemesan */}
            <div className="glass-card mb-4 rounded-ios p-5">
                <div className="mb-4 flex items-center justify-between border-b border-black/[0.06] pb-2.5">
                    <h2 className="font-display text-lg uppercase tracking-wider text-ink">Data Pemesan</h2>
                    <span className="text-[11px] text-ink-mute">Identitas & Kontak</span>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="nama" className="eyebrow mb-1.5 block text-ink-soft">
                            Nama Lengkap <span className="text-rose-500">*</span>
                        </label>
                        <input
                            id="nama"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Bambang Pamungkas"
                            className="glass-input w-full rounded-ios-sm px-4 py-3 text-sm font-medium text-ink placeholder:text-ink-mute"
                        />
                    </div>

                    <div>
                        <label htmlFor="wa" className="eyebrow mb-1.5 block text-ink-soft">
                            Nomor WhatsApp <span className="text-rose-500">*</span>
                        </label>
                        <input
                            id="wa"
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            required
                            placeholder="0812-3456-7890"
                            className="glass-input tnum w-full rounded-ios-sm px-4 py-3 text-sm font-medium text-ink placeholder:text-ink-mute"
                        />
                        <p className="mt-1.5 text-[11.5px] text-ink-soft">
                            Struk konfirmasi & pengingat jadwal akan dikirim ke nomor ini.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="notes" className="eyebrow mb-1.5 block text-ink-soft">
                            Catatan Tambahan (Opsional)
                        </label>
                        <textarea
                            id="notes"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Contoh: minta fade tipis samping"
                            className="glass-input w-full resize-none rounded-ios-sm px-4 py-3 text-[13px] font-medium leading-relaxed text-ink placeholder:text-ink-mute"
                        />
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-black/[0.04] bg-black/[0.02] p-3">
                        <Icon name="info" size={18} className="shrink-0 text-ink-soft" />
                        <p className="text-[11.5px] leading-normal text-ink-soft">
                            Harap hadir 5-10 menit sebelum jadwal untuk kelancaran antrean.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-ios bg-ink text-sm font-semibold tracking-wide text-white shadow-lg transition-all active:scale-[0.985] disabled:opacity-50 hover:bg-black"
                    >
                        <Icon name="chat" size={20} className="text-confirmed" />
                        {submitting ? "Memproses…" : "Konfirmasi via WhatsApp"}
                    </button>

                    <a
                        href={`https://wa.me/${normalizeWa(KONTAK.whatsapp)}?text=${encodeURIComponent(
                            "Halo Eddy Barbershop, saya ingin bertanya tentang jadwal dan layanan."
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Hubungi Eddy Barbershop via WhatsApp"
                        className="glass-card flex min-h-[48px] w-full items-center justify-center gap-2 rounded-ios px-5 text-sm font-semibold tracking-wide text-ink transition-all duration-150 hover:bg-white active:scale-[0.98]"
                    >
                        <Icon name="support_agent" size={20} className="text-ink-soft" />
                        Hubungi via WhatsApp
                    </a>
                </form>
            </div>
        </section>
    );
}

/* ---------------- STEP 5: SUKSES ---------------- */

/**
 * Susun pesan konfirmasi booking untuk dikirim via wa.me.
 * Nomor kapster TIDAK dicantumkan bila `anonymizeBarber` (mode acak),
 * karena kapster baru ditentukan saat pelanggan datang.
 */
function buildWaMessage({ result, name, whatsapp, anonymizeBarber }) {
    const jam = String(result?.start_time ?? "").slice(0, 5);
    const lines = [
        "*Eddy Barbershop — Konfirmasi Booking*",
        `Nama Pemesan: ${name || "-"}`,
        `No. WhatsApp: ${whatsapp || "-"}`,
        `Layanan: ${result?.service?.name || "-"}`,
    ];
    if (anonymizeBarber) {
        lines.push("Kapster: ditentukan saat datang");
    } else if (result?.barber?.name) {
        lines.push(`Kapster: ${result.barber.name}`);
    }
    lines.push(
        `Tanggal: ${result?.date ? tanggalIndo(result.date) : "-"}`,
        `Jam: ${jam ? `${jam} WIB` : "-"}`,
        `Total: ${harga(result?.service)}`,
        `Alamat: ${ALAMAT}`,
        "Catatan: Tunjukkan pesan ini saat datang.",
    );
    return lines.join("\n");
}

function StepSukses({ result, name = "", whatsapp = "", anonymizeBarber = false }) {
    const waNumber = normalizeWa(whatsapp);
    const waHref = waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
              buildWaMessage({ result, name, whatsapp, anonymizeBarber })
          )}`
        : null;

    return (
        <section className="rise py-10 text-center">
            <div className="glass-card mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                <Icon name="check_circle" size={40} filled className="text-confirmed" />
            </div>
            <Eyebrow>Booking Terkonfirmasi</Eyebrow>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-wide text-ink">Sampai Jumpa</h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink-soft">
                {result.service?.name}
                {anonymizeBarber ? "" : ` dengan ${result.barber?.name}`} pada {tanggalIndo(result.date)} jam{" "}
                <span className="tnum font-semibold text-ink">{String(result.start_time).slice(0, 5)}</span>.
                Tunjukkan halaman ini saat datang.
            </p>
            {anonymizeBarber && (
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                    Kapster akan ditentukan saat Anda tiba — Anda akan dilayani oleh kapster yang siap lebih dulu.
                </p>
            )}

            {waHref && (
                <div className="mx-auto mt-8 max-w-md">
                    <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Kirim ringkasan booking ke WhatsApp saya"
                        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-ios bg-ink px-5 text-sm font-semibold tracking-wide text-white shadow-sm transition-all duration-150 hover:bg-black active:scale-[0.98]"
                    >
                        <Icon name="chat" size={20} className="text-confirmed" />
                        Kirim ke WhatsApp
                    </a>
                    <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">
                        Simpan pesan ini sebagai bukti booking — tunjukkan saat datang.
                    </p>
                </div>
            )}

            <Button as="a" href="/" variant="secondary" className="mt-8">
                Kembali ke Beranda
            </Button>
        </section>
    );
}

/* ---------------- Bagian kecil ---------------- */
function StepTitle({ no, title, note }) {
    return (
        <div className="mb-4 px-0.5">
            <div className="mb-1 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                <Eyebrow>Langkah {no} dari 4</Eyebrow>
            </div>
            <h1 className="font-display text-3xl uppercase leading-none tracking-wide text-ink">{title}</h1>
            {note && <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{note}</p>}
        </div>
    );
}

function RadioDot({ selected }) {
    return (
        <div
            className={`flex h-5 w-5 items-center justify-center rounded-md transition-all ${
                selected ? "bg-ink" : "border border-black/20 bg-white/80"
            }`}
        >
            {selected && <Icon name="check" size={13} filled className="text-white" />}
        </div>
    );
}

function LegendDot({ className, label, strong, muted }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
            <span className={strong ? "font-semibold text-ink" : muted ? "text-ink-mute" : "text-ink-soft"}>
                {label}
            </span>
        </div>
    );
}

function SummaryRow({ label, value, sub }) {
    return (
        <div className="flex items-start justify-between py-3">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="text-right">
                <div className="font-semibold text-ink">{value}</div>
                {sub && <div className="mt-0.5 text-[11.5px] text-ink-soft">{sub}</div>}
            </dd>
        </div>
    );
}

/**
 * Bar melayang bawah: ringkasan pilihan + tombol maju/mundur.
 * `onNext` memajukan step. Tombol selalu bisa diklik agar bisa memberi
 * umpan balik bila prasyarat step belum dipenuhi.
 */
function StickySummary({ step, service, barber, date, startTime, onBack, onNext }) {
    const nextLabel = ["", "Lanjut Pilih Kapster", "Lanjut Pilih Jadwal", "Lanjut ke Konfirmasi", ""][step];
    const canNext = step === 1 ? Boolean(service) : step === 2 ? Boolean(barber) : step === 3 ? Boolean(startTime) : false;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
            <div className="mx-auto max-w-[720px] pointer-events-auto p-3">
                <div className="glass-bar flex items-center gap-2.5 rounded-ios-lg p-2.5">
                    <button
                        type="button"
                        aria-label="Kembali"
                        onClick={onBack}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-ink transition-all active:scale-95 hover:bg-black/10"
                    >
                        <Icon name="arrow_back_ios_new" size={18} />
                    </button>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-1">
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-semibold uppercase tracking-wide text-gold-text">
                                {service ? service.name : "Belum ada layanan dipilih"}
                                {barber ? ` • ${barber.name}` : ""}
                            </div>
                            <div className="flex items-center gap-1.5 truncate text-[13px] font-bold text-ink">
                                {date && startTime ? (
                                    <>
                                        <span>{tanggalIndo(date)}</span>
                                        <span className="text-gold-text" aria-hidden="true">•</span>
                                        <span className="tnum">{startTime} WIB</span>
                                    </>
                                ) : (
                                    <span className="font-medium text-ink-soft">
                                        {canNext ? nextLabel : "Pilih salah satu"}
                                    </span>
                                )}
                            </div>
                            {service && (
                                <div className="tnum mt-0.5 truncate text-xs font-semibold text-ink">
                                    {harga(service)}
                                </div>
                            )}
                        </div>
                        {step < 4 && (
                            <button
                                type="button"
                                onClick={onNext}
                                aria-disabled={!canNext}
                                className={`shrink-0 rounded-xl px-4 py-3 text-xs font-semibold transition-all active:scale-[0.97] ${
                                    canNext
                                        ? "bg-ink text-white hover:bg-black"
                                        : "bg-black/10 text-ink-soft"
                                }`}
                            >
                                {nextLabel}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Orb kabur latar. */
function AmbientGlow() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-[#eadeb5]/25 blur-3xl" />
            <div className="absolute top-1/4 -right-24 h-80 w-80 rounded-full bg-black/[0.03] blur-3xl" />
            <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        </div>
    );
}
