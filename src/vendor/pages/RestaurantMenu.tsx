import { useState, useEffect } from "react";
import { addMenuItem, updateMenuItem, deleteMenuItem, getMenuItems, uploadMenuImage } from '../../services/api'
import {
  ArrowLeft,
  Search,
  Plus,
  Check,
  Upload,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { supabase } from "../../services/authService";

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

type View = "empty" | "menu" | "add-meal";
type Category = "All" | "Desert" | "Breakfast" | "Add ons";

const RestaurantMenu: React.FC = () => {
   const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>("empty");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [inStock, setInStock] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [mealName, setMealName] = useState("");
  const [mealPrice, setMealPrice] = useState("");
  const [priceDescription, setPriceDescription] = useState("");
  const [mealCategory, setMealCategory] = useState("Desert");
  const [mealDescription, setMealDescription] = useState("");
 const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const categories: Category[] = ["All", "Desert", "Breakfast", "Add ons"];

  const addOnItems = [
    { id: 1, name: "Chicken", image: "🍗" },
    { id: 2, name: "Burger", image: "🍔" },
    { id: 3, name: "Salad", image: "🥗" },
    { id: 4, name: "Fried Fish", image: "🐟" },
  ];

  

// Update the useEffect to get vendor ID first
  useEffect(() => {
    const initializeVendor = async () => {
      try {
        // Get current user from session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.error('No user session found');
          setLoading(false);
          return;
        }

        // Get vendor ID from vendors table
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (vendorError || !vendorData) {
          console.error('Vendor not found:', vendorError);
          setLoading(false);
          return;
        }

        setVendorId(vendorData.id);
        
        // Now load menu items with the vendor ID
        const { data, error } = await getMenuItems(vendorData.id);
        if (!error && data) {
          setMenuItems(data);
          setCurrentView(data.length > 0 ? 'menu' : 'empty');
        }
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };

    initializeVendor();
  }, []);

const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
const handleAddMeal = async () => {
    if (!vendorId) {
      alert('Vendor ID not found. Please log in again.');
      return;
    }
    
    setUploading(true);
    let imageUrl = '🍚'; // Default emoji
    
    // Upload image if selected
    if (selectedImage) {
      const { data, error } = await uploadMenuImage(selectedImage, vendorId);
      if (!error && data) {
        imageUrl = data;
      }
    }
    
    if (editingItem) {
      const { error } = await updateMenuItem(editingItem.id.toString(), {
        name: mealName,
        price: parseFloat(mealPrice),
        category: mealCategory,
        description: mealDescription,
        in_stock: inStock,
        image_url: imageUrl
      })
      if (!error) {
        setMenuItems(menuItems.map(item => 
          item.id === editingItem.id 
            ? { 
                ...item, 
                name: mealName, 
                price: parseFloat(mealPrice), 
                category: mealCategory, 
                description: mealDescription,
                image: imageUrl 
              }
            : item
        ))
      } else {
        console.error('Error updating item:', error);
        alert('Failed to update menu item');
      }
    } else {
      const { data, error } = await addMenuItem({
        vendor_id: vendorId,
        name: mealName,
        price: parseFloat(mealPrice),
        category: mealCategory,
        description: mealDescription,
        in_stock: inStock,
        image_url: imageUrl
      })
      if (!error && data) {
        setMenuItems([...menuItems, { ...data[0], image: imageUrl }])
      } else {
        console.error('Error adding item:', error);
        alert('Failed to add menu item');
      }
    }
    
    setUploading(false);
    resetForm();
    setCurrentView('menu');
  }



const resetForm = () => {
    setMealName("");
    setMealPrice("");
    setPriceDescription("");
    setMealCategory("Desert");
    setMealDescription("");
    setEditingItem(null);
    setSelectedImage(null);
    setImagePreview("");
  };

    const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setMealName(item.name);
    setMealPrice(item.price.toString());
    setMealCategory(item.category as string);
    setMealDescription(item.description);
    setImagePreview(item.image);
    setCurrentView("add-meal");
  };

const handleRemove = async (id: number) => {
  const { error } = await deleteMenuItem(id.toString())
  if (!error) {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }
}
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg mb-4">Vendor not found</p>
          <p className="text-gray-600">Please log in again</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <VendorNav />
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={() => {
                if (currentView === "add-meal") {
                  resetForm();
                  setCurrentView("menu");
                } else {
                  // Go back
                }
              }}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <h1 className="text-white text-lg sm:text-xl font-bold">Menu</h1>

            <button
              onClick={() => {
                resetForm();
                setCurrentView("add-meal");
              }}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {currentView === "empty" && (
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transform transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search through your menu"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-6 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat === "All" && <Check className="inline w-4 h-4 mr-1" />}
                {cat}
              </button>
            ))}
          </div>

          {/* Empty State Illustration */}
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="relative mb-8 animate-float">
              <div className="text-9xl">📋</div>
              <div className="absolute top-0 right-0 text-4xl animate-bounce">
                ✨
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 text-center">
              No Menu Items Yet
            </h2>
            <p className="text-gray-600 text-center mb-8 max-w-md">
              Start building your menu by adding delicious meals
            </p>
            <button
              onClick={() => setCurrentView("add-meal")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95"
            >
              <Plus className="inline w-5 h-5 mr-2" />
              Add Your First Meal
            </button>
          </div>
        </div>
      )}

      {/* Menu View with Items */}
      {currentView === "menu" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Search Bar */}
          <div
            className={`mb-6 transform transition-all duration-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search through your menu"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div
            className={`flex gap-3 mb-6 overflow-x-auto pb-2 transform transition-all duration-500 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-300 text-sm sm:text-base ${
                  selectedCategory === cat
                    ? "bg-green-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-50 hover:scale-105"
                }`}
              >
                {cat === "All" && selectedCategory === cat && (
                  <Check className="inline w-4 h-4 mr-1" />
                )}
                {cat}
              </button>
            ))}
          </div>

          {/* Add Ons Section */}
          {selectedCategory === "Add ons" && (
            <div className="mb-8 transform transition-all duration-500 delay-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Add Ons</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {addOnItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex-shrink-0 transform transition-all duration-500 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${300 + idx * 100}ms` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center text-4xl mb-2 hover:scale-110 transition-transform cursor-pointer">
                        {item.image}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex-shrink-0">
                  <div
                    onClick={() => setCurrentView("add-meal")}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg flex items-center justify-center mb-2 hover:scale-110 transition-transform border-2 border-dashed border-green-300">
                      <Plus className="w-8 h-8 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      Add
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items List */}
          <div className="space-y-4">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                } hover:-translate-y-1`}
                style={{ transitionDelay: `${300 + idx * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5">
                  {/* Item Image */}
                  <div className="w-full sm:w-24 h-40 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-5xl sm:flex-shrink-0 shadow-md">
                    {item.image}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 w-full sm:min-w-0 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-gray-800">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto sm:flex-shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 sm:flex-none bg-green-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-700 transition-all active:scale-95 shadow-md text-sm sm:text-base"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex-1 sm:flex-none bg-green-50 text-green-600 px-6 py-2 rounded-xl font-semibold hover:bg-green-100 transition-all active:scale-95 text-sm sm:text-base"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Meal Form */}
      {currentView === "add-meal" && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div
            className={`transform transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Stock Toggle */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 flex items-center justify-between">
              <span className="text-lg font-bold text-green-600">
                Currently In-Stock
              </span>
              <button
                onClick={() => setInStock(!inStock)}
                className={`w-16 h-8 rounded-full transition-all duration-300 relative ${
                  inStock ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md ${
                    inStock ? "left-9" : "left-1"
                  }`}
                ></div>
              </button>
            </div>

          {/* Upload Image */}
<div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-lg p-8 mb-6 text-center">
  <input
    type="file"
    id="imageUpload"
    accept="image/jpeg,image/jpg,image/png"
    onChange={handleImageSelect}
    className="hidden"
  />
  
  {imagePreview ? (
    <div className="relative">
      <img 
        src={imagePreview} 
        alt="Preview" 
        className="w-full h-48 object-cover rounded-2xl mb-4"
      />
      <button
        onClick={() => {
          setSelectedImage(null);
          setImagePreview("");
        }}
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
      >
        ✕
      </button>
    </div>
  ) : (
    <label htmlFor="imageUpload" className="cursor-pointer">
      <div className="w-24 h-24 mx-auto bg-white rounded-3xl flex items-center justify-center mb-4 shadow-md">
        <Upload className="w-12 h-12 text-green-600" />
      </div>
      <h3 className="text-green-600 font-bold text-lg mb-2">
        Upload Cover Image
      </h3>
      <p className="text-sm text-gray-600 mb-1">Allowed formats:</p>
      <p className="text-xs text-gray-500">• Jpeg • Jpg • Png</p>
      <p className="text-xs text-gray-500 mt-2">Less than 1mb</p>
    </label>
  )}
</div>

            {/* Info Alert */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 mb-6 flex items-start gap-3 border-2 border-amber-100">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 font-semibold text-sm sm:text-base">
                Please Kindly provide the correct info below
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Meal Name*"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none text-base"
              />

              <input
                type="number"
                placeholder="Enter Meal Price*"
                value={mealPrice}
                onChange={(e) => setMealPrice(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none text-base"
              />

              <input
                type="text"
                placeholder="Price Description | e.g per plate"
                value={priceDescription}
                onChange={(e) => setPriceDescription(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none text-base"
              />

              <div className="relative">
                <select
                  value={mealCategory}
                  onChange={(e) => setMealCategory(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none appearance-none text-base bg-white"
                >
                  <option value="Desert">Desert</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Add ons">Add ons</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <span className="absolute left-5 -top-2 bg-white px-2 text-xs text-gray-600">
                  Category -{" "}
                  <span className="text-green-600 font-semibold">
                    {mealCategory}
                  </span>
                </span>
              </div>

              <div>
                <label className="block text-green-600 font-bold mb-2 text-sm sm:text-base">
                  Meal Description
                </label>
                <textarea
                  placeholder="Kindly Provide details below"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  rows={4}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none resize-none text-base"
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
          {/* Submit Button */}
<button
  onClick={handleAddMeal}
  disabled={uploading}
  className={`w-full mt-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95 ${
    uploading ? 'opacity-50 cursor-not-allowed' : ''
  }`}
>
  {uploading ? 'Uploading...' : editingItem ? "Update meal" : "Add meal to menu"}
</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default RestaurantMenu;
