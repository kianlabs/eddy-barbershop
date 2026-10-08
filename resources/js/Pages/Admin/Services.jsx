/**
 * Kelola layanan — daftar + toggle aktif/nonaktif + edit inline.
 * Props: services (dengan bookings_count).
 */
import { Head, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "../../Components/AdminLayout";
import { Button, Icon, IconAction, harga, isRange, rupiah } from "../../Components/ui";

export default function Services({ services }) {
    const [editingId, setEditingId] = useState(null);

    const toggle = (service) => {
        router.patch(
            `/admin/services/${service.id}/active`,
            { is_active: !service.is_active },
            { preserveScroll: true }
        );
    };

    const aktif = services.filter((s) => s.is_active).length;

    return (
        <AdminLayout
            title="Kelola Layanan"
            eyebrow="Menu & Tarif"
            action={
                <span className="text-[12px] font-medium text-ink-mute">
                    {aktif} aktif · {services.length} total
                </span>
            }
        >
            <Head title="Layanan — Admin Eddy Barbershop" />

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
                                    <IconAction
                                        icon="edit"
                                        label="Ubah"
                                        onClick={() => setEditingId(s.id)}
                                    />
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </AdminLayout>
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
                {errors.name && <FieldError>{errors.name}</FieldError>}
            </div>

            <div>
                <label className="eyebrow mb-1 block text-ink-mute">Deskripsi</label>
                <textarea
                    rows={2}
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    className="glass-input w-full rounded-ios-sm px-3 py-2 text-sm text-ink"
                />
                {errors.description && <FieldError>{errors.description}</FieldError>}
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
                    {errors.duration_minutes && <FieldError>{errors.duration_minutes}</FieldError>}
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
                    {errors.price && <FieldError>{errors.price}</FieldError>}
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
                    {errors.price_max && <FieldError>{errors.price_max}</FieldError>}
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

function FieldError({ children }) {
    return (
        <p className="mt-1 flex items-center gap-1 text-[12px] text-[#b42318]">
            <Icon name="error" size={13} />
            {children}
        </p>
    );
}
