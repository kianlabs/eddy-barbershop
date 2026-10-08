/**
 * Kelola kapster — daftar + toggle aktif/nonaktif + tambah + edit + hapus + tautan jadwal.
 * Props: barbers (dengan bookings_count).
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
} from "../../Components/ui";

/** Inisial nama kapster (mis. "Mas Eddy" -> "ME") bila foto tidak ada. */
function inisial(name) {
    return String(name || "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
}

export default function Barbers({ barbers }) {
    const [bukaTambah, setBukaTambah] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const toggle = (barber) => {
        router.patch(
            `/admin/barbers/${barber.id}/active`,
            { is_active: !barber.is_active },
            { preserveScroll: true }
        );
    };

    const hapus = (barber) => {
        router.delete(`/admin/barbers/${barber.id}`, {
            preserveScroll: true,
        });
    };

    const aktif = barbers.filter((b) => b.is_active).length;

    return (
        <AdminLayout
            title="Kelola Kapster"
            eyebrow="Tim Profesional"
            action={
                <div className="flex items-center gap-3">
                    <span className="text-[12px] font-medium text-ink-mute">
                        {aktif} aktif · {barbers.length} total
                    </span>
                    {!bukaTambah && (
                        <Button
                            type="button"
                            onClick={() => setBukaTambah(true)}
                            className="h-10 px-4 text-xs uppercase tracking-wider"
                        >
                            <Icon name="person_add" size={16} className="text-gold" />
                            Tambah Kapster
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Kapster — Admin Eddy Barbershop" />

            {/* Form Tambah Kapster Baru */}
            {bukaTambah && (
                <div className="glass-card mb-4 rounded-ios border-l-4 border-l-gold p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-gold">
                                <Icon name="person_add" size={17} />
                            </span>
                            <h2 className="font-display text-xl uppercase tracking-wide text-ink">
                                Tambah Kapster Baru
                            </h2>
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
                    <BarberCreateForm onDone={() => setBukaTambah(false)} />
                </div>
            )}

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {barbers.map((b) => (
                    <li key={b.id} className="glass-card rounded-ios p-4">
                        {editingId === b.id ? (
                            <BarberEditForm barber={b} onDone={() => setEditingId(null)} />
                        ) : (
                            <>
                                <div className="flex items-start gap-3.5">
                                    {b.photo ? (
                                        <img
                                            src={b.photo}
                                            alt={`Foto ${b.name}`}
                                            loading="lazy"
                                            className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <div
                                            aria-hidden="true"
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-lg uppercase tracking-wide text-gold"
                                        >
                                            {inisial(b.name)}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[15px] font-semibold text-ink">{b.name}</h3>
                                            <span
                                                className={`h-2 w-2 shrink-0 rounded-full ${b.is_active ? "bg-confirmed" : "bg-ink-mute"}`}
                                                title={b.is_active ? "Aktif" : "Nonaktif"}
                                            />
                                        </div>
                                        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                                            {b.specialty || "Tanpa spesialisasi"}
                                        </p>
                                        <div className="tnum mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-mute">
                                            <span className="inline-flex items-center gap-1">
                                                <Icon name="event" size={13} />
                                                {b.bookings_count} booking
                                            </span>
                                            <Link
                                                href={`/admin/barbers/${b.id}/schedules`}
                                                className="inline-flex items-center gap-1 font-semibold text-gold-text hover:underline"
                                            >
                                                <Icon name="schedule" size={13} />
                                                Atur Jadwal
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3">
                                    <IconAction
                                        icon={b.is_active ? "toggle_on" : "toggle_off"}
                                        label={b.is_active ? "Nonaktifkan" : "Aktifkan"}
                                        tone={b.is_active ? "gold" : "default"}
                                        onClick={() => toggle(b)}
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <IconAction
                                            icon="edit"
                                            label="Ubah"
                                            onClick={() => setEditingId(b.id)}
                                        />
                                        <HapusKonfirmasi
                                            onConfirm={() => hapus(b)}
                                            label="Hapus"
                                            konfirmasi="Hapus kapster?"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </AdminLayout>
    );
}

/** Form tambah kapster baru. */
function BarberCreateForm({ onDone }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        specialty: "",
        photo: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/admin/barbers", {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onDone();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <label className="eyebrow mb-1 block text-ink-mute">Nama Kapster *</label>
                <input
                    placeholder="mis. Kang Yanto"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    autoFocus
                />
                {errors.name && <FieldErrorAdmin>{errors.name}</FieldErrorAdmin>}
            </div>

            <div>
                <label className="eyebrow mb-1 block text-ink-mute">Spesialisasi</label>
                <input
                    placeholder="mis. Fade Specialist, Classic Pompadour"
                    value={data.specialty}
                    onChange={(e) => setData("specialty", e.target.value)}
                    className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                />
                {errors.specialty && <FieldErrorAdmin>{errors.specialty}</FieldErrorAdmin>}
            </div>

            <div>
                <label className="eyebrow mb-1 block text-ink-mute">URL Foto (Opsional)</label>
                <input
                    placeholder="mis. /images/barbers/kang-yanto.webp"
                    value={data.photo}
                    onChange={(e) => setData("photo", e.target.value)}
                    className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                />
                {errors.photo && <FieldErrorAdmin>{errors.photo}</FieldErrorAdmin>}
            </div>

            <div className="flex justify-end gap-2 border-t border-hairline pt-3">
                <Button type="button" variant="secondary" onClick={onDone} className="h-10 px-4 text-xs">
                    Batal
                </Button>
                <Button type="submit" disabled={processing} className="h-10 px-4 text-xs uppercase tracking-wider">
                    <Icon name="person_add" size={16} className="text-gold" />
                    Simpan Kapster
                </Button>
            </div>
        </form>
    );
}

/** Form edit kapster (inline). */
function BarberEditForm({ barber, onDone }) {
    const { data, setData, put, processing, errors } = useForm({
        name: barber.name || "",
        specialty: barber.specialty || "",
        photo: barber.photo || "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/barbers/${barber.id}`, {
            preserveScroll: true,
            onSuccess: () => onDone(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <label className="eyebrow mb-1 block text-ink-mute">Nama</label>
                <input
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                />
                {errors.name && <FieldErrorAdmin>{errors.name}</FieldErrorAdmin>}
            </div>

            <div>
                <label className="eyebrow mb-1 block text-ink-mute">Spesialisasi</label>
                <input
                    value={data.specialty}
                    onChange={(e) => setData("specialty", e.target.value)}
                    className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                />
                {errors.specialty && <FieldErrorAdmin>{errors.specialty}</FieldErrorAdmin>}
            </div>

            <div>
                <label className="eyebrow mb-1 block text-ink-mute">URL Foto</label>
                <input
                    value={data.photo}
                    onChange={(e) => setData("photo", e.target.value)}
                    className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                />
                {errors.photo && <FieldErrorAdmin>{errors.photo}</FieldErrorAdmin>}
            </div>

            <div className="flex justify-end gap-2 border-t border-hairline pt-3">
                <Button type="button" variant="secondary" onClick={onDone} className="h-10 px-4 text-xs">
                    Batal
                </Button>
                <Button type="submit" disabled={processing} className="h-10 px-4 text-xs uppercase tracking-wider">
                    <Icon name="save" size={16} className="text-gold" />
                    Simpan
                </Button>
            </div>
        </form>
    );
}
