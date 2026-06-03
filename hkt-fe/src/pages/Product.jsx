// import { useState, useEffect, useMemo } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   Search,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Folder,
//   DollarSign,
//   Grid3x3,
//   List,
// } from "lucide-react";
// import ProductCard from "../components/ProductCard";
// import ChatBot from "../components/ChatBot";
// import Contact from "../components/Contact";
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const Product = () => {
//   const location = useLocation();
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [priceRange, setPriceRange] = useState([0, 2000000]);
//   const [showPriceRange, setShowPriceRange] = useState(false);
//   const [sortBy, setSortBy] = useState("default");
//   const [viewMode, setViewMode] = useState("grid");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [wishlistMap, setWishlistMap] = useState({});
//   const itemsPerPage = viewMode === "grid" ? 9 : 9; // Grid & List: 9 items/page
//
//   // Tính toán top 5 HOT và NEW products
//   const { hotProductIds, newProductIds } = useMemo(() => {
//     if (products.length === 0) return { hotProductIds: [], newProductIds: [] };
//
//     // Top 5 sản phẩm có soldQuantity cao nhất
//     const sortedBySold = [...products].sort(
//       (a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0),
//     );
//     const top5Hot = sortedBySold.slice(0, 5).map((p) => p.id);
//
//     // Top 5 sản phẩm có updatedAt gần nhất
//     const sortedByDate = [...products].sort(
//       (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
//     );
//     const top5New = sortedByDate.slice(0, 5).map((p) => p.id);
//
//     return {
//       hotProductIds: top5Hot,
//       newProductIds: top5New,
//     };
//   }, [products]);
//
//   // Read sort parameter from URL query on mount
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const sortParam = params.get("sort");
//     if (sortParam === "bestselling" || sortParam === "newest") {
//       setSortBy(sortParam);
//     }
//   }, [location.search]);
//
//   // Fetch products
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${BASE_URL}/products`);
//         if (response.ok) {
//           const data = await response.json();
//           setProducts(data.result || []);
//         }
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);
//
//   useEffect(() => {
//     if (!products.length || !localStorage.getItem("accessToken")) return;
//     const ids = products.map((p) => p.id).join(",");
//     fetch(
//       `${BASE_URL}/wishlists/products/in-wishlist-batch?productIds=${ids}`,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//       },
//     )
//       .then((r) => r.json())
//       .then((data) => setWishlistMap(data.result || data))
//       .catch(() => {});
//   }, [products]);
//
//   // Fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}/categories`);
//         if (response.ok) {
//           const data = await response.json();
//           setCategories(data.result || []);
//         }
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }
//     };
//     fetchCategories();
//   }, []);
//
//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCategory, sortBy, viewMode]);
//
//   // Filter & Sort
//   const processedProducts = useMemo(() => {
//     let filtered = [...products];
//
//     // Chỉ hiển thị sản phẩm có status ACTIVE
//     filtered = filtered.filter((p) => p.status === "ACTIVE");
//
//     if (searchTerm) {
//       filtered = filtered.filter((p) =>
//         p.name.toLowerCase().includes(searchTerm.toLowerCase()),
//       );
//     }
//
//     if (selectedCategory !== "all") {
//       const catId = parseInt(selectedCategory);
//       filtered = filtered.filter((p) => p.category?.id === catId);
//     }
//
//     filtered = filtered.filter(
//       (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
//     );
//
//     switch (sortBy) {
//       case "price-low":
//         filtered.sort((a, b) => a.price - b.price);
//         break;
//       case "price-high":
//         filtered.sort((a, b) => b.price - a.price);
//         break;
//       case "newest":
//         filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
//         break;
//       case "bestselling":
//         filtered.sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));
//         break;
//       default:
//         break;
//     }
//
//     return filtered;
//   }, [products, searchTerm, selectedCategory, priceRange, sortBy]);
//
//   // Pagination
//   const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
//   const paginatedProducts = processedProducts.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage,
//   );
//
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(price);
//   };
//
//   const sortOptions = [
//     { value: "default", label: "Default Order" },
//     { value: "price-low", label: "Price: Low to High" },
//     { value: "price-high", label: "Price: High to Low" },
//     { value: "newest", label: "Newest First" },
//     { value: "bestselling", label: "Best Selling" },
//   ];
//
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero Section */}
//       <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full filter blur-3xl animate-pulse"></div>
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
//         </div>
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
//           <div className="text-center mb-8">
//             <h1 className="text-5xl sm:text-5xl font-bold mb-4">
//               Discover <span className="text-red-500">Your Style</span> W/ Our
//               Products
//             </h1>
//             <p className="text-2xl text-gray-300 max-w-2xl mx-auto">
//               Explore our curated collection of the latest fashion trends
//             </p>
//           </div>
//           <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
//             <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20">
//               <div className="text-3xl font-bold mb-1">{products.length}+</div>
//               <div className="text-sm text-gray-300">Products</div>
//             </div>
//             <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20">
//               <div className="text-3xl font-bold mb-1">{categories.length}</div>
//               <div className="text-sm text-gray-300">Categories</div>
//             </div>
//             <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20">
//               <div className="text-3xl font-bold mb-1">100%</div>
//               <div className="text-sm text-gray-300">Quality</div>
//             </div>
//           </div>
//         </div>
//         <div className="relative w-full -mt-10">
//           <svg
//             viewBox="0 0 1440 120"
//             className="w-full h-20 sm:h-28 md:h-40"
//             preserveAspectRatio="none"
//           >
//             <path
//               fill="#f9fafb"
//               d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
//             ></path>
//           </svg>
//         </div>
//       </div>
//
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Sidebar: Categories */}
//           <aside className="lg:col-span-1">
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
//                 <Folder size={20} className="text-red-500" />
//                 Categories
//               </h3>
//               <ul className="space-y-1">
//                 <li>
//                   <button
//                     onClick={() => setSelectedCategory("all")}
//                     className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       selectedCategory === "all"
//                         ? "bg-red-500 text-white shadow-sm"
//                         : "hover:bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     All Products
//                   </button>
//                 </li>
//                 {categories.map((category) => (
//                   <li key={category.id}>
//                     <button
//                       onClick={() =>
//                         setSelectedCategory(category.id.toString())
//                       }
//                       className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
//                         selectedCategory === category.id.toString()
//                           ? "bg-red-500 text-white shadow-sm"
//                           : "hover:bg-gray-100 text-gray-700"
//                       }`}
//                     >
//                       {category.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//
//             {/* Price Range */}
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-6">
//               <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
//                 <DollarSign size={20} className="text-green-500" />
//                 Price Range
//               </h3>
//               <div className="space-y-4">
//                 <div className="text-center bg-gray-50 rounded-lg p-3">
//                   <div className="text-sm text-gray-600 mb-1">
//                     Selected Range
//                   </div>
//                   <div className="font-bold text-gray-900">
//                     {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
//                   </div>
//                 </div>
//                 <div className="space-y-3">
//                   <input
//                     type="range"
//                     min="0"
//                     max="2000000"
//                     step="50000"
//                     value={priceRange[0]}
//                     onChange={(e) =>
//                       setPriceRange([parseInt(e.target.value), priceRange[1]])
//                     }
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
//                   />
//                   <input
//                     type="range"
//                     min="0"
//                     max="2000000"
//                     step="50000"
//                     value={priceRange[1]}
//                     onChange={(e) =>
//                       setPriceRange([priceRange[0], parseInt(e.target.value)])
//                     }
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
//                   />
//                 </div>
//               </div>
//             </div>
//           </aside>
//
//           {/* Main Content */}
//           <main className="lg:col-span-3">
//             {/* Search + Sort + View Mode */}
//             <div className="bg-white rounded-xl shadow-md p-5 mb-6">
//               <div className="flex flex-col md:flex-row gap-4 items-center">
//                 {/* Search */}
//                 <div className="relative flex-1 w-full">
//                   <Search
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                     size={20}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Search products..."
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//
//                 {/* Sort Dropdown */}
//                 <div className="relative w-full md:w-64">
//                   <select
//                     className="appearance-none w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all cursor-pointer hover:border-gray-400"
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                   >
//                     {sortOptions.map((opt) => (
//                       <option key={opt.value} value={opt.value}>
//                         {opt.label}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
//                     <ChevronDown size={20} className="text-gray-500" />
//                   </div>
//                 </div>
//
//                 {/* View Mode Toggle */}
//                 <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
//                   <button
//                     onClick={() => setViewMode("grid")}
//                     className={`p-2.5 rounded-lg transition-all ${
//                       viewMode === "grid"
//                         ? "bg-white shadow-sm"
//                         : "hover:bg-gray-200"
//                     }`}
//                     title="Grid View"
//                   >
//                     <Grid3x3
//                       size={18}
//                       className={
//                         viewMode === "grid" ? "text-red-500" : "text-gray-600"
//                       }
//                     />
//                   </button>
//                   <button
//                     onClick={() => setViewMode("list")}
//                     className={`p-2.5 rounded-lg transition-all ${
//                       viewMode === "list"
//                         ? "bg-white shadow-sm"
//                         : "hover:bg-gray-200"
//                     }`}
//                     title="List View"
//                   >
//                     <List
//                       size={18}
//                       className={
//                         viewMode === "list" ? "text-red-500" : "text-gray-600"
//                       }
//                     />
//                   </button>
//                 </div>
//               </div>
//             </div>
//
//             {/* Results Count */}
//             <div className="flex justify-between items-center mb-6">
//               <p className="text-gray-600 font-medium">
//                 Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
//                 {Math.min(currentPage * itemsPerPage, processedProducts.length)}{" "}
//                 of {processedProducts.length} products
//               </p>
//               <p className="text-sm text-gray-500">
//                 View:{" "}
//                 <span className="font-semibold text-gray-700">
//                   {viewMode === "grid" ? "Grid" : "List"}
//                 </span>
//               </p>
//             </div>
//
//             {/* Loading */}
//             {loading && (
//               <div className="flex justify-center items-center h-64">
//                 <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
//               </div>
//             )}
//
//             {/* Product Display - Grid or List */}
//             {!loading && paginatedProducts.length > 0 && (
//               <>
//                 <div
//                   className={
//                     viewMode === "grid"
//                       ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
//                       : "flex flex-col gap-6"
//                   }
//                 >
//                   {paginatedProducts.map((product) => {
//                     const isHot = hotProductIds.includes(product.id);
//                     const isNew = newProductIds.includes(product.id);
//
//                     return (
//                       <ProductCard
//                         key={product.id}
//                         product={product}
//                         isHot={isHot}
//                         isNew={isNew && !isHot}
//                         viewMode={viewMode}
//                         isInWishlist={wishlistMap[product.id] ?? false}
//                         onWishlistChange={(id, status) =>
//                           setWishlistMap((prev) => ({ ...prev, [id]: status }))
//                         }
//                       />
//                     );
//                   })}
//                 </div>
//
//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="flex justify-center items-center gap-2 mt-12">
//                     <button
//                       onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                       disabled={currentPage === 1}
//                       className={`p-2.5 rounded-lg border transition-all ${
//                         currentPage === 1
//                           ? "text-gray-400 border-gray-300 cursor-not-allowed"
//                           : "text-gray-700 border-gray-300 hover:bg-gray-50 hover:shadow-sm"
//                       }`}
//                     >
//                       <ChevronLeft size={20} />
//                     </button>
//
//                     {[...Array(totalPages)].map((_, i) => (
//                       <button
//                         key={i + 1}
//                         onClick={() => setCurrentPage(i + 1)}
//                         className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
//                           currentPage === i + 1
//                             ? "bg-red-500 text-white shadow-md"
//                             : "bg-white text-gray-700 border hover:bg-gray-50 hover:shadow-sm"
//                         }`}
//                       >
//                         {i + 1}
//                       </button>
//                     ))}
//
//                     <button
//                       onClick={() =>
//                         setCurrentPage((p) => Math.min(totalPages, p + 1))
//                       }
//                       disabled={currentPage === totalPages}
//                       className={`p-2.5 rounded-lg border transition-all ${
//                         currentPage === totalPages
//                           ? "text-gray-400 border-gray-300 cursor-not-allowed"
//                           : "text-gray-700 border-gray-300 hover:bg-gray-50 hover:shadow-sm"
//                       }`}
//                     >
//                       <ChevronRight size={20} />
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}
//
//             {/* No Results */}
//             {!loading && processedProducts.length === 0 && (
//               <div className="text-center py-16">
//                 <div className="text-gray-400 mb-4">
//                   <Search size={64} className="mx-auto" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-700 mb-2">
//                   No products found
//                 </h3>
//                 <p className="text-gray-500">
//                   Try adjusting your filters or search terms
//                 </p>
//               </div>
//             )}
//           </main>
//         </div>
//         <ChatBot />
//         <Contact />
//       </div>
//     </div>
//   );
// };
//
// export default Product;
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Search, ChevronDown, ChevronLeft, ChevronRight,
    Grid3x3, List, SlidersHorizontal } from "lucide-react";
import ProductCard from "../components/ProductCard";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Product = () => {
    const location = useLocation();

    // ── State ──────────────────────────────────────────────
    const [products, setProducts]           = useState([]);
    const [categories, setCategories]       = useState([]);
    const [loading, setLoading]             = useState(true);
    const [searchTerm, setSearchTerm]       = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ FIX: debounced value
    const [selectedCategory, setSelectedCategory] = useState("");
    const [priceRange, setPriceRange]       = useState([0, 2000000]);
    const [sortBy, setSortBy]               = useState("default");
    const [viewMode, setViewMode]           = useState("grid");
    const [currentPage, setCurrentPage]     = useState(1);
    const [totalPages, setTotalPages]       = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [wishlistMap, setWishlistMap]     = useState({});
    const itemsPerPage = 9;

    // ── Đọc sort param từ URL ───────────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sortParam = params.get("sort");
        if (sortParam === "bestselling" || sortParam === "newest")
            setSortBy(sortParam);
    }, [location.search]);

    // ── FIX 1: Debounce search — cập nhật debouncedSearch sau 300ms ──
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // reset về trang 1 khi search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ── Fetch sản phẩm từ server (có filter + pagination) ───
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                const params = new URLSearchParams({
                    page:              currentPage,
                    size:              itemsPerPage,
                    search:            debouncedSearch, // ✅ FIX 1: dùng giá trị debounced
                    minPrice:          priceRange[0],
                    maxPrice:          priceRange[1],
                    sortBy,
                });
                if (selectedCategory) params.set("categoryId", selectedCategory);

                const response = await fetch(`${BASE_URL}/products/filter?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.result        || []);
                    setTotalPages(data.totalPages   ?? 1);
                    setTotalElements(data.totalElements ?? 0);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, selectedCategory, sortBy, priceRange, debouncedSearch]);
    // ✅ FIX 1: thêm debouncedSearch vào dependency array

    // Khi filter thay đổi → về trang 1
    useEffect(() => { setCurrentPage(1); },
        [selectedCategory, sortBy, priceRange]);

    // ── Wishlist ────────────────────────────────────────────
    useEffect(() => {
        if (!products.length || !localStorage.getItem("accessToken")) return;
        const ids = products.map((p) => p.id).join(",");
        fetch(`${BASE_URL}/wishlists/products/in-wishlist-batch?productIds=${ids}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        })
            .then((r) => r.json())
            .then((data) => setWishlistMap(data.result || data))
            .catch(() => {});
    }, [products]);

    // ── Fetch categories ────────────────────────────────────
    useEffect(() => {
        fetch(`${BASE_URL}/categories`)
            .then((r) => r.json())
            .then((data) => setCategories(data.result || []))
            .catch(console.error);
    }, []);

    // ── Hot / New badges ────────────────────────────────────
    const soldSorted = [...products].sort((a, b) =>
        (b.soldQuantity || 0) - (a.soldQuantity || 0));
    const hotProductIds = soldSorted.slice(0, 5).map((p) => p.id);

    const dateSorted = [...products].sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt));
    const newProductIds = dateSorted
        .slice(0, 5)
        .map((p) => p.id)
        .filter((id) => !hotProductIds.includes(id));

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

    const sortOptions = [
        { value: "default",     label: "Default Order" },
        { value: "price-low",   label: "Price: Low to High" },
        { value: "price-high",  label: "Price: High to Low" },
        { value: "newest",      label: "Newest First" },
        { value: "bestselling", label: "Best Selling" },
    ];

    return (
        <div className="min-h-screen bg-[#faf9f7] font-sans">

            {/* HERO */}
            <div className="bg-[#1a1a1a] text-[#faf9f7] py-20 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 flex justify-center items-center pointer-events-none">
                    <h1 className="text-[15vw] font-serif leading-none whitespace-nowrap">HKT STUDIO</h1>
                </div>
                <div className="relative max-w-7xl mx-auto text-center z-10">
                    <p className="text-[0.65rem] tracking-[0.3em] uppercase mb-4 text-[#888]">Spring / Summer Collection</p>
                    <h1 className="text-5xl md:text-7xl font-serif mb-8">The Collection</h1>
                    <div className="flex justify-center gap-12 text-center max-w-2xl mx-auto border-t border-[#333] pt-8">
                        <div>
                            <div className="text-2xl font-serif">{totalElements}</div>
                            <div className="text-[0.65rem] uppercase tracking-widest text-[#888] mt-1">Designs</div>
                        </div>
                        <div>
                            <div className="text-2xl font-serif">{categories.length}</div>
                            <div className="text-[0.65rem] uppercase tracking-widest text-[#888] mt-1">Categories</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* SIDEBAR */}
                    <aside className="lg:col-span-1 border-r border-[#e8e4df] pr-8 hidden lg:block">
                        <div className="mb-12">
                            <h3 className="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-[#1a1a1a] mb-6 border-b border-[#e8e4df] pb-3">Categories</h3>
                            <ul className="space-y-4">
                                <li>
                                    <button onClick={() => setSelectedCategory("")}
                                            className={`text-[0.75rem] uppercase tracking-widest transition-colors ${selectedCategory === "" ? "text-[#1a1a1a] font-bold" : "text-[#888] hover:text-[#1a1a1a]"}`}>
                                        All Collection
                                    </button>
                                </li>
                                {categories.map((cat) => (
                                    <li key={cat.id}>
                                        <button onClick={() => setSelectedCategory(cat.id.toString())}
                                                className={`text-[0.75rem] uppercase tracking-widest transition-colors ${selectedCategory === cat.id.toString() ? "text-[#1a1a1a] font-bold" : "text-[#888] hover:text-[#1a1a1a]"}`}>
                                            {cat.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-[#1a1a1a] mb-6 border-b border-[#e8e4df] pb-3 flex items-center gap-2">
                                <SlidersHorizontal size={14} /> Filter by Price
                            </h3>
                            <div className="space-y-6">
                                <div className="text-[0.7rem] tracking-widest text-[#1a1a1a] font-medium flex justify-between">
                                    <span>{formatPrice(priceRange[0])}</span>
                                    <span>{formatPrice(priceRange[1])}</span>
                                </div>
                                <div className="space-y-3">
                                    <input type="range" min="0" max="2000000" step="50000"
                                           value={priceRange[0]}
                                           onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                           className="w-full h-0.5 bg-[#e8e4df] appearance-none cursor-pointer accent-[#1a1a1a]" />
                                    <input type="range" min="0" max="2000000" step="50000"
                                           value={priceRange[1]}
                                           onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                           className="w-full h-0.5 bg-[#e8e4df] appearance-none cursor-pointer accent-[#1a1a1a]" />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN */}
                    <main className="lg:col-span-3">

                        {/* TOOLBAR */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10 pb-6 border-b border-[#e8e4df]">
                            <div className="relative w-full md:w-1/2">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#888]" size={16} />
                                <input type="text" placeholder="Search collection..."
                                       className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-[#e8e4df] focus:border-[#1a1a1a] outline-none text-sm text-[#1a1a1a] transition-colors"
                                       value={searchTerm}
                                       onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="relative w-full md:w-48">
                                    <select className="appearance-none w-full bg-transparent border-b border-[#e8e4df] py-2 text-[0.7rem] uppercase tracking-widest text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] cursor-pointer"
                                            value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        {sortOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#1a1a1a]" />
                                </div>
                                <div className="hidden md:flex gap-3">
                                    <button onClick={() => setViewMode("grid")} className={`transition-colors ${viewMode === "grid" ? "text-[#1a1a1a]" : "text-[#888] hover:text-[#1a1a1a]"}`}><Grid3x3 size={18} /></button>
                                    <button onClick={() => setViewMode("list")} className={`transition-colors ${viewMode === "list" ? "text-[#1a1a1a]" : "text-[#888] hover:text-[#1a1a1a]"}`}><List size={18} /></button>
                                </div>
                            </div>
                        </div>

                        {/* PRODUCTS */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className={viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12"
                                    : "flex flex-col gap-10"}>
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            isHot={hotProductIds.includes(product.id)}
                                            isNew={newProductIds.includes(product.id)}
                                            viewMode={viewMode}
                                            isInWishlist={wishlistMap[product.id] ?? false}
                                            onWishlistChange={(id, status) =>
                                                setWishlistMap((prev) => ({ ...prev, [id]: status }))}
                                        />
                                    ))}
                                </div>

                                {/* PAGINATION */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-16 pt-8 border-t border-[#e8e4df]">
                                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className={`p-2 transition-colors ${currentPage === 1 ? "text-[#e8e4df] cursor-not-allowed" : "text-[#1a1a1a] hover:text-[#888]"}`}>
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div className="flex gap-2">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                                                        className={`w-8 h-8 flex items-center justify-center text-[0.75rem] transition-colors ${currentPage === i + 1 ? "bg-[#1a1a1a] text-white" : "text-[#1a1a1a] hover:bg-[#e8e4df]"}`}>
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`p-2 transition-colors ${currentPage === totalPages ? "text-[#e8e4df] cursor-not-allowed" : "text-[#1a1a1a] hover:text-[#888]"}`}>
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-32">
                                <Search size={32} className="mx-auto text-[#e8e4df] mb-6" />
                                <h3 className="text-xl font-serif text-[#1a1a1a] mb-2">No designs found</h3>
                                <p className="text-[0.7rem] uppercase tracking-widest text-[#888]">Adjust your filters to discover more.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <ChatBot />
            <Contact />
        </div>
    );
};

export default Product;