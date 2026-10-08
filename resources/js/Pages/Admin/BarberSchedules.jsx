/**
 * Kelola Jadwal Kapster (Gap 4) — atur jam buka per hari (0=Minggu .. 6=Sabtu).
 * Props: barber, schedules, days (array nama hari), takenDays (array angka hari).
 */
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "../../Components/AdminLayout";
import {
    Button,
    FieldErrorAdmin,
    HapusKonfirmasi,
    Icon,
    IconAction,
    hariIndo,
    jamHHMM,
} from "../../Components/ui";

export default function BarberSchedules({ barber, schedules, days, takenDays }) {
    const [bukaTambah, setBukaTambah] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const toggle = (schedule) => {
        router.put(
            `/admin/barbers/${barber.id}/schedules/${schedule.id}`,
            {
                day_of_week: schedule.day_of_week,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                is_active: !schedule.is_active,
            },
            { preserveScroll: true }
        );
    };

    const hapus = (schedule) => {
        router.delete(`/admin/barbers/${barber.id}/schedules/${schedule.id}`, {
            preserveScroll: true,
        });
    };

    const sisaHari = days
        .map((nama, idx) => ({ idx, nama }))
        .filter((h) => !takenDays.includes(h.idx));

    return (
        <AdminLayout
            title={`Jadwal: ${barber.name}`}
            eyebrow="Jam Kerja Kapster"
            action={
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/barbers"
                        className="glass-card inline-flex h-10 items-center gap-1 rounded-ios px-3 text-xs font-semibold text-ink hover:bg-white"
                    >
                        <Icon name="arrow_back" size={16} />
                        Semua Kapster
                    </Link>
                    {sisaHari.length > 0 && !bukaTambah && (
                        <Button
                            type="button"
                            onClick={() => setBukaTambah(true)}
                            className="h-10 px-4 text-xs uppercase tracking-wider"
                        >
                            <Icon name="add" size={16} className="text-gold" />
                            Tambah Hari
                        </Button>
                    )}
                </div>
            }
        >
            <Head title={`Jadwal ${barber.name} — Admin Eddy Barbershop`} />

            {/* Info Kapster */}
            <div className="glass-card mb-4 flex items-center justify-between rounded-ios p-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-lg uppercase text-gold">
                        <Icon name="badge" size={20} />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-semibold text-ink">{barber.name}</h2>
                        <p className="text-[12px] text-ink-soft">
                            {barber.specialty || "Kapster Eddy Barbershop"}
                        </p>
                    </div>
                </div>
                <div className="tnum text-right text-[12px] text-ink-mute">
                    <div>{schedules.length} dari 7 hari terdaftar</div>
                    <div className="text-[11px]">
                        {schedules.filter((s) => s.is_active).length} hari aktif
                    </div>
                </div>
            </div>

            {/* Form Tambah Jadwal Hari */}
            {bukaTambah && (
                <div className="glass-card mb-4 rounded-ios border-l-4 border-l-gold p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-gold">
                                <Icon name="more_time" size={17} />
                            </span>
                            <h3 className="font-display text-xl uppercase tracking-wide text-ink">
                                Tambah Jadwal Hari Baru
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setBukaTambah(false)}
                            aria-label="Tutup"
                            className="text-ink-mute hover:text-ink"
                        >
                            <Icon name="close" size={18} />
                        </button>
                    </div>
                    <ScheduleCreateForm
                        barber={barber}
                        sisaHari={sisaHari}
                        onDone={() => setBukaTambah(false)}
                    />
                </div>
            )}

            {/* Daftar Jadwal */}
            {schedules.length === 0 ? (
                <div className="glass-card rounded-ios px-4 py-10 text-center text-sm text-ink-mute">
                    Belum ada jadwal untuk kapster ini. Klik "Tambah Hari" untuk mulai mengatur.
                </div>
            ) : (
                <ul className="space-y-3">
                    {schedules.map((s) => (
                        <li key={s.id} className="glass-card rounded-ios p-3.5">
                            {editingId === s.id ? (
                                <ScheduleEditForm
                                    barber={barber}
                                    schedule={s}
                                    days={days}
                                    onDone={() => setEditingId(null)}
                                />
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-display text-lg tracking-wide text-ink">
                                                {s.day_name}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                                    s.is_active
                                                        ? "bg-confirmed/15 text-confirmed"
                                                        : "bg-black/[0.06] text-ink-mute"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${s.is_active ? "bg-confirmed" : "bg-ink-mute"}`}
                                                />
                                                {s.is_active ? "Buka" : "Libur"}
                                            </span>
                                        </div>
                                        <div className="tnum mt-0.5 flex items-center gap-1 text-[13px] text-ink-soft">
                                            <Icon name="schedule" size={14} className="text-ink-mute" />
                                            <span>
                                                {jamHHMM(s.start_time)} – {jamHHMM(s.end_time)} WIB
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <IconAction
                                            icon={s.is_active ? "toggle_on" : "toggle_off"}
                                            label={s.is_active ? "Liburkan" : "Buka"}
                                            tone={s.is_active ? "gold" : "default"}
                                            onClick={() => toggle(s)}
                                        />
                                        <IconAction
                                            icon="edit"
                                            label="Ubah"
                                            onClick={() => setEditingId(s.id)}
                                        />
                                        <HapusKonfirmasi
                                            onConfirm={() => hapus(s)}
                                            label="Hapus"
                                            konfirmasi={`Hapus jadwal ${s.day_name}?`}
                                        />
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </AdminLayout>
    );
}

/** Form tambah hari kerja kapster. */
function ScheduleCreateForm({ barber, sisaHari, onDone }) {
    const defaultDay = sisaHari[0]?.idx ?? 0;
    const { data, setData, post, processing, errors, reset } = useForm({
        day_of_week: defaultDay,
        start_time: "10:00",
        end_time: "23:00",
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/barbers/${barber.id}/schedules`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onDone();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Pilih Hari *</label>
                    <select
                        value={data.day_of_week}
                        onChange={(e) => setData("day_of_week", Number(e.target.value))}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    >
                        {sisaHari.map((h) => (
                            <option key={h.idx} value={h.idx}>
                                {h.nama}
                            </option>
                        ))}
                    </select>
                    {errors.day_of_week && (
                        <FieldErrorAdmin>{errors.day_of_week}</FieldErrorAdmin>
                    )}
                </div>

                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Jam Buka (HH:MM) *</label>
                    <input
                        type="time"
                        value={data.start_time}
                        onChange={(e) => setData("start_time", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.start_time && (
                        <FieldErrorAdmin>{errors.start_time}</FieldErrorAdmin>
                    )}
                </div>

                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Jam Tutup (HH:MM) *</label>
                    <input
                        type="time"
                        value={data.end_time}
                        onChange={(e) => setData("end_time", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.end_time && (
                        <FieldErrorAdmin>{errors.end_time}</FieldErrorAdmin>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-hairline pt-3">
                <label className="inline-flex items-center gap-2 text-xs text-ink-soft">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                        className="h-4 w-4 rounded accent-gold"
                    />
                    Langsung aktifkan jadwal ini
                </label>
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={onDone} className="h-10 px-4 text-xs">
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing} className="h-10 px-4 text-xs uppercase tracking-wider">
                        <Icon name="add" size={16} className="text-gold" />
                        Tambah Jadwal
                    </Button>
                </div>
            </div>
        </form>
    );
}

/** Form edit jadwal (inline). */
function ScheduleEditForm({ barber, schedule, days, onDone }) {
    const { data, setData, put, processing, errors } = useForm({
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: schedule.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/barbers/${barber.id}/schedules/${schedule.id}`, {
            preserveScroll: true,
            onSuccess: () => onDone(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Hari</label>
                    <input
                        disabled
                        value={days[schedule.day_of_week] || "-"}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink-soft opacity-75"
                    />
                </div>
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Jam Buka</label>
                    <input
                        type="time"
                        value={data.start_time}
                        onChange={(e) => setData("start_time", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.start_time && (
                        <FieldErrorAdmin>{errors.start_time}</FieldErrorAdmin>
                    )}
                </div>
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Jam Tutup</label>
                    <input
                        type="time"
                        value={data.end_time}
                        onChange={(e) => setData("end_time", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.end_time && (
                        <FieldErrorAdmin>{errors.end_time}</FieldErrorAdmin>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-hairline pt-3">
                <label className="inline-flex items-center gap-2 text-xs text-ink-soft">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                        className="h-4 w-4 rounded accent-gold"
                    />
                    Status buka
                </label>
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={onDone} className="h-10 px-4 text-xs">
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing} className="h-10 px-4 text-xs uppercase tracking-wider">
                        <Icon name="save" size={16} className="text-gold" />
                        Simpan
                    </Button>
                </div>
            </div>
        </form>
    );
}
