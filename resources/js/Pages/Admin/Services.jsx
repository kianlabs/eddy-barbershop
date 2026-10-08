/**
 * Kelola layanan — daftar + toggle aktif/nonaktif + edit inline + tambah baru + hapus.
 * Props: services (dengan bookings_count).
 */
import { Head, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "../../Components/AdminLayout";
import {
    Button,
    FieldErrorAdmin,
    HapusKonfirmasi,
    Icon,
    IconAction,
    harga,
    isRange,
    rupiah,
} from "../../Components/ui";

export default function Services({ services }) {
    const [editingId, setEditingId] = useState(null);
    const [bukaTambah, setBukaTambah] = useState(false);

    const toggle = (service) => {
        router.patch(
            `/admin/services/${service.id}/active`,
            { is_active: !service.is_active },
            { preserveScroll: true }
        );
    };

    const hapus = (service) => {
        router.delete(`/admin/services/${service.id}`, {
            preserveScroll: true,
        });
    };

    const aktif = services.filter((s) => s.is_active).length;

    return (
        <AdminLayout
            title="Kelola Layanan"
            eyebrow="Menu & Tarif"
            action={
                <div className="flex items-center gap-3">
                    <span className="text-[12px] font-medium text-ink-mute">
                        {aktif} aktif · {services.length} total
                    </span>
                    {!bukaTambah && (
                        <Button
                            type="button"
                            onClick={() => setBukaTambah(true)}
                            className="h-10 px-4 text-xs uppercase tracking-wider"
                        >
                            <Icon name="add" size={16} className="text-gold" />
                            Tambah Layanan
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Layanan — Admin Eddy Barbershop" />

            {/* Form Tambah Layanan Baru */}
            {bukaTambah && (
                <div className="glass-card mb-4 rounded-ios border-l-4 border-l-gold p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-gold">
                                <Icon name="add_circle" size={17} />
                            </span>
                            <h2 className="font-display text-xl uppercase tracking-wide text-ink">
                                Tambah Layanan Baru
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
                    <CreateServiceForm onDone={() => setBukaTambah(false)} />
                </div>
            )}

            <ul className="space-y-3">
                {services.map((s) => (
                    <li key={s.id} className="glass-card rounded-ios p-3.5">
                        {editingId === s.id ? (
                            <ServiceForm
                                service={s}
                                onDone={() => setEditingId(null)}
                            />
                        ) : (
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-[15px] font-semibold text-ink">{s.name}</h3>
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
                                            {s.is_active ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                                        {s.description || "Tanpa deskripsi"}
                                    </p>
                                    <div className="tnum mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-mute">
                                        <span className="inline-flex items-center gap-1">
                                            <Icon name="schedule" size={13} />
                                            {s.duration_minutes} menit
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Icon name="payments" size={13} />
                                            {harga(s)}
                                            {isRange(s) && <span className="italic">(range)</span>}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Icon name="event" size={13} />
                                            {s.bookings_count} booking
                                        </span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                    <IconAction
                                        icon={s.is_active ? "toggle_on" : "toggle_off"}
                                        label={s.is_active ? "Nonaktifkan" : "Aktifkan"}
                                        tone={s.is_active ? "gold" : "default"}
                                        onClick={() => toggle(s)}
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <IconAction
                                            icon="edit"
                                            label="Ubah"
                                            onClick={() => setEditingId(s.id)}
                                        />
                                        <HapusKonfirmasi
                                            onConfirm={() => hapus(s)}
                                            label="Hapus"
                                            konfirmasi="Hapus layanan?"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </AdminLayout>
    );
}

/** Form tambah layanan baru. */
function CreateServiceForm({ onDone }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
        duration_minutes: 30,
        price: "",
        price_max: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/admin/services", {
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
                <label className="eyebrow mb-1 block text-ink-mute">Nama Layanan *</label>
                <input
                    placeholder="mis. Potong Rambut + Cuci"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    autoFocus
                />
                {errors.name && <FieldErrorAdmin>{errors.name}</FieldErrorAdmin>}
            </div>

            <div>
                <label className="eyebrow mb-1 block text-ink-mute">Deskripsi (Opsional)</label>
                <textarea
                    rows={2}
                    placeholder="Penjelasan singkat layanan..."
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    className="glass-input w-full rounded-ios-sm px-3 py-2 text-sm text-ink"
                />
                {errors.description && <FieldErrorAdmin>{errors.description}</FieldErrorAdmin>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Durasi (Menit) *</label>
                    <input
                        type="number"
                        min="5"
                        max="480"
                        value={data.duration_minutes}
                        onChange={(e) => setData("duration_minutes", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.duration_minutes && (
                        <FieldErrorAdmin>{errors.duration_minutes}</FieldErrorAdmin>
                    )}
                </div>
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Harga (Rp) *</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="25000"
                        value={data.price}
                        onChange={(e) => setData("price", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.price && <FieldErrorAdmin>{errors.price}</FieldErrorAdmin>}
                </div>
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Harga Maks (Rp, Opsional)</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="mis. 50000 (bila ber-range)"
                        value={data.price_max}
                        onChange={(e) => setData("price_max", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink placeholder:text-ink-mute/70"
                    />
                    {errors.price_max && <FieldErrorAdmin>{errors.price_max}</FieldErrorAdmin>}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-hairline pt-3">
                <span className="tnum text-[12px] text-ink-mute">
                    {data.price ? `Tarif: ${rupiah(data.price || 0)}` : "Wajib isi nama, durasi, dan harga"}
                </span>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onDone}
                        className="h-10 px-4 text-xs"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-10 px-4 text-xs uppercase tracking-wider"
                    >
                        <Icon name="add" size={16} className="text-gold" />
                        Tambah
                    </Button>
                </div>
            </div>
        </form>
    );
}

/** Form edit layanan (inline). */
function ServiceForm({ service, onDone }) {
    const { data, setData, put, processing, errors } = useForm({
        name: service.name || "",
        description: service.description || "",
        duration_minutes: service.duration_minutes || 30,
        price: service.price || 0,
        price_max: service.price_max || "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/services/${service.id}`, {
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
                <label className="eyebrow mb-1 block text-ink-mute">Deskripsi</label>
                <textarea
                    rows={2}
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    className="glass-input w-full rounded-ios-sm px-3 py-2 text-sm text-ink"
                />
                {errors.description && <FieldErrorAdmin>{errors.description}</FieldErrorAdmin>}
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Durasi (mnt)</label>
                    <input
                        type="number"
                        min="5"
                        value={data.duration_minutes}
                        onChange={(e) => setData("duration_minutes", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.duration_minutes && (
                        <FieldErrorAdmin>{errors.duration_minutes}</FieldErrorAdmin>
                    )}
                </div>
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Harga</label>
                    <input
                        type="number"
                        min="0"
                        value={data.price}
                        onChange={(e) => setData("price", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.price && <FieldErrorAdmin>{errors.price}</FieldErrorAdmin>}
                </div>
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Harga maks</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="opsional"
                        value={data.price_max ?? ""}
                        onChange={(e) => setData("price_max", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink placeholder:text-ink-mute/70"
                    />
                    {errors.price_max && <FieldErrorAdmin>{errors.price_max}</FieldErrorAdmin>}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-hairline pt-3">
                <span className="tnum text-[12px] text-ink-mute">Preview: {rupiah(data.price || 0)}</span>
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
