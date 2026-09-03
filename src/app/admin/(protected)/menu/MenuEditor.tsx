"use client";

import { useRef, useState } from "react";
import { Category, Product } from "@/lib/types";
import {
  toggleSoldOut,
  toggleActive,
  updatePrice,
  createProduct,
  deleteProduct,
  uploadProductImage,
  removeProductImage
} from "@/lib/actions/menu";

export default function MenuEditor({
  categories,
  products
}: {
  categories: Category[];
  products: Product[];
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [localProducts, setLocalProducts] = useState(products);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNameTr, setNewNameTr] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const visible = localProducts.filter((p) => p.category_id === activeCategory);

  function patchLocal(id: string, patch: Partial<Product>) {
    setLocalProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function handleAdd() {
    if (!newNameTr.trim() || !newPrice.trim()) return;
    setAdding(true);
    const priceNum = parseFloat(newPrice);
    const result = await createProduct({
      categoryId: activeCategory,
      nameTr: newNameTr.trim(),
      nameEn: newNameEn.trim() || newNameTr.trim(),
      price: priceNum
    });
    setAdding(false);
    if (!("error" in result)) {
      setLocalProducts((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          category_id: activeCategory,
          name_tr: newNameTr.trim(),
          name_en: newNameEn.trim() || newNameTr.trim(),
          description_tr: "",
          description_en: "",
          price: priceNum,
          image_url: null,
          includes_fries: false,
          active: true,
          sold_out: false,
          sort_order: 999
        }
      ]);
      setNewNameTr("");
      setNewNameEn("");
      setNewPrice("");
      setShowAddForm(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `"${product.name_tr}" ürününü tamamen silmek istediğine emin misin? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;
    setLocalProducts((prev) => prev.filter((p) => p.id !== product.id));
    if (!product.id.startsWith("temp-")) {
      await deleteProduct(product.id);
    }
  }

  async function handleImagePick(product: Product, file: File) {
    if (product.id.startsWith("temp-")) {
      alert("Fotoğraf eklemeden önce sayfayı yenile, ürün henüz kaydediliyor.");
      return;
    }
    setUploadingId(product.id);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProductImage(product.id, formData);
    setUploadingId(null);
    if ("url" in result && result.url) {
      patchLocal(product.id, { image_url: result.url });
    } else {
      alert("Fotoğraf yüklenemedi, tekrar dene.");
    }
  }

  async function handleImageRemove(product: Product) {
    patchLocal(product.id, { image_url: null });
    if (!product.id.startsWith("temp-")) {
      await removeProductImage(product.id);
    }
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveCategory(c.id);
              setShowAddForm(false);
            }}
            className={`px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
              activeCategory === c.id ? "bg-wine text-white" : "bg-white text-ink/70"
            }`}
          >
            {c.name_tr}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowAddForm((v) => !v)}
        className="w-full mt-3 border-2 border-dashed border-wine/40 text-wine rounded-xl py-3 font-semibold text-sm"
      >
        {showAddForm ? "İptal" : "+ Yeni Ürün Ekle"}
      </button>

      {showAddForm && (
        <div className="bg-white rounded-xl p-3 shadow-sm mt-2 flex flex-col gap-2">
          <input
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
            placeholder="Türkçe isim (zorunlu)"
            value={newNameTr}
            onChange={(e) => setNewNameTr(e.target.value)}
          />
          <input
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
            placeholder="İngilizce isim (boş bırakılabilir)"
            value={newNameEn}
            onChange={(e) => setNewNameEn(e.target.value)}
          />
          <input
            type="number"
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
            placeholder="Fiyat (TL)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newNameTr.trim() || !newPrice.trim()}
            className="bg-wine text-white rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50"
          >
            {adding ? "Ekleniyor..." : "Ürünü Kaydet"}
          </button>
          <p className="text-xs text-ink/40 px-1">
            Ürünü kaydettikten sonra sayfayı yenileyip fotoğraf ekleyebilirsin.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-3">
        {visible.map((product) => (
          <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-start gap-3 mb-2">
              {product.image_url ? (
                <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-paper">
                  <img
                    src={product.image_url}
                    alt={product.name_tr}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 shrink-0 rounded-lg bg-paper flex items-center justify-center text-[10px] text-ink/30 text-center px-1">
                  Fotoğraf yok
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{product.name_tr}</p>
                <p className="text-xs text-ink/50">{product.name_en}</p>
                <div className="flex gap-2 mt-1.5">
                  <button
                    onClick={() => fileInputs.current[product.id]?.click()}
                    disabled={uploadingId === product.id}
                    className="text-xs font-semibold text-wine underline"
                  >
                    {uploadingId === product.id
                      ? "Yükleniyor..."
                      : product.image_url
                      ? "Fotoğrafı Değiştir"
                      : "Fotoğraf Ekle"}
                  </button>
                  {product.image_url && (
                    <button
                      onClick={() => handleImageRemove(product)}
                      className="text-xs font-semibold text-ink/40 underline"
                    >
                      Kaldır
                    </button>
                  )}
                  <input
                    ref={(el) => {
                      fileInputs.current[product.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImagePick(product, file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                defaultValue={product.price}
                className="w-24 rounded-lg border border-black/10 px-2 py-1.5 text-sm"
                onBlur={async (e) => {
                  const newPriceVal = parseFloat(e.target.value);
                  if (!Number.isNaN(newPriceVal) && newPriceVal !== product.price) {
                    patchLocal(product.id, { price: newPriceVal });
                    if (!product.id.startsWith("temp-")) {
                      await updatePrice(product.id, newPriceVal);
                    }
                  }
                }}
              />
              <span className="text-sm text-ink/50">TL</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const next = !product.sold_out;
                  patchLocal(product.id, { sold_out: next });
                  if (!product.id.startsWith("temp-")) await toggleSoldOut(product.id, next);
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                  product.sold_out ? "bg-wine text-white" : "bg-paper text-ink/70"
                }`}
              >
                {product.sold_out ? "Tükendi ✓" : "Tükendi olarak işaretle"}
              </button>
              <button
                onClick={async () => {
                  const next = !product.active;
                  patchLocal(product.id, { active: next });
                  if (!product.id.startsWith("temp-")) await toggleActive(product.id, next);
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                  product.active ? "bg-paper text-ink/70" : "bg-ink text-white"
                }`}
              >
                {product.active ? "Menüde Göster" : "Gizli"}
              </button>
            </div>
            <button
              onClick={() => handleDelete(product)}
              className="w-full mt-2 text-xs font-semibold text-wine/80 py-1.5"
            >
              Ürünü Tamamen Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
