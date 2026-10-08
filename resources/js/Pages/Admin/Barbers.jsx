/**
 * Kelola kapster — daftar + toggle aktif/nonaktif.
 * Props: barbers (dengan bookings_count).
 */
import { Head, router } from "@inertiajs/react";
import AdminLayout from "../../Components/AdminLayout";
import { Icon, IconAction } from "../../Components/ui";

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
    const toggle = (barber) => {
        router.patch(
            `/admin/barbers/${barber.id}/active`,
            { is_active: !barber.is_active },
            { preserveScroll: true }
        );
    };

    const aktif = barbers.filter((b) => b.is_active).length;

    return (
        <AdminLayout
            title="Kelola Kapster"
            eyebrow="Tim Profesional"
            action={
                <span className="text-[12px] font-medium text-ink-mute">
                    {aktif} aktif · {barbers.length} total
                </span>
            }
        >
            <Head title="Kapster — Admin Eddy Barbershop" />

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {barbers.map((b) => (
                    <li key={b.id} className="glass-card rounded-ios p-4">
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
                                <div className="tnum mt-1.5 inline-flex items-center gap-1 text-[11px] text-ink-mute">
                                    <Icon name="event" size={13} />
                                    {b.bookings_count} booking
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 border-t border-hairline pt-3">
                            <IconAction
                                icon={b.is_active ? "toggle_on" : "toggle_off"}
                                label={b.is_active ? "Nonaktifkan" : "Aktifkan"}
                                tone={b.is_active ? "gold" : "default"}
                                onClick={() => toggle(b)}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </AdminLayout>
    );
}
