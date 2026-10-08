/**
 * Kelola Testimoni (Gap 16) — daftar ulasan pelanggan + tambah + edit + hapus + toggle.
 * Data disimpan di tabel `testimonials`. Integrasi ke Home.jsx dicatat sebagai TODO
 * (Home.jsx saat ini milik sesi lain).
 * Props: testimonials.
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
} from "../../Components/ui";

export default function Testimonials({ testimonials }) {
    const [bukaTambah, setBukaTambah] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const toggle = (t) => {
        router.put(
            `/admin/testimonials/${t.id}`,
            {
                author_name: t.author_name,
                author_location: t.author_location,
                quote: t.quote,
                rating: t.rating,
                member_since: t.member_since,
                sort_order: t.sort_order,
                is_active: !t.is_active,
            },
            { preserveScroll: true }
        );
    };

    const hapus = (t) => {
        router.delete(`/admin/testimonials/${t.id}`, {
            preserveScroll: true,
        });
    };

    const aktif = testimonials.filter((t) => t.is_active).length;

    return (
        <AdminLayout
            title="Kelola Testimoni"
            eyebrow="Ulasan Pelanggan"
            action={
                <div className="flex items-center gap-3">
                    <span className="text-[12px] font-medium text-ink-mute">
                        {aktif} aktif · {testimonials.length} total
                    </span>
                    {!bukaTambah && (
                        <Button
                            type="button"
                            onClick={() => setBukaTambah(true)}
                            className="h-10 px-4 text-xs uppercase tracking-wider"
                        >
                            <Icon name="rate_review" size={16} className="text-gold" />
                            Tambah Testimoni
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Testimoni — Admin Eddy Barbershop" />

            <div className="glass-card mb-4 rounded-ios border-l-4 border-l-gold-text p-3 text-xs text-ink-soft">
                <div className="flex items-center gap-1.5 font-semibold text-ink">
                    <Icon name="info" size={16} className="text-gold-text" />
                    Catatan Integrasi:
                </div>
                <p className="mt-1 leading-relaxed">
                    Testimoni tersimpan di tabel <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono">testimonials</code>.
                    Tampilan pada <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono">Home.jsx</code> akan diintegrasikan setelah sesi landing page selesai.
                </p>
            </div>

            {/* Form Tambah Testimoni */}
            {bukaTambah && (
                <div className="glass-card mb-4 rounded-ios border-l-4 border-l-gold p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-gold">
                                <Icon name="rate_review" size={17} />
                            </span>
                            <h2 className="font-display text-xl uppercase tracking-wide text-ink">
                                Tambah Testimoni Baru
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
                    <TestimonialCreateForm onDone={() => setBukaTambah(false)} />
                </div>
            )}

            {/* Daftar Testimoni */}
            {testimonials.length === 0 ? (
                <div className="glass-card rounded-ios px-4 py-10 text-center text-sm text-ink-mute">
                    Belum ada testimoni. Klik "Tambah Testimoni" untuk memasukkan ulasan pelanggan.
                </div>
            ) : (
                <ul className="space-y-3">
                    {testimonials.map((t) => (
                        <li key={t.id} className="glass-card rounded-ios p-4">
                            {editingId === t.id ? (
                                <TestimonialEditForm
                                    testimonial={t}
                                    onDone={() => setEditingId(null)}
                                />
                            ) : (
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-gold">
                                                {Array.from({ length: t.rating }).map((_, i) => (
                                                    <Icon key={i} name="star" size={16} filled />
                                                ))}
                                            </div>
                                            <span className="font-semibold text-ink">
                                                {t.author_name}
                                            </span>
                                            {t.author_location && (
                                                <span className="text-xs text-ink-mute">
                                                    · {t.author_location}
                                                </span>
                                            )}
                                            <span
                                                className={`h-2 w-2 rounded-full ${
                                                    t.is_active ? "bg-confirmed" : "bg-ink-mute"
                                                }`}
                                                title={t.is_active ? "Aktif" : "Nonaktif"}
                                            />
                                        </div>

                                        <p className="mt-1.5 text-xs italic leading-relaxed text-ink/90">
                                            "{t.quote}"
                                        </p>

                                        {t.member_since && (
                                            <div className="mt-1 text-[11px] text-ink-mute">
                                                {t.member_since}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <IconAction
                                            icon={t.is_active ? "toggle_on" : "toggle_off"}
                                            label={t.is_active ? "Nonaktifkan" : "Aktifkan"}
                                            tone={t.is_active ? "gold" : "default"}
                                            onClick={() => toggle(t)}
                                        />
                                        <IconAction
                                            icon="edit"
                                            label="Ubah"
                                            onClick={() => setEditingId(t.id)}
                                        />
                                        <HapusKonfirmasi
                                            onConfirm={() => hapus(t)}
                                            label="Hapus"
                                            konfirmasi="Hapus testimoni?"
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

function TestimonialCreateForm({ onDone }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        author_name: "",
        author_location: "",
        quote: "",
        rating: 5,
        member_since: "",
        sort_order: 0,
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post("/admin/testimonials", {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onDone();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Nama Pelanggan *</label>
                    <input
                        placeholder="mis. Dimas P."
                        value={data.author_name}
                        onChange={(e) => setData("author_name", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                        autoFocus
                    />
                    {errors.author_name && <FieldErrorAdmin>{errors.author_name}</FieldErrorAdmin>}
                </div>

                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Asal / Lokasi (Opsional)</label>
                    <input
                        placeholder="mis. Gonilan Kartasura"
                        value={data.author_location}
                        onChange={(e) => setData("author_location", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.author_location && (
                        <FieldErrorAdmin>{errors.author_location}</FieldErrorAdmin>
                    )}
                </div>
            </div>

            <div>
                <label className="eyebrow mb-1 block text-ink-mute">Isi Ulasan / Testimoni *</label>
                <textarea
                    rows={3}
                    placeholder="Cerita pelanggan tentang pengalaman potong rambut..."
                    value={data.quote}
                    onChange={(e) => setData("quote", e.target.value)}
                    className="glass-input w-full rounded-ios-sm px-3 py-2 text-sm text-ink"
                />
                {errors.quote && <FieldErrorAdmin>{errors.quote}</FieldErrorAdmin>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Rating Bintang (1-5) *</label>
                    <select
                        value={data.rating}
                        onChange={(e) => setData("rating", Number(e.target.value))}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                        <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                        <option value={2}>⭐⭐ (2 Bintang)</option>
                        <option value={1}>⭐ (1 Bintang)</option>
                    </select>
                    {errors.rating && <FieldErrorAdmin>{errors.rating}</FieldErrorAdmin>}
                </div>

                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Keterangan Member (Opsional)</label>
                    <input
                        placeholder="mis. Reguler sejak 2021"
                        value={data.member_since}
                        onChange={(e) => setData("member_since", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                </div>

                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Urutan Tampil</label>
                    <input
                        type="number"
                        min="0"
                        value={data.sort_order}
                        onChange={(e) => setData("sort_order", Number(e.target.value))}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-hairline pt-3">
                <Button type="button" variant="secondary" onClick={onDone} className="h-10 px-4 text-xs">
                    Batal
                </Button>
                <Button type="submit" disabled={processing} className="h-10 px-4 text-xs uppercase tracking-wider">
                    <Icon name="add" size={16} className="text-gold" />
                    Simpan Testimoni
                </Button>
            </div>
        </form>
    );
}

function TestimonialEditForm({ testimonial, onDone }) {
    const { data, setData, put, processing, errors } = useForm({
        author_name: testimonial.author_name || "",
        author_location: testimonial.author_location || "",
        quote: testimonial.quote || "",
        rating: testimonial.rating || 5,
        member_since: testimonial.member_since || "",
        sort_order: testimonial.sort_order ?? 0,
        is_active: testimonial.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/testimonials/${testimonial.id}`, {
            preserveScroll: true,
            onSuccess: () => onDone(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Nama</label>
                    <input
                        value={data.author_name}
                        onChange={(e) => setData("author_name", e.target.value)}
                        className="glass-input h-10 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.author_name && <FieldErrorAdmin>{errors.author_name}</FieldErrorAdmin>}
                </div>
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Lokasi</label>
                    <input
                        value={data.author_location}
                        onChange={(e) => setData("author_location", e.target.value)}
                        className="glass-input h-10 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                </div>
            </div>

            <div>
                <label className="eyebrow mb-1 block text-ink-mute">Ulasan</label>
                <textarea
                    rows={2}
                    value={data.quote}
                    onChange={(e) => setData("quote", e.target.value)}
                    className="glass-input w-full rounded-ios-sm px-3 py-2 text-sm text-ink"
                />
                {errors.quote && <FieldErrorAdmin>{errors.quote}</FieldErrorAdmin>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Rating</label>
                    <select
                        value={data.rating}
                        onChange={(e) => setData("rating", Number(e.target.value))}
                        className="glass-input h-10 w-full rounded-ios-sm px-3 text-sm text-ink"
                    >
                        <option value={5}>5 Bintang</option>
                        <option value={4}>4 Bintang</option>
                        <option value={3}>3 Bintang</option>
                        <option value={2}>2 Bintang</option>
                        <option value={1}>1 Bintang</option>
                    </select>
                </div>
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Member Sejak</label>
                    <input
                        value={data.member_since}
                        onChange={(e) => setData("member_since", e.target.value)}
                        className="glass-input h-10 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-hairline pt-3">
                <Button type="button" variant="secondary" onClick={onDone} className="h-9 px-3 text-xs">
                    Batal
                </Button>
                <Button type="submit" disabled={processing} className="h-9 px-3 text-xs uppercase">
                    Simpan
                </Button>
            </div>
        </form>
    );
}
