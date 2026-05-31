// import { useState, useEffect, useRef } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Star,
//   ShoppingCart,
//   CreditCard,
//   X,
//   ZoomIn,
//   Minus,
//   Plus,
//   GitCompare,
//   ShoppingBag,
// } from "lucide-react";
// import ProductCard from "../components/ProductCard";
// import { toast } from "sonner";
// import ChatBot from "../components/ChatBot";
// import Contact from "../components/Contact";
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// // --- GLOBAL UTILS FOR COMPARE LIST ---
// const getCompareList = () => {
//   const list = localStorage.getItem("compareList");
//   return list ? JSON.parse(list) : [];
// };
//
// const setCompareList = (list) => {
//   localStorage.setItem("compareList", JSON.stringify(list));
// };
// // ------------------------------------
//
// // --- COMPARISON BAR COMPONENT ---
// // Component hiển thị thanh so sánh cố định ở cuối trang
// const CompareBar = ({ compareList, setCompareListState, formatPrice }) => {
//   if (compareList.length === 0) return null;
//
//   // Hàm loại bỏ sản phẩm khỏi danh sách
//   const handleRemoveProduct = (productId, productName) => {
//     const newList = compareList.filter((p) => p.id !== productId);
//     setCompareList(newList); // Cập nhật localStorage
//     setCompareListState(newList); // Cập nhật state
//     toast.info(`${productName} removed from Compare List.`);
//   };
//
//   // Tạo URL cho trang so sánh
//   const compareUrl = `/compare?ids=${compareList.map((p) => p.id).join(",")}`;
//
//   return (
//     <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 p-4 transition-transform duration-300 ease-in-out">
//       <div className="max-w-7xl mx-auto flex items-center justify-between">
//         {/* LEFT: Product List */}
//         <div className="flex items-center space-x-4 overflow-x-auto p-2">
//           {compareList.map((p) => (
//             <div
//               key={p.id}
//               className="relative flex-shrink-0 w-32 bg-gray-50 p-2 rounded-lg border border-gray-200"
//             >
//               {/* Product Image and Name */}
//               <Link
//                 to={`/product/${p.id}`}
//                 className="block text-center hover:opacity-80 transition-opacity"
//               >
//                 <img
//                   src={p.imageUrl}
//                   alt={p.name}
//                   className="w-full h-20 object-contain mx-auto mb-1 rounded"
//                 />
//                 <p className="text-xs font-medium truncate">{p.name}</p>
//                 <p className="text-sm font-bold text-red-500">
//                   {formatPrice(p.discount_amount || p.price)}
//                 </p>
//               </Link>
//
//               {/* Remove Button */}
//               <button
//                 onClick={() => handleRemoveProduct(p.id, p.name)}
//                 className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition"
//               >
//                 <X size={14} />
//               </button>
//             </div>
//           ))}
//
//           {/* Placeholders for remaining slots */}
//           {Array(4 - compareList.length)
//             .fill(0)
//             .map((_, index) => (
//               <div
//                 key={`placeholder-${index}`}
//                 className="flex-shrink-0 w-32 h-36 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm p-2"
//               >
//                 <Plus size={20} className="mb-1" />
//                 Add product
//               </div>
//             ))}
//         </div>
//
//         {/* RIGHT: Status and Action Button */}
//         <div className="flex-shrink-0 ml-4 space-y-2 text-center">
//           <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
//             {compareList.length} / 4 Products selected
//           </p>
//           <p className="text-xs text-gray-500 italic">
//             Select 2-4 products to compare
//           </p>
//           <Link
//             to={compareUrl}
//             onClick={() => {
//               if (compareList.length < 2) {
//                 toast.warning("Please select at least 2 products to compare.");
//                 return false; // Ngăn chặn điều hướng nếu < 2
//               }
//             }}
//             className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all ${
//               compareList.length >= 2
//                 ? "bg-green-600 hover:bg-green-700 shadow-md"
//                 : "bg-gray-400 cursor-not-allowed"
//             }`}
//             style={{ pointerEvents: compareList.length >= 2 ? "auto" : "none" }}
//           >
//             <GitCompare size={20} /> Compare ({compareList.length})
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };
// // ------------------------------------
//
// const ProductDetail = () => {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [otherProducts, setOtherProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedSize, setSelectedSize] = useState(null);
//   const [quantity, setQuantity] = useState(1);
//   const [isAddedToCart, setIsAddedToCart] = useState(false);
//   const [currentImage, setCurrentImage] = useState("front");
//   const [zoomImage, setZoomImage] = useState(null);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [relatedWishlistMap, setRelatedWishlistMap] = useState({});
//   const imageRef = useRef(null);
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });
//   const [cart, setCart] = useState(null);
//   const navigate = useNavigate();
//
//   const [compareList, setCompareListState] = useState(getCompareList());
//
//   const fetchUser = async () => {
//     try {
//       const token = localStorage.getItem("accessToken");
//
//       const res = await fetch(`${BASE_URL}/accounts/myinfor`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       console.log("Tài khoản đang login: ", data.result);
//       setUser(data.result);
//     } catch (error) {
//       console.error("Lỗi fetch user", error);
//     }
//   };
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [id]);
//
//   useEffect(() => {
//     fetchUser();
//   }, []);
//
//   const fetchCart = async () => {
//     try {
//       const token = localStorage.getItem("accessToken");
//       const res = await fetch(`${BASE_URL}/carts/account/${user.id}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       console.log("Cart của user: ", data.result);
//       setCart(data.result);
//     } catch (error) {
//       console.error("Lỗi fetch cart: ", error);
//     }
//   };
//
//   useEffect(() => {
//     if (user?.id) {
//       fetchCart();
//     }
//   }, [user]);
//
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${BASE_URL}/products/${id}`);
//         if (response.ok) {
//           const data = await response.json();
//           // Dữ liệu SoldQuantity được lấy trực tiếp từ data.result (ProductResponse)
//           setProduct(data.result || null);
//         } else {
//           setError("Product not found");
//         }
//       } catch (error) {
//         console.error("Error fetching product:", error);
//         setError("Failed to load product");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProduct();
//   }, [id]);
//
//   useEffect(() => {
//     const fetchOtherProducts = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}/products`);
//         if (response.ok) {
//           const data = await response.json();
//           let products = data.result || [];
//
//           products.sort(
//             (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
//           );
//           products = products
//             .filter((p) => p.id !== parseInt(id) && p.status === "ACTIVE")
//             .slice(0, 4);
//
//           setOtherProducts(products);
//         }
//       } catch (error) {
//         console.error("Error fetching other products:", error);
//       }
//     };
//     fetchOtherProducts();
//   }, [id]);
//
//   useEffect(() => {
//     if (!otherProducts.length || !localStorage.getItem("accessToken")) return;
//     const ids = otherProducts.map((p) => p.id).join(",");
//     fetch(
//       `${BASE_URL}/wishlists/products/in-wishlist-batch?productIds=${ids}`,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//       },
//     )
//       .then((r) => r.json())
//       .then((data) => setRelatedWishlistMap(data.result || data))
//       .catch(() => {});
//   }, [otherProducts]);
//
//   const formatPrice = (price) => {
//     // Đảm bảo giá là một số hợp lệ
//     const numericPrice =
//       typeof price === "number" && isFinite(price) ? price : 0;
//
//     return new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(numericPrice);
//   };
//
//   const handleAddToCart = async () => {
//     // BỔ SUNG: Kiểm tra Sold Out
//     if (isSoldOut) {
//       return toast.error("This product is currently sold out.");
//     }
//
//     // Kiểm tra xem có size nào khả dụng không
//     const hasSizes = uniqueSizes.length > 0;
//
//     if (hasSizes && !selectedSize) {
//       return toast.warning("Please select a size");
//     }
//
//     // if (!user?.id) {
//     //   toast.warning("Vui lòng đăng nhập trước khi thêm vào giỏ hàng");
//     //   return toast.warning("Please Log in before add to cart");
//     // }
//
//     // XỬ LÝ CHO KHÁCH VÃNG LAI (GUEST)
//     if (!user?.id || !localStorage.getItem("accessToken")) {
//       // Tìm sizeDetailId từ dữ liệu product đã load sẵn để lưu lại dùng cho lúc Merge
//       let sizeDetailIdForGuest = null;
//       if (hasSizes && selectedSize) {
//         const foundSize = product.sizeDetails.find(
//           (sd) =>
//             sd.sizeName === selectedSize || sd.size?.nameSize === selectedSize,
//         );
//         if (foundSize) sizeDetailIdForGuest = foundSize.id;
//       }
//       const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
//       const newItem = {
//         id: `guest_${Date.now()}`, // Tạo ID tạm thời
//         productId: parseInt(id),
//         productName: product.name,
//         productImage: product.imageUrlFront,
//         sizeName: selectedSize,
//         sizeDetailId: sizeDetailIdForGuest,
//         quantity: quantity,
//         stock: currentStock, // THÊM DÒNG NÀY ĐỂ LƯU TỒN KHO THỰC TẾ
//         priceAtTime: product.costPrice,
//         subtotal: product.costPrice * quantity,
//         selected: true, // Khách thêm vào là mặc định tick chọn luôn
//       };
//       // Kiểm tra xem sản phẩm & size này đã có trong giỏ guest chưa
//       const existingIndex = guestCart.findIndex(
//         (item) =>
//           item.productId === newItem.productId &&
//           item.sizeName === newItem.sizeName,
//       );
//
//       if (existingIndex !== -1) {
//         guestCart[existingIndex].quantity += quantity;
//         guestCart[existingIndex].subtotal =
//           guestCart[existingIndex].quantity *
//           guestCart[existingIndex].priceAtTime;
//       } else {
//         guestCart.push(newItem);
//       }
//
//       localStorage.setItem("guestCart", JSON.stringify(guestCart));
//       setIsAddedToCart(true);
//       toast.success("Added items to Guest Cart!");
//       setTimeout(() => setIsAddedToCart(false), 2000);
//       window.dispatchEvent(new Event("cartUpdated"));
//       return; // Kết thúc sớm, không chạy xuống code gọi API bên dưới
//     }
//
//     if (quantity < 1) return toast.warning("Quantity must be at least 1");
//
//     setIsAddedToCart(true);
//     toast.success("Added items, check your Cart!");
//     setTimeout(() => setIsAddedToCart(false), 2000);
//
//     try {
//       const token = localStorage.getItem("accessToken");
//
//       // Lấy sizeDetailId dựa trên selectedSize (sizeName)
//       let sizeDetailId = null;
//       if (hasSizes && selectedSize) {
//         // Tìm sizeDetail có sizeName trùng với selectedSize
//         const sizeDetail = uniqueSizes.find(
//           (size) => size.sizeName === selectedSize,
//         );
//         // Lưu ý: uniqueSizes đã được gộp quantity, sizeDetailId là id của 1 trong các sizeDetails
//         // Giả định backend có thể xử lý việc này nếu chỉ gửi sizeName hoặc productId + sizeName
//         // Nếu backend yêu cầu sizeDetailId cụ thể, cần fetch size detail dựa trên productId và sizeName
//
//         // **GIẢI QUYẾT CONFLICT:** Giữ lại logic tìm sizeDetailId chi tiết từ nhánh khác
//         const resSize = await fetch(
//           `${BASE_URL}/sizes/${selectedSize}`, // Giả định selectedSize là tên (S, M, L, XL)
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );
//         const size = await resSize.json();
//         const sizeIdToFind = size.id;
//         const productIdToFind = parseInt(id);
//         const resSizeDatail = await fetch(
//           `${BASE_URL}/size-details/find?productId=${productIdToFind}&sizeId=${sizeIdToFind}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );
//         const sizeDetailResponse = await resSizeDatail.json();
//         sizeDetailId = sizeDetailResponse.id; // Lấy sizeDetailId
//       }
//
//       const dataSend = {
//         productId: parseInt(id),
//         cartId: cart.id,
//         quantity: quantity,
//         // Chỉ thêm sizeDetailId nếu có size được chọn. Nếu không cần, backend sẽ tự xác định.
//         // Cần đảm bảo backend xử lý được cả 2 trường hợp (có sizeDetailId hoặc không)
//         ...(sizeDetailId && { sizeDetailId: sizeDetailId }),
//       };
//
//       const res = await fetch(`${BASE_URL}/cart-details/add-to-cart`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(dataSend),
//       });
//
//       // **GIẢI QUYẾT CONFLICT:** Giữ lại logic cập nhật cart totalAmount
//       const cartRequest = {
//         quantity: parseInt(quantity),
//         totalAmount: product.costPrice, // Dùng costPrice (giá sale)
//       };
//
//       const resCart = await fetch(`${BASE_URL}/carts/update/${cart.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(cartRequest),
//       });
//       if (resCart.ok) {
//         // Kích hoạt sự kiện để thông báo cập nhật giỏ hàng (ví dụ cho header cart icon)
//         window.dispatchEvent(new Event("cartUpdated"));
//       }
//     } catch (error) {
//       console.log("Lỗi thêm vào cart: ", error);
//       toast.error("Failed to add to cart.");
//     }
//   };
//
//   const handleBuyNow = async () => {
//     if (isSoldOut) {
//       return toast.error("This product is currently sold out.");
//     }
//
//     const hasSizes = uniqueSizes.length > 0;
//     if (hasSizes && !selectedSize) {
//       return toast.warning("Please select a size");
//     }
//     if (quantity < 1) return toast.warning("Quantity must be at least 1");
//
//     let sizeDetailId = null;
//
//     try {
//       const token = localStorage.getItem("accessToken");
//
//       if (hasSizes && selectedSize) {
//         const resSize = await fetch(`${BASE_URL}/sizes/${selectedSize}`, {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const size = await resSize.json();
//
//         const resSizeDetail = await fetch(
//           `${BASE_URL}/size-details/find?productId=${id}&sizeId=${size.id}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );
//         const sizeDetail = await resSizeDetail.json();
//         sizeDetailId = sizeDetail.id;
//       }
//
//       navigate("/checkout", {
//         state: {
//           userId: user.id,
//           product: product,
//           quantity: quantity,
//           sizeDetailId: sizeDetailId,
//         },
//       });
//     } catch (error) {
//       console.error("Lỗi khi lấy size detail: ", error);
//       toast.error("Failed to process. Please try again.");
//     }
//   };
//
//   const handleZoom = (imageType) => {
//     setZoomImage(
//       imageType === "front" ? product.imageUrlFront : product.imageUrlBack,
//     );
//     setZoomLevel(1);
//     setPosition({ x: 0, y: 0 });
//   };
//
//   // const changeQuantity = (delta) => {
//   //   setQuantity((prev) => Math.max(1, prev + delta));
//   // };
//   const changeQuantity = (delta) => {
//     setQuantity((prev) => {
//       const newQuantity = prev + delta;
//       // Không cho giảm dưới 1 và không cho tăng quá currentStock
//       if (newQuantity < 1) return 1;
//       if (newQuantity > currentStock) {
//         toast.warning(`Only ${currentStock} items available in stock!`);
//         return prev; // Giữ nguyên số lượng cũ
//       }
//       return newQuantity;
//     });
//   };
//   // Hàm xử lý khi người dùng gõ vào input
//   const handleQuantityChange = (e) => {
//     const val = e.target.value;
//
//     // Cho phép input rỗng (khi user nhấn nút Backspace để xóa đi nhập lại)
//     if (val === "") {
//       setQuantity("");
//       return;
//     }
//
//     const num = parseInt(val, 10);
//
//     // Bỏ qua nếu nhập ký tự không phải là số
//     if (isNaN(num)) return;
//
//     // Tính toán tồn kho của size đang chọn (từ logic chúng ta đã bàn ở phần trước)
//     const currentStock = selectedSize
//       ? uniqueSizes.find((size) => size.sizeName === selectedSize)?.quantity ||
//         0
//       : totalStock;
//
//     // Kiểm tra giới hạn tồn kho
//     if (num > currentStock) {
//       toast.warning(`Only ${currentStock} items available in stock!`);
//       setQuantity(currentStock); // Ép về số lượng tối đa
//     } else {
//       setQuantity(num);
//     }
//   };
//
//   // Hàm xử lý khi người dùng click ra ngoài (onBlur)
//   const handleQuantityBlur = () => {
//     // Nếu user bỏ trống hoặc nhập số nhỏ hơn 1 thì reset về 1
//     if (quantity === "" || quantity < 1) {
//       setQuantity(1);
//     }
//   };
//   // Hàm xử lý khi người dùng đổi Size
//   const handleSizeSelect = (newSizeName) => {
//     setSelectedSize(newSizeName); // Cập nhật size mới
//
//     // Tìm số lượng tồn kho của size vừa chọn
//     const newSizeStock =
//       uniqueSizes.find((size) => size.sizeName === newSizeName)?.quantity || 0;
//
//     // Nếu số lượng user đang chọn lớn hơn tồn kho của size mới
//     if (quantity > newSizeStock && newSizeStock > 0) {
//       setQuantity(newSizeStock); // Tự động kéo tụt quantity xuống bằng max tồn kho của size mới
//       toast.info(
//         `Adjusted quantity to ${newSizeStock} due to stock limits of Size ${newSizeName}.`,
//       );
//     } else if (newSizeStock <= 0) {
//       setQuantity(1); // Reset an toàn nếu rủi ro chọn trúng size hết hàng
//     }
//   };
//
//   const handleWheel = (e) => {
//     e.preventDefault();
//     const delta = e.deltaY * -0.01;
//     setZoomLevel((prev) => Math.max(1, Math.min(prev + delta, 5)));
//   };
//
//   const handleMouseDown = (e) => {
//     e.preventDefault();
//     const startX = e.clientX - position.x;
//     const startY = e.clientY - position.y;
//
//     const handleMouseMove = (moveE) => {
//       setPosition({
//         x: moveE.clientX - startX,
//         y: moveE.clientY - startY,
//       });
//     };
//
//     const handleMouseUp = () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//     };
//
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", handleMouseUp);
//   };
//
//   const handleCompare = () => {
//     // Đảm bảo product đã load xong
//     if (!product) return;
//
//     const currentProductInList = compareList.find((p) => p.id === product.id);
//     const newProductData = {
//       id: product.id,
//       name: product.name,
//       price: product.price,
//       discount_amount: product.costPrice, // Sử dụng costPrice là giá đã giảm (sale price)
//       imageUrl: product.imageUrlFront, // Lấy ảnh front để hiển thị
//     };
//
//     if (currentProductInList) {
//       // Nếu đã có trong danh sách -> Xóa (Toggle off)
//       const newList = compareList.filter((p) => p.id !== product.id);
//       setCompareList(newList);
//       setCompareListState(newList);
//       toast.info(`${product.name} removed from Compare List.`);
//     } else {
//       // Nếu chưa có trong danh sách -> Thêm vào (Toggle on)
//       if (compareList.length < 4) {
//         const newList = [...compareList, newProductData];
//         setCompareList(newList);
//         setCompareListState(newList);
//         toast.success(
//           `${product.name} added to Compare List (${newList.length}/4).`,
//         );
//       } else {
//         toast.error("Maximum 4 products allowed for comparison.");
//       }
//     }
//   };
//
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
//       </div>
//     );
//   }
//
//   if (error || !product) {
//     return (
//       <div className="text-center py-16">
//         <h3 className="text-2xl font-bold text-gray-700 mb-2">
//           {error || "Product not found"}
//         </h3>
//         <Link to="/product" className="text-red-500 hover:underline">
//           Back to Products
//         </Link>
//       </div>
//     );
//   }
//
//   const uniqueSizes = [];
//   const sizeMap = new Map();
//
//   product.sizeDetails?.forEach((size) => {
//     if (sizeMap.has(size.sizeName)) {
//       const existing = sizeMap.get(size.sizeName);
//       existing.quantity += size.quantity;
//     } else {
//       sizeMap.set(size.sizeName, { ...size });
//     }
//   });
//
//   sizeMap.forEach((value) => uniqueSizes.push(value));
//   uniqueSizes.sort((a, b) => {
//     const order = ["S", "M", "L", "XL"];
//     return order.indexOf(a.sizeName) - order.indexOf(b.sizeName);
//   });
//
//   // LOGIC SOLD OUT: Tính tổng tồn kho và xác định Sold Out
//   const totalStock = uniqueSizes.reduce((sum, size) => sum + size.quantity, 0);
//   const isSoldOut = totalStock === 0;
//   // THÊM ĐOẠN NÀY: Lấy tồn kho của size đang chọn, nếu chưa chọn size thì hiện tổng tồn kho
//   const currentStock = selectedSize
//     ? uniqueSizes.find((size) => size.sizeName === selectedSize)?.quantity || 0
//     : totalStock;
//   const isComparing = compareList.some((p) => p.id === product.id);
//
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* IMAGE SECTION */}
//           <div className="bg-white rounded-xl shadow-md p-6 relative">
//             <div className="relative group">
//               {/* BỔ SUNG: Tag Sold Out */}
//               {isSoldOut && (
//                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
//                   <div className="bg-red-600 text-white px-8 py-3 rounded-full text-xl font-bold tracking-wider shadow-2xl border-4 border-white transform -rotate-12 opacity-90">
//                     SOLD OUT
//                   </div>
//                 </div>
//               )}
//
//               <div className="flex justify-center mt-4 gap-2">
//                 <button
//                   onClick={() => setCurrentImage("front")}
//                   className={`px-4 py-2 rounded-full text-sm font-medium ${
//                     currentImage === "front"
//                       ? "bg-red-500 text-white"
//                       : "bg-white text-gray-700"
//                   }`}
//                 >
//                   Front
//                 </button>
//                 <button
//                   onClick={() => setCurrentImage("back")}
//                   className={`px-4 py-2 rounded-full text-sm font-medium ${
//                     currentImage === "back"
//                       ? "bg-red-500 text-white"
//                       : "bg-white text-gray-700"
//                   }`}
//                 >
//                   Back
//                 </button>
//               </div>
//
//               {/* COMPARE BUTTON */}
//               <button
//                 onClick={handleCompare}
//                 className={`absolute top-0 left-0 flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all z-10 ${
//                   isComparing
//                     ? "bg-red-500 text-white shadow-lg"
//                     : "bg-black text-white border border-white"
//                 }`}
//               >
//                 <GitCompare size={16} />{" "}
//                 {isComparing ? "Comparing" : "Add to Compare"}
//               </button>
//               {/* END COMPARE BUTTON */}
//
//               <img
//                 src={
//                   currentImage === "front"
//                     ? product.imageUrlFront
//                     : product.imageUrlBack
//                 }
//                 alt={product.name}
//                 className="w-140 h-140 rounded-lg object-cover cursor-pointer"
//                 onClick={() => handleZoom(currentImage)}
//               />
//
//               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                 <ZoomIn size={24} className="text-gray-600" />
//               </div>
//             </div>
//           </div>
//
//           {/* DETAILS */}
//           <div className="bg-white rounded-xl shadow-md p-6">
//             <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
//             {/* PRICE SECTION */}
//             <div className="flex items-center gap-3 mb-4">
//               {/* Giá sale (Giá sau khi giảm) */}
//               <span className="text-3xl font-bold text-red-500">
//                 {formatPrice(product.costPrice)}
//               </span>
//               {!isSoldOut && product.discountAmount > 0 && (
//                 <p className="text-sm text-gray-400 line-through">
//                   {formatPrice(product.price)}
//                 </p>
//               )}
//             </div>
//             <div className="flex items-center gap-2 mb-6 text-gray-600">
//               <ShoppingBag size={20} className="text-red-500" />
//               <span className="font-semibold">Sold:</span>
//               <span className="font-bold text-red-600">
//                 {(product.soldQuantity || 0).toLocaleString("en-US")} products
//               </span>
//             </div>
//             <div className="flex items-center mb-4">
//               <Star className="text-yellow-400" size={20} />
//               <span className="ml-1 font-medium">
//                 {product.rating || "N/A"}
//               </span>
//             </div>
//             {/* SIZE SELECT */}
//             <div className="mb-6">
//               <h3 className="font-bold text-lg mb-2">Select Size</h3>
//               <div className="flex gap-2 flex-wrap">
//                 {uniqueSizes.map((size) => (
//                   <button
//                     // key={size.sizeName}
//                     // onClick={() => setSelectedSize(size.sizeName)}
//                     // disabled={size.quantity <= 0}
//                     // className={`px-4 py-2 rounded-lg border ${
//                     //   selectedSize === size.sizeName
//                     //     ? "bg-red-500 text-white border-red-500"
//                     //     : "border-gray-300 hover:bg-gray-100"
//                     // } ${
//                     //   size.quantity <= 0 ? "opacity-50 cursor-not-allowed" : ""
//                     // }`}
//
//                     key={size.sizeName}
//                     onClick={() => handleSizeSelect(size.sizeName)}
//                     disabled={size.quantity <= 0}
//                     className={`px-4 py-2 rounded-lg border ${
//                       selectedSize === size.sizeName
//                         ? "bg-red-500 text-white border-red-500"
//                         : "border-gray-300 hover:bg-gray-100"
//                     } ${
//                       size.quantity <= 0 ? "opacity-50 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     {size.sizeName}
//                   </button>
//                 ))}
//                 {uniqueSizes.length === 0 && <p>No sizes available</p>}
//               </div>
//             </div>
//             {/* QUANTITY */}
//             <div className="mb-6">
//               <h3 className="font-bold text-lg mb-2">Quantity</h3>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => changeQuantity(-1)}
//                   disabled={isSoldOut} // Disable quantity change if sold out
//                   className={`p-2 border border-gray-300 rounded-lg ${
//                     isSoldOut ? "opacity-50" : "hover:bg-gray-100"
//                   }`}
//                 >
//                   <Minus size={16} />
//                 </button>
//                 {/*<span className="px-4 py-2 border border-gray-300 rounded-lg">*/}
//                 {/*  {quantity}*/}
//                 {/*</span>*/}
//                 {/*  <input*/}
//                 {/*      type="number"*/}
//                 {/*      value={quantity}*/}
//                 {/*      onChange={handleQuantityChange}*/}
//                 {/*      onBlur={handleQuantityBlur}*/}
//                 {/*      disabled={isSoldOut}*/}
//                 {/*      className={`w-16 text-center px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 transition-colors ${*/}
//                 {/*          isSoldOut ? "bg-gray-100 opacity-50 cursor-not-allowed" : ""*/}
//                 {/*      }`}*/}
//                 {/*      // Ẩn hai mũi tên tăng/giảm mặc định của trình duyệt (vì đã có nút + và - custom)*/}
//                 {/*      style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}*/}
//                 {/*  />*/}
//                 <input
//                   type="number"
//                   value={quantity}
//                   onChange={handleQuantityChange}
//                   onBlur={handleQuantityBlur}
//                   disabled={isSoldOut}
//                   className={`w-16 text-center px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
//                     isSoldOut ? "bg-gray-100 opacity-50 cursor-not-allowed" : ""
//                   }`}
//                 />
//
//                 <button
//                   onClick={() => changeQuantity(1)}
//                   disabled={isSoldOut} // Disable quantity change if sold out
//                   className={`p-2 border border-gray-300 rounded-lg ${
//                     isSoldOut ? "opacity-50" : "hover:bg-gray-100"
//                   }`}
//                 >
//                   <Plus size={16} />
//                 </button>
//               </div>
//               {/* THÊM ĐOẠN NÀY: Dòng hiển thị tồn kho */}
//               <div className="mt-2 text-sm">
//                 <span className="text-gray-600">Available Stock: </span>
//                 <span className="font-bold text-red-600">
//                   {currentStock} items
//                 </span>
//                 {selectedSize && (
//                   <span className="text-gray-500 italic ml-1">
//                     (Size {selectedSize})
//                   </span>
//                 )}
//               </div>
//             </div>
//             {/* ACTION BUTTONS */}
//             <div className="flex gap-4 mb-6">
//               <button
//                 onClick={handleAddToCart}
//                 disabled={isSoldOut} // FIX: Vô hiệu hóa nếu hết hàng
//                 className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 shadow-md ${
//                   isSoldOut
//                     ? "bg-gray-400 text-white cursor-not-allowed" // Style khi disabled
//                     : "bg-white text-black hover:bg-black hover:text-white hover:shadow-lg"
//                 }`}
//               >
//                 <ShoppingCart size={20} />{" "}
//                 {isSoldOut
//                   ? "Sold Out"
//                   : isAddedToCart
//                     ? "Added"
//                     : "Add to Cart"}
//               </button>
//
//               <button
//                 onClick={handleBuyNow}
//                 disabled={isSoldOut} // FIX: Vô hiệu hóa nếu hết hàng
//                 className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 shadow-md ${
//                   isSoldOut
//                     ? "bg-gray-400 text-white cursor-not-allowed" // Style khi disabled
//                     : "bg-black text-white hover:bg-green-600 hover:shadow-lg"
//                 }`}
//               >
//                 <CreditCard size={20} /> Buy Now
//               </button>
//             </div>
//             {/* DESCRIPTION */}
//             <div className="space-y-4">
//               <h3 className="font-bold text-lg">Description</h3>
//               <p className="text-gray-600">{product.description}</p>
//
//               <h3 className="font-bold text-lg">Details</h3>
//               <ul className="list-disc pl-5 text-gray-600">
//                 <li>Form: {product.form}</li>
//                 <li>Material: {product.material}</li>
//                 <li>Unit: {product.unit}</li>
//               </ul>
//
//               <h3 className="font-bold text-lg">Size Chart</h3>
//               <img
//                 src={product.category?.imageUrl}
//                 alt="Size Chart"
//                 className="w-full h-auto rounded-lg"
//               />
//             </div>
//             <ChatBot /> {/* Giữ lại ChatBot ở đây */}
//             <Contact />
//           </div>
//         </div>
//
//         {/* YOU MAY ALSO LIKE */}
//         {otherProducts.length > 0 && (
//           <div className="mt-12">
//             <h2 className="text-3xl font-bold mb-6">You May Also Like</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {otherProducts.map((prod) => (
//                 <ProductCard
//                   key={prod.id}
//                   product={prod}
//                   isInWishlist={relatedWishlistMap[prod.id] ?? false} // ← thêm
//                   onWishlistChange={(
//                     id,
//                     status, // ← thêm
//                   ) =>
//                     setRelatedWishlistMap((prev) => ({ ...prev, [id]: status }))
//                   }
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//
//       {/* ZOOM MODAL */}
//       {zoomImage && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-hidden transition-opacity duration-300 ease-in-out">
//           <div className="relative w-full h-full flex items-center justify-center">
//             <img
//               ref={imageRef}
//               src={zoomImage}
//               alt="Zoomed product"
//               className="rounded-lg cursor-grab transition-transform duration-200 ease-in-out"
//               style={{
//                 transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
//                 maxHeight: "90vh",
//                 objectFit: "contain",
//               }}
//               onWheel={handleWheel}
//               onMouseDown={handleMouseDown}
//             />
//
//             <button
//               onClick={() => setZoomImage(null)}
//               className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
//             >
//               <X size={24} className="text-gray-800" />
//             </button>
//           </div>
//         </div>
//       )}
//
//       {/* COMPARISON BAR - Đặt ở cuối cùng để hiển thị fixed */}
//       <CompareBar
//         compareList={compareList}
//         setCompareListState={setCompareListState}
//         formatPrice={formatPrice}
//       />
//     </div>
//   );
// };
//
// export default ProductDetail;
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, CreditCard, X, ZoomIn, Minus, Plus, GitCompare, ShoppingBag } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { toast } from "sonner";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getCompareList = () => {
    const list = localStorage.getItem("compareList");
    return list ? JSON.parse(list) : [];
};
const setCompareList = (list) => localStorage.setItem("compareList", JSON.stringify(list));

// --- COMPARE BAR REDESIGNED (Minimalist Glassmorphism) ---
const CompareBar = ({ compareList, setCompareListState, formatPrice }) => {
    if (compareList.length === 0) return null;

    const handleRemoveProduct = (productId, productName) => {
        const newList = compareList.filter((p) => p.id !== productId);
        setCompareList(newList);
        setCompareListState(newList);
        toast.info(`${productName} removed from Compare List.`);
    };

    const compareUrl = `/compare?ids=${compareList.map((p) => p.id).join(",")}`;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#e8e4df] z-40 p-4 transition-transform duration-300">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4 overflow-x-auto p-2 w-full md:w-auto">
                    {compareList.map((p) => (
                        <div key={p.id} className="relative flex-shrink-0 w-24 border border-[#e8e4df] bg-white p-2">
                            <Link to={`/product/${p.id}`} className="block text-center hover:opacity-80">
                                <img src={p.imageUrl} alt={p.name} className="w-full h-16 object-cover mb-2" />
                                <p className="text-[0.6rem] font-bold truncate text-[#1a1a1a] uppercase tracking-wider">{p.name}</p>
                            </Link>
                            <button onClick={() => handleRemoveProduct(p.id, p.name)} className="absolute -top-2 -right-2 bg-[#1a1a1a] text-white rounded-full p-1 hover:bg-[#888] transition-colors">
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    {Array(4 - compareList.length).fill(0).map((_, index) => (
                        <div key={`placeholder-${index}`} className="flex-shrink-0 w-24 h-24 border border-dashed border-[#e8e4df] flex flex-col items-center justify-center text-[#888] text-[0.6rem] uppercase tracking-wider">
                            <Plus size={16} className="mb-1 opacity-50" /> Add
                        </div>
                    ))}
                </div>

                <div className="flex-shrink-0 flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[0.65rem] font-bold text-[#1a1a1a] uppercase tracking-widest">{compareList.length} / 4 Selected</p>
                        <p className="text-[0.6rem] text-[#888] tracking-widest uppercase mt-1">Min. 2 products</p>
                    </div>
                    <Link
                        to={compareUrl}
                        onClick={(e) => {
                            if (compareList.length < 2) { e.preventDefault(); toast.warning("Select at least 2 products to compare."); }
                        }}
                        className={`px-8 py-3 text-[0.7rem] uppercase tracking-[0.15em] transition-colors flex items-center gap-2 ${compareList.length >= 2 ? "bg-[#1a1a1a] text-[#faf9f7] hover:bg-[#333]" : "bg-[#e8e4df] text-[#888] cursor-not-allowed"}`}
                    >
                        <GitCompare size={14} /> Compare
                    </Link>
                </div>
            </div>
        </div>
    );
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [otherProducts, setOtherProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [currentImage, setCurrentImage] = useState("front");
    const [zoomImage, setZoomImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [relatedWishlistMap, setRelatedWishlistMap] = useState({});
    const imageRef = useRef(null);
    const [user, setUser] = useState(() => { const storedUser = localStorage.getItem("user"); return storedUser ? JSON.parse(storedUser) : null; });
    const [cart, setCart] = useState(null);
    const [compareList, setCompareListState] = useState(getCompareList());

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${BASE_URL}/accounts/myinfor`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setUser(data.result);
        } catch (error) {}
    };

    useEffect(() => { window.scrollTo(0, 0); }, [id]);
    useEffect(() => { fetchUser(); }, []);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch(`${BASE_URL}/carts/account/${user.id}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setCart(data.result);
            } catch (error) {}
        };
        if (user?.id) fetchCart();
    }, [user]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BASE_URL}/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data.result || null);
                } else { setError("Product not found"); }
            } catch (error) { setError("Failed to load product"); } finally { setLoading(false); }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        const fetchOtherProducts = async () => {
            try {
                const response = await fetch(`${BASE_URL}/products`);
                if (response.ok) {
                    const data = await response.json();
                    let products = (data.result || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).filter((p) => p.id !== parseInt(id) && p.status === "ACTIVE").slice(0, 4);
                    setOtherProducts(products);
                }
            } catch (error) {}
        };
        fetchOtherProducts();
    }, [id]);

    useEffect(() => {
        if (!otherProducts.length || !localStorage.getItem("accessToken")) return;
        const ids = otherProducts.map((p) => p.id).join(",");
        fetch(`${BASE_URL}/wishlists/products/in-wishlist-batch?productIds=${ids}`, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } })
            .then((r) => r.json())
            .then((data) => setRelatedWishlistMap(data.result || data))
            .catch(() => {});
    }, [otherProducts]);

    const formatPrice = (price) => {
        const numericPrice = typeof price === "number" && isFinite(price) ? price : 0;
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(numericPrice);
    };

    const handleAddToCart = async () => {
        if (isSoldOut) return toast.error("This product is currently sold out.");
        const hasSizes = uniqueSizes.length > 0;
        if (hasSizes && !selectedSize) return toast.warning("Please select a size");

        if (!user?.id || !localStorage.getItem("accessToken")) {
            let sizeDetailIdForGuest = null;
            if (hasSizes && selectedSize) {
                const foundSize = product.sizeDetails.find((sd) => sd.sizeName === selectedSize || sd.size?.nameSize === selectedSize);
                if (foundSize) sizeDetailIdForGuest = foundSize.id;
            }
            const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
            const newItem = { id: `guest_${Date.now()}`, productId: parseInt(id), productName: product.name, productImage: product.imageUrlFront, sizeName: selectedSize, sizeDetailId: sizeDetailIdForGuest, quantity: quantity, stock: currentStock, priceAtTime: product.costPrice, subtotal: product.costPrice * quantity, selected: true };
            const existingIndex = guestCart.findIndex((item) => item.productId === newItem.productId && item.sizeName === newItem.sizeName);
            if (existingIndex !== -1) {
                guestCart[existingIndex].quantity += quantity;
                guestCart[existingIndex].subtotal = guestCart[existingIndex].quantity * guestCart[existingIndex].priceAtTime;
            } else { guestCart.push(newItem); }
            localStorage.setItem("guestCart", JSON.stringify(guestCart));
            setIsAddedToCart(true); toast.success("Added items to Guest Cart!");
            setTimeout(() => setIsAddedToCart(false), 2000); window.dispatchEvent(new Event("cartUpdated"));
            return;
        }

        if (quantity < 1) return toast.warning("Quantity must be at least 1");
        setIsAddedToCart(true); toast.success("Added items, check your Cart!"); setTimeout(() => setIsAddedToCart(false), 2000);

        try {
            const token = localStorage.getItem("accessToken");
            let sizeDetailId = null;
            if (hasSizes && selectedSize) {
                const resSize = await fetch(`${BASE_URL}/sizes/${selectedSize}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
                const size = await resSize.json();
                const resSizeDatail = await fetch(`${BASE_URL}/size-details/find?productId=${parseInt(id)}&sizeId=${size.id}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
                const sizeDetailResponse = await resSizeDatail.json();
                sizeDetailId = sizeDetailResponse.id;
            }
            const dataSend = { productId: parseInt(id), cartId: cart.id, quantity: quantity, ...(sizeDetailId && { sizeDetailId: sizeDetailId }) };
            await fetch(`${BASE_URL}/cart-details/add-to-cart`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(dataSend) });
            const cartRequest = { quantity: parseInt(quantity), totalAmount: product.costPrice };
            const resCart = await fetch(`${BASE_URL}/carts/update/${cart.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(cartRequest) });
            if (resCart.ok) window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) { toast.error("Failed to add to cart."); }
    };

    const handleBuyNow = async () => {
        if (isSoldOut) return toast.error("This product is currently sold out.");
        const hasSizes = uniqueSizes.length > 0;
        if (hasSizes && !selectedSize) return toast.warning("Please select a size");
        if (quantity < 1) return toast.warning("Quantity must be at least 1");

        let sizeDetailId = null;
        try {
            const token = localStorage.getItem("accessToken");
            if (hasSizes && selectedSize) {
                const resSize = await fetch(`${BASE_URL}/sizes/${selectedSize}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
                const size = await resSize.json();
                const resSizeDetail = await fetch(`${BASE_URL}/size-details/find?productId=${id}&sizeId=${size.id}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
                const sizeDetail = await resSizeDetail.json();
                sizeDetailId = sizeDetail.id;
            }
            navigate("/checkout", { state: { userId: user?.id, product: product, quantity: quantity, sizeDetailId: sizeDetailId } });
        } catch (error) { toast.error("Failed to process. Please try again."); }
    };

    const handleZoom = (imageType) => {
        setZoomImage(imageType === "front" ? product.imageUrlFront : product.imageUrlBack);
        setZoomLevel(1); setPosition({ x: 0, y: 0 });
    };

    const changeQuantity = (delta) => {
        setQuantity((prev) => {
            const newQuantity = prev + delta;
            if (newQuantity < 1) return 1;
            if (newQuantity > currentStock) { toast.warning(`Only ${currentStock} items available in stock!`); return prev; }
            return newQuantity;
        });
    };

    const handleQuantityChange = (e) => {
        const val = e.target.value;
        if (val === "") { setQuantity(""); return; }
        const num = parseInt(val, 10);
        if (isNaN(num)) return;
        const currentStock = selectedSize ? uniqueSizes.find((size) => size.sizeName === selectedSize)?.quantity || 0 : totalStock;
        if (num > currentStock) { toast.warning(`Only ${currentStock} items available in stock!`); setQuantity(currentStock); } else { setQuantity(num); }
    };

    const handleQuantityBlur = () => { if (quantity === "" || quantity < 1) setQuantity(1); };

    const handleSizeSelect = (newSizeName) => {
        setSelectedSize(newSizeName);
        const newSizeStock = uniqueSizes.find((size) => size.sizeName === newSizeName)?.quantity || 0;
        if (quantity > newSizeStock && newSizeStock > 0) {
            setQuantity(newSizeStock);
            toast.info(`Adjusted quantity to ${newSizeStock} due to stock limits of Size ${newSizeName}.`);
        } else if (newSizeStock <= 0) { setQuantity(1); }
    };

    const handleWheel = (e) => { e.preventDefault(); setZoomLevel((prev) => Math.max(1, Math.min(prev + e.deltaY * -0.01, 5))); };

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX - position.x, startY = e.clientY - position.y;
        const handleMouseMove = (moveE) => setPosition({ x: moveE.clientX - startX, y: moveE.clientY - startY });
        const handleMouseUp = () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); };
        document.addEventListener("mousemove", handleMouseMove); document.addEventListener("mouseup", handleMouseUp);
    };

    const handleCompare = () => {
        if (!product) return;
        const currentProductInList = compareList.find((p) => p.id === product.id);
        const newProductData = { id: product.id, name: product.name, price: product.price, discount_amount: product.costPrice, imageUrl: product.imageUrlFront };
        if (currentProductInList) {
            const newList = compareList.filter((p) => p.id !== product.id);
            setCompareList(newList); setCompareListState(newList); toast.info(`${product.name} removed from Compare List.`);
        } else {
            if (compareList.length < 4) {
                const newList = [...compareList, newProductData];
                setCompareList(newList); setCompareListState(newList); toast.success(`${product.name} added to Compare List.`);
            } else { toast.error("Maximum 4 products allowed for comparison."); }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-[#faf9f7]"><div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin"></div></div>;
    if (error || !product) return <div className="text-center py-32 bg-[#faf9f7]"><h3 className="text-2xl font-serif text-[#1a1a1a] mb-4">{error || "Product not found"}</h3><Link to="/product" className="text-[#888] uppercase tracking-widest text-[0.7rem] border-b border-[#888] pb-1 hover:text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors">Back to Collection</Link></div>;

    const uniqueSizes = [];
    const sizeMap = new Map();
    product.sizeDetails?.forEach((size) => {
        if (sizeMap.has(size.sizeName)) sizeMap.get(size.sizeName).quantity += size.quantity;
        else sizeMap.set(size.sizeName, { ...size });
    });
    sizeMap.forEach((value) => uniqueSizes.push(value));
    uniqueSizes.sort((a, b) => ["S", "M", "L", "XL"].indexOf(a.sizeName) - ["S", "M", "L", "XL"].indexOf(b.sizeName));

    const totalStock = uniqueSizes.reduce((sum, size) => sum + size.quantity, 0);
    const isSoldOut = totalStock === 0;
    const currentStock = selectedSize ? uniqueSizes.find((size) => size.sizeName === selectedSize)?.quantity || 0 : totalStock;
    const isComparing = compareList.some((p) => p.id === product.id);

    return (
        <div className="min-h-screen bg-[#faf9f7] font-sans pb-24">

            {/* BREADCRUMB */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
                <div className="flex items-center text-[0.65rem] uppercase tracking-widest text-[#888]">
                    <Link to="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/product" className="hover:text-[#1a1a1a] transition-colors">Collection</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#1a1a1a] truncate max-w-[200px]">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* LEFT: IMAGE GALLERY */}
                    <div className="lg:col-span-7 relative">
                        <div className="sticky top-24">
                            <div className="relative bg-[#ebe8e2] aspect-[3/4] sm:aspect-square flex items-center justify-center overflow-hidden group">
                                {isSoldOut && (
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
                                        <div className="border border-[#1a1a1a] bg-[#faf9f7] text-[#1a1a1a] px-6 py-2 text-[0.7rem] uppercase tracking-[0.2em] font-bold">Sold Out</div>
                                    </div>
                                )}

                                <img
                                    src={currentImage === "front" ? product.imageUrlFront : product.imageUrlBack}
                                    alt={product.name}
                                    className="w-full h-full object-cover cursor-crosshair transition-transform duration-700 hover:scale-105"
                                    onClick={() => handleZoom(currentImage)}
                                />
                                <button onClick={() => handleZoom(currentImage)} className="absolute bottom-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                    <ZoomIn size={18} className="text-[#1a1a1a]" />
                                </button>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button onMouseEnter={() => setCurrentImage("front")} className={`flex-1 h-1 bg-[#1a1a1a] transition-opacity ${currentImage === "front" ? "opacity-100" : "opacity-20"}`}></button>
                                <button onMouseEnter={() => setCurrentImage("back")} className={`flex-1 h-1 bg-[#1a1a1a] transition-opacity ${currentImage === "back" ? "opacity-100" : "opacity-20"}`}></button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: PRODUCT INFO */}
                    <div className="lg:col-span-5">

                        {/* Title & Compare */}
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <h1 className="text-3xl lg:text-4xl font-serif text-[#1a1a1a] leading-tight">{product.name}</h1>
                            <button onClick={handleCompare} className="p-2 border border-[#e8e4df] rounded-full hover:border-[#1a1a1a] transition-colors" title="Compare">
                                <GitCompare size={18} className={isComparing ? "text-green-600" : "text-[#1a1a1a]"} />
                            </button>
                        </div>

                        {/* Pricing & Meta */}
                        <div className="flex items-end gap-4 mb-8">
                            <span className="text-2xl font-serif text-[#1a1a1a]">{formatPrice(product.costPrice)}</span>
                            {!isSoldOut && product.discountAmount > 0 && (
                                <span className="text-sm text-[#888] line-through mb-1">{formatPrice(product.price)}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-[#e8e4df] text-[0.65rem] uppercase tracking-widest text-[#888]">
                            <div className="flex items-center gap-1">
                                <Star size={12} className="text-[#1a1a1a] fill-[#1a1a1a]" /> {product.rating || "N/A"}
                            </div>
                            <div className="flex items-center gap-1">
                                <ShoppingBag size={12} /> {(product.soldQuantity || 0).toLocaleString()} Sold
                            </div>
                            {product.category?.name && (
                                <div>{product.category.name}</div>
                            )}
                        </div>

                        {/* SIZE SELECTION */}
                        <div className="mb-10">
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="text-[0.7rem] uppercase tracking-[0.15em] font-bold text-[#1a1a1a]">Size</h3>
                                {selectedSize && <span className="text-[0.65rem] uppercase tracking-widest text-[#888]">Stock: {currentStock}</span>}
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {uniqueSizes.map((size) => (
                                    <button
                                        key={size.sizeName}
                                        onClick={() => handleSizeSelect(size.sizeName)}
                                        disabled={size.quantity <= 0}
                                        className={`py-3 text-[0.75rem] uppercase tracking-widest border transition-all ${
                                            selectedSize === size.sizeName
                                                ? "border-[#1a1a1a] bg-[#1a1a1a] text-[#faf9f7]"
                                                : "border-[#e8e4df] text-[#1a1a1a] hover:border-[#1a1a1a]"
                                        } ${size.quantity <= 0 ? "opacity-30 cursor-not-allowed hover:border-[#e8e4df]" : ""}`}
                                    >
                                        {size.sizeName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ADD TO CART & BUY NOW */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
                            {/* Quantity Control */}
                            <div className="flex items-center border border-[#e8e4df] h-[52px]">
                                <button onClick={() => changeQuantity(-1)} disabled={isSoldOut} className="px-4 h-full text-[#888] hover:text-[#1a1a1a] transition-colors"><Minus size={14}/></button>
                                <input
                                    type="number" value={quantity} onChange={handleQuantityChange} onBlur={handleQuantityBlur} disabled={isSoldOut}
                                    className="w-12 text-center h-full bg-transparent text-[0.8rem] font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button onClick={() => changeQuantity(1)} disabled={isSoldOut} className="px-4 h-full text-[#888] hover:text-[#1a1a1a] transition-colors"><Plus size={14}/></button>
                            </div>

                            <button onClick={handleAddToCart} disabled={isSoldOut} className="flex-1 bg-[#1a1a1a] text-[#faf9f7] h-[52px] text-[0.7rem] uppercase tracking-[0.15em] font-bold hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSoldOut ? "Sold Out" : (isAddedToCart ? "Added to Cart" : "Add to Cart")}
                            </button>

                            <button onClick={handleBuyNow} disabled={isSoldOut} className="flex-1 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] h-[52px] text-[0.7rem] uppercase tracking-[0.15em] font-bold hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors disabled:opacity-50">
                                Buy it Now
                            </button>
                        </div>

                        {/* DETAILS ACCORDION-STYLE */}
                        <div className="border-t border-[#e8e4df] pt-6 space-y-6">
                            <div>
                                <h3 className="text-[0.7rem] uppercase tracking-[0.15em] font-bold text-[#1a1a1a] mb-2">Description</h3>
                                <p className="text-sm text-[#666] leading-relaxed">{product.description || "No description provided."}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-[#666]">
                                <div><span className="block text-[0.6rem] uppercase tracking-widest text-[#1a1a1a] font-bold mb-1">Form</span> {product.form || "N/A"}</div>
                                <div><span className="block text-[0.6rem] uppercase tracking-widest text-[#1a1a1a] font-bold mb-1">Material</span> {product.material || "N/A"}</div>
                            </div>
                        </div>

                        <ChatBot />
                        <Contact />
                    </div>
                </div>

                {/* YOU MAY ALSO LIKE */}
                {otherProducts.length > 0 && (
                    <div className="mt-32 border-t border-[#e8e4df] pt-16">
                        <h2 className="text-2xl font-serif text-[#1a1a1a] text-center mb-10">You May Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {otherProducts.map((prod) => (
                                <ProductCard
                                    key={prod.id}
                                    product={prod}
                                    isInWishlist={relatedWishlistMap[prod.id] ?? false}
                                    onWishlistChange={(id, status) => setRelatedWishlistMap((prev) => ({ ...prev, [id]: status }))}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ZOOM MODAL - Lighter / Glass */}
            {zoomImage && (
                <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden transition-opacity duration-300">
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                        <img
                            ref={imageRef}
                            src={zoomImage}
                            alt="Zoomed product"
                            className="cursor-grab active:cursor-grabbing max-h-full max-w-full object-contain"
                            style={{ transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)` }}
                            onWheel={handleWheel}
                            onMouseDown={handleMouseDown}
                        />
                        <button onClick={() => setZoomImage(null)} className="absolute top-8 right-8 w-12 h-12 border border-[#e8e4df] rounded-full flex items-center justify-center hover:border-[#1a1a1a] transition-colors bg-white">
                            <X size={20} className="text-[#1a1a1a]" />
                        </button>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white border border-[#e8e4df] px-6 py-2 rounded-full text-[0.65rem] uppercase tracking-widest text-[#888] shadow-sm pointer-events-none">
                            Scroll to zoom • Drag to move
                        </div>
                    </div>
                </div>
            )}

            <CompareBar compareList={compareList} setCompareListState={setCompareListState} formatPrice={formatPrice} />
        </div>
    );
};

export default ProductDetail;