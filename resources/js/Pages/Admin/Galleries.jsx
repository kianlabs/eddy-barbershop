/**
 * Kelola Galeri (Gap 16) — daftar contoh hasil potong + tambah + edit + hapus + toggle.
 * Data disimpan di tabel `galleries`. Integrasi ke Home.jsx dicatat sebagai TODO
 * (Home.jsx saat ini milik sesi lain).
 * Props: galleries.
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

export default function Galleries({ galleries }) {
    const [bukaTambah, setBukaTambah] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const toggle = (g) => {
        router.put(
            `/admin/galleries/${g.id}`,
            {
                label: g.label,
                image_path: g.image_path,
                alt: g.alt,
                sort_order: g.sort_order,
                is_active: !g.is_active,
            },
            { preserveScroll: true }
        );
    };

    const hapus = (g) => {
        router.delete(`/admin/galleries/${g.id}`, {
            preserveScroll: true,
        });
    };

    const aktif = galleries.filter((g) => g.is_active).length;

    return (
        <AdminLayout
            title="Kelola Galeri"
            eyebrow="Portofolio Gaya"
            action={
                <div className="flex items-center gap-3">
                    <span className="text-[12px] font-medium text-ink-mute">
                        {aktif} aktif · {galleries.length} total
                    </span>
                    {!bukaTambah && (
                        <Button
                            type="button"
                            onClick={() => setBukaTambah(true)}
                            className="h-10 px-4 text-xs uppercase tracking-wider"
                        >
                            <Icon name="add_photo_alternate" size={16} className="text-gold" />
                            Tambah Gaya
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Galeri — Admin Eddy Barbershop" />

            <div className="glass-card mb-4 rounded-ios border-l-4 border-l-gold-text p-3 text-xs text-ink-soft">
                <div className="flex items-center gap-1.5 font-semibold text-ink">
                    <Icon name="info" size={16} className="text-gold-text" />
                    Catatan Integrasi:
                </div>
                <p className="mt-1 leading-relaxed">
                    Data galeri di sini tersimpan di basis data (tabel <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono">galleries</code>).
                    Tampilan publik di <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono">Home.jsx</code> akan disambungkan setelah modul selesai.
                </p>
            </div>

            {/* Form Tambah Gaya */}
            {bukaTambah && (
                <div className="glass-card mb-4 rounded-ios border-l-4 border-l-gold p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-gold">
                                <Icon name="add_photo_alternate" size={17} />
                            </span>
                            <h2 className="font-display text-xl uppercase tracking-wide text-ink">
                                Tambah Gaya Potong Baru
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
                    <GalleryCreateForm onDone={() => setBukaTambah(false)} />
                </div>
            )}

            {/* Daftar Galeri */}
            {galleries.length === 0 ? (
                <div className="glass-card rounded-ios px-4 py-10 text-center text-sm text-ink-mute">
                    Belum ada foto galeri terdaftar. Klik "Tambah Gaya" untuk mulai mengisi portofolio.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {galleries.map((g) => (
                        <div key={g.id} className="glass-card overflow-hidden rounded-ios p-3">
                            {editingId === g.id ? (
                                <GalleryEditForm gallery={g} onDone={() => setEditingId(null)} />
                            ) : (
                                <>
                                    <div className="relative mb-2.5 h-36 overflow-hidden rounded-ios-sm bg-black/[0.04]">
                                        <img
                                            src={g.image_path}
                                            alt={g.alt || g.label}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                        <div className="absolute top-2 right-2">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                                    g.is_active
                                                        ? "bg-confirmed text-white"
                                                        : "bg-ink text-white"
                                                }`}
                                            >
                                                {g.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <h3 className="font-semibold text-ink">{g.label}</h3>
                                        <p className="truncate text-[11px] text-ink-mute" title={g.image_path}>
                                            {g.image_path}
                                        </p>
                                        {g.alt && (
                                            <p className="mt-0.5 text-[11px] text-ink-soft">
                                                Alt: {g.alt}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-hairline pt-2">
                                        <IconAction
                                            icon={g.is_active ? "toggle_on" : "toggle_off"}
                                            label={g.is_active ? "Nonaktifkan" : "Aktifkan"}
                                            tone={g.is_active ? "gold" : "default"}
                                            onClick={() => toggle(g)}
                                        />
                                        <div className="flex items-center gap-1">
                                            <IconAction
                                                icon="edit"
                                                label="Ubah"
                                                onClick={() => setEditingId(g.id)}
                                            />
                                            <HapusKonfirmasi
                                                onConfirm={() => hapus(g)}
                                                label="Hapus"
                                                konfirmasi="Hapus foto?"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

function GalleryCreateForm({ onDone }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        label: "",
        image_path: "/images/galeri/",
        alt: "",
        sort_order: 0,
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post("/admin/galleries", {
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
                <label className="eyebrow mb-1 block text-ink-mute">Nama Gaya / Label *</label>
                <input
                    placeholder="mis. Skin Fade, Pompadour"
                    value={data.label}
                    onChange={(e) => setData("label", e.target.value)}
                    className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    autoFocus
                />
                {errors.label && <FieldErrorAdmin>{errors.label}</FieldErrorAdmin>}
            </div>

            <div>
                <label className="eyebrow mb-1 block text-ink-mute">Path Gambar *</label>
                <input
                    placeholder="/images/galeri/skin-fade.webp"
                    value={data.image_path}
                    onChange={(e) => setData("image_path", e.target.value)}
                    className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                />
                {errors.image_path && <FieldErrorAdmin>{errors.image_path}</FieldErrorAdmin>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Teks Alt (Aksesibilitas)</label>
                    <input
                        placeholder="Deskripsi ringkas gambar"
                        value={data.alt}
                        onChange={(e) => setData("alt", e.target.value)}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.alt && <FieldErrorAdmin>{errors.alt}</FieldErrorAdmin>}
                </div>
                <div>
                    <label className="eyebrow mb-1 block text-ink-mute">Urutan Tampil (0, 1, 2...)</label>
                    <input
                        type="number"
                        min="0"
                        value={data.sort_order}
                        onChange={(e) => setData("sort_order", Number(e.target.value))}
                        className="glass-input h-11 w-full rounded-ios-sm px-3 text-sm text-ink"
                    />
                    {errors.sort_order && <FieldErrorAdmin>{errors.sort_order}</FieldErrorAdmin>}
                </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-hairline pt-3">
                <Button type="button" variant="secondary" onClick={onDone} className="h-10 px-4 text-xs">
                    Batal
                </Button>
                <Button type="submit" disabled={processing} className="h-10 px-4 text-xs uppercase tracking-wider">
                    <Icon name="add" size={16} className="text-gold" />
                    Simpan Foto
                </Button>
            </div>
        </form>
    );
}

function GalleryEditForm({ gallery, onDone }) {
    const { data, setData, put, processing, errors } = useForm({
        label: gallery.label || "",
        image_path: gallery.image_path || "",
        alt: gallery.alt || "",
        sort_order: gallery.sort_order ?? 0,
        is_active: gallery.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/galleries/${gallery.id}`, {
            preserveScroll: true,
            onSuccess: () => onDone(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-2.5 text-xs">
            <div>
                <label className="eyebrow block text-ink-mute">Label</label>
                <input
                    value={data.label}
                    onChange={(e) => setData("label", e.target.value)}
                    className="glass-input mt-0.5 h-9 w-full rounded-ios-sm px-2.5 text-xs text-ink"
                />
                {errors.label && <FieldErrorAdmin>{errors.label}</FieldErrorAdmin>}
            </div>

            <div>
                <label className="eyebrow block text-ink-mute">Path Gambar</label>
                <input
                    value={data.image_path}
                    onChange={(e) => setData("image_path", e.target.value)}
                    className="glass-input mt-0.5 h-9 w-full rounded-ios-sm px-2.5 text-xs text-ink"
                />
                {errors.image_path && <FieldErrorAdmin>{errors.image_path}</FieldErrorAdmin>}
            </div>

            <div>
                <label className="eyebrow block text-ink-mute">Alt</label>
                <input
                    value={data.alt}
                    onChange={(e) => setData("alt", e.target.value)}
                    className="glass-input mt-0.5 h-9 w-full rounded-ios-sm px-2.5 text-xs text-ink"
                />
            </div>

            <div className="flex justify-end gap-1.5 border-t border-hairline pt-2">
                <Button type="button" variant="secondary" onClick={onDone} className="h-8 px-3 text-[11px]">
                    Batal
                </Button>
                <Button type="submit" disabled={processing} className="h-8 px-3 text-[11px] uppercase">
                    Simpan
                </Button>
            </div>
        </form>
    );
}
