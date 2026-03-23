/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Check,
  Upload,
  AlertCircle,
  ChevronDown,
  Loader2,
  Trash2,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { backendAuthService } from "../../services/backendAuthService";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  id: string; // uuid from backend
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  discount: number;
  is_available: boolean;
  in_stock: boolean;
  is_chef_special: boolean;
  vendor_id: string;
}

type View = "empty" | "menu" | "add-meal";
type Category =
  | "All"
  | "Desert"
  | "Breakfast"
  | "Add ons"
  | "Rice"
  | "Meat"
  | "Drinks"
  | "Snacks"
  | "Vegan";

const CATEGORIES: Category[] = [
  "All",
  "Desert",
  "Breakfast",
  "Add ons",
  "Rice",
  "Meat",
  "Drinks",
  "Snacks",
  "Vegan",
];

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchMenuItems = (vendorId: string) =>
  api.get("/menu/", { params: { vendor_id: vendorId } });
const createMenuItem = (data: any) => api.post("/menu/", data);
const patchMenuItem = (itemId: string, data: any) =>
  api.put(`/menu/${itemId}`, data);
const removeMenuItem = (itemId: string) => api.delete(`/menu/${itemId}`);
const uploadMenuImage = (vendorId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`/menu/upload-image?vendor_id=${vendorId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── Component ─────────────────────────────────────────────────────────────────
const RestaurantMenu: React.FC = () => {
  const toast = useToast();

  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>("empty");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [mealName, setMealName] = useState("");
  const [mealPrice, setMealPrice] = useState("");
  const [mealCategory, setMealCategory] = useState("Desert");
  const [mealDescription, setMealDescription] = useState("");
  const [mealDiscount, setMealDiscount] = useState("0");
  const [inStock, setInStock] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChefSpecial, setIsChefSpecial] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // ── Init ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const user = await backendAuthService.getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const vId = user.vendor_id || user.id;
        if (!vId) {
          setLoading(false);
          return;
        }

        setVendorId(vId);

        const res = await fetchMenuItems(vId);
        const data: MenuItem[] = Array.isArray(res.data) ? res.data : [];
        setMenuItems(data);
        setCurrentView(data.length > 0 ? "menu" : "empty");
      } catch (e) {
        console.error("Error loading vendor data:", e);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    })();
  }, []);

  // ── Image select ─────────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Upload image to backend ───────────────────────────────────────────────────
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !vendorId) return imagePreview || null;
    setImageUploading(true);
    try {
      const res = await uploadMenuImage(vendorId, imageFile);
      const url = res.data?.url || res.data?.image_url || null;
      return url;
    } catch (e) {
      console.error("Image upload failed:", e);
      // Fall back to base64 preview if upload fails
      return imagePreview || null;
    } finally {
      setImageUploading(false);
    }
  };

  // ── Add / update meal ─────────────────────────────────────────────────────────
  const handleAddMeal = async () => {
    if (!vendorId) {
      toast.error("Vendor not found. Please log in again.");
      return;
    }
    if (!mealName.trim()) {
      toast.error("Please enter a meal name.");
      return;
    }
    if (!mealPrice || isNaN(parseFloat(mealPrice))) {
      toast.error("Please enter a valid price.");
      return;
    }
    if (!imagePreview && !editingItem?.image_url) {
      toast.error("Please upload a meal image.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload image if a new file was selected
      let finalImageUrl = editingItem?.image_url || "";
      if (imageFile) {
        const uploaded = await uploadImage();
        if (uploaded) finalImageUrl = uploaded;
      } else if (imagePreview && !imageFile) {
        // Editing but no new image selected — keep existing
        finalImageUrl = imagePreview;
      }

      // 2. Build payload matching backend schema exactly
      const payload = {
        vendor_id: vendorId,
        name: mealName.trim(),
        description: mealDescription.trim(),
        price: parseFloat(mealPrice),
        category: mealCategory,
        image_url: finalImageUrl,
        is_available: isAvailable,
        in_stock: inStock,
        is_chef_special: isChefSpecial,
        discount: parseInt(mealDiscount) || 0,
      };

      if (editingItem) {
        // PUT /api/menu/{item_id} — only updatable fields
        const updatePayload = {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          category: payload.category,
          image_url: payload.image_url,
          is_available: payload.is_available,
          discount: payload.discount,
        };
        await patchMenuItem(editingItem.id, updatePayload);
        setMenuItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id ? { ...i, ...updatePayload } : i,
          ),
        );
        toast.success("Meal updated successfully!");
      } else {
        const res = await createMenuItem(payload);
        const created: MenuItem = Array.isArray(res.data)
          ? res.data[0]
          : res.data;
        if (created) setMenuItems((prev) => [...prev, created]);
        toast.success("Meal added to your menu!");
      }

      resetForm();
      setCurrentView("menu");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail || "Failed to save meal. Please try again.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  // ── Delete meal ───────────────────────────────────────────────────────────────
  const handleRemove = async (id: string) => {
    setDeleteId(id);
    try {
      await removeMenuItem(id);
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Meal removed.");
    } catch {
      toast.error("Failed to remove meal.");
    } finally {
      setDeleteId(null);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────────
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setMealName(item.name);
    setMealPrice(item.price.toString());
    setMealCategory(item.category);
    setMealDescription(item.description);
    setImagePreview(item.image_url);
    setMealDiscount(item.discount?.toString() || "0");
    setInStock(item.in_stock ?? true);
    setIsAvailable(item.is_available ?? true);
    setIsChefSpecial(item.is_chef_special ?? false);
    setImageFile(null);
    setCurrentView("add-meal");
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setMealName("");
    setMealPrice("");
    setMealCategory("Desert");
    setMealDescription("");
    setEditingItem(null);
    setImagePreview("");
    setImageFile(null);
    setMealDiscount("0");
    setInStock(true);
    setIsAvailable(true);
    setIsChefSpecial(false);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchCat =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
            Loading menu...
          </p>
        </div>
      </div>
    );

  if (!vendorId)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold text-lg mb-2">
            Vendor not found
          </p>
          <p className="text-gray-500 text-sm">Please log in again</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <VendorNav />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                if (currentView === "add-meal") {
                  resetForm();
                  setCurrentView(menuItems.length > 0 ? "menu" : "empty");
                }
              }}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-lg font-bold tracking-tighter uppercase">
              {currentView === "add-meal"
                ? editingItem
                  ? "Edit Meal"
                  : "Add Meal"
                : "My Menu"}
            </h1>
            <button
              onClick={() => {
                resetForm();
                setCurrentView("add-meal");
              }}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ── EMPTY STATE ──────────────────────────────────────────────────── */}
      {currentView === "empty" && (
        <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center text-center">
          <div className="text-8xl mb-6 animate-bounce">📋</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3 uppercase tracking-tighter">
            No Menu Items Yet
          </h2>
          <p className="text-gray-400 mb-8 max-w-sm">
            Start building your menu by adding your first delicious meal.
          </p>
          <button
            onClick={() => setCurrentView("add-meal")}
            className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Your First Meal
          </button>
        </div>
      )}

      {/* ── MENU LIST ────────────────────────────────────────────────────── */}
      {currentView === "menu" && (
        <div
          className={`max-w-4xl mx-auto px-4 py-6 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm font-medium"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat === "All" && selectedCategory === cat && (
                  <Check className="inline w-3 h-3 mr-1" />
                )}
                {cat}
              </button>
            ))}
          </div>

          {/* Items */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <p className="font-bold uppercase tracking-widest">
                No items in this category
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-[2rem] shadow-xl border border-gray-50 hover:border-green-200 hover:shadow-2xl transition-all overflow-hidden ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${idx * 60}ms` }}
                >
                  <div className="flex gap-4 p-5">
                    {/* Image */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-green-50 shadow-inner">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-gray-800 uppercase tracking-tighter truncate">
                          {item.name}
                        </h3>
                        <span className="text-xs font-bold bg-green-50 text-green-600 px-2 py-1 rounded-lg flex-shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs font-medium mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-black text-green-600 text-lg">
                          ₦{item.price.toLocaleString()}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-xs font-bold bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
                            {item.discount}% off
                          </span>
                        )}
                        {!item.in_stock && (
                          <span className="text-xs font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 px-5 pb-5">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all active:scale-95 shadow-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={deleteId === item.id}
                      className="w-11 h-11 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
                    >
                      {deleteId === item.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADD / EDIT FORM ──────────────────────────────────────────────── */}
      {currentView === "add-meal" && (
        <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
          <div
            className={`space-y-5 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* Stock + availability toggles */}
            <div className="bg-white rounded-[2rem] shadow-xl p-6 flex flex-col gap-4">
              {[
                { label: "In Stock", val: inStock, set: setInStock },
                { label: "Available", val: isAvailable, set: setIsAvailable },
                {
                  label: "Chef's Special",
                  val: isChefSpecial,
                  set: setIsChefSpecial,
                },
              ].map((tog) => (
                <div
                  key={tog.label}
                  className="flex items-center justify-between"
                >
                  <span className="font-bold text-gray-700 uppercase tracking-wider text-sm">
                    {tog.label}
                  </span>
                  <button
                    onClick={() => tog.set(!tog.val)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${tog.val ? "bg-green-600" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${tog.val ? "translate-x-7" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Image upload */}
            <div className="bg-blue-50 rounded-[2rem] border-2 border-dashed border-blue-200 p-8 text-center">
              <input
                type="file"
                id="imageUpload"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-52 object-cover"
                  />
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setImagePreview("");
                      setImageFile(null);
                    }}
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-all"
                  >
                    ✕
                  </button>
                  {imageFile && (
                    <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      New image ready to upload
                    </div>
                  )}
                </div>
              ) : (
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer flex flex-col items-center group"
                >
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-green-600" />
                  </div>
                  <p className="font-bold text-green-600 uppercase tracking-tighter">
                    Upload Meal Image
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    JPEG, PNG, WebP — Max 5MB
                  </p>
                </label>
              )}
            </div>

            {/* Alert */}
            <div className="bg-amber-50 rounded-2xl p-4 flex items-start gap-3 border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 font-semibold text-sm">
                Please provide accurate information. This is shown to customers.
              </p>
            </div>

            {/* Form fields */}
            <input
              type="text"
              placeholder="Meal Name *"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-gray-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-gray-800 font-medium"
            />

            <input
              type="number"
              placeholder="Price (₦) *"
              value={mealPrice}
              onChange={(e) => setMealPrice(e.target.value)}
              min="0"
              className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-gray-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-gray-800 font-medium"
            />

            <div>
              <label className="block text-green-600 font-bold mb-2 text-xs uppercase tracking-widest">
                Discount (%)
              </label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={mealDiscount}
                onChange={(e) => setMealDiscount(e.target.value)}
                min="0"
                max="100"
                className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-gray-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-gray-800 font-medium"
              />
            </div>

            {/* Category select */}
            <div className="relative">
              <select
                value={mealCategory}
                onChange={(e) => setMealCategory(e.target.value)}
                className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-gray-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all appearance-none text-gray-800 font-bold"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <span className="absolute left-5 -top-2.5 bg-white px-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Category
              </span>
            </div>

            {/* Description */}
            <div>
              <label className="block text-green-600 font-bold mb-2 text-xs uppercase tracking-widest">
                Description
              </label>
              <textarea
                placeholder="Describe the meal..."
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                rows={4}
                className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-gray-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all resize-none text-gray-800 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sticky save bar — only on add-meal view */}
      {currentView === "add-meal" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-5 z-40">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleAddMeal}
              disabled={uploading || imageUploading}
              className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-base shadow-2xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {(uploading || imageUploading) && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              {uploading
                ? "Saving..."
                : editingItem
                  ? "Update Meal"
                  : "Add to Menu"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-15px) } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RestaurantMenu;
