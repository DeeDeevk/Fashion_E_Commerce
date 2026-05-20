// ProductCard.jsx
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import WishlistSelectorModal from "./WishListSelector";

const ProductCard = ({
                       product,
                       isHot = false,
                       isNew = false,
                       viewMode = "grid",
                       isInWishlist = false,       // ← nhận từ component cha (thay vì tự gọi API)
                       onWishlistChange,           // ← callback báo lên cha khi trạng thái thay đổi
                     }) => {
  const navigate = useNavigate();
  const [isInAnyWishlist, setIsInAnyWishlist] = useState(isInWishlist);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  // Sync lại khi prop từ cha thay đổi (ví dụ sau batch fetch)
  useEffect(() => {
    setIsInAnyWishlist(isInWishlist);
  }, [isInWishlist]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isSoldOut = product.quantity === 0;

  const goToDetail = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const openWishlistModal = (e) => {
    e.stopPropagation();
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }
    setShowWishlistModal(true);
  };

  const closeWishlistModal = () => {
    setShowWishlistModal(false);
    // KHÔNG gọi API lại ở đây nữa
  };

  // Được gọi từ WishlistSelectorModal khi thêm/xóa thành công
  const handleWishlistSuccess = (added) => {
    setIsInAnyWishlist(added);
    onWishlistChange?.(product.id, added); // báo lên cha để update wishlistMap
  };

  // LIST VIEW
  if (viewMode === "list") {
    return (
        <>
          <div
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 group cursor-pointer relative flex gap-4 p-4"
              onClick={goToDetail}
          >
            {/* HÌNH ẢNH BÊN TRÁI */}
            <div className="relative overflow-hidden w-40 h-40 flex-shrink-0 rounded-lg">
              <img
                  src={product.imageUrlFront}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              {isSoldOut && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="bg-red-600 text-white px-6 py-2 rounded-full text-base font-bold tracking-wider shadow-2xl border-4 border-white transform -rotate-12">
                      SOLD OUT
                    </div>
                  </div>
              )}

              {!isSoldOut && product.discountAmount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    -{product.discountAmount}%
                  </div>
              )}
            </div>

            {isHot && !isSoldOut && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse z-10">
                  🔥 HOT
                </div>
            )}

            {!isHot && isNew && !isSoldOut && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10">
                  ✨ NEW
                </div>
            )}

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-2xl mb-3 line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <svg
                            key={i}
                            className={`w-5 h-5 ${
                                i < Math.floor(product.rating || 4.5)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                  </div>
                  <span className="text-base text-gray-600 font-medium">
                  ({product.rating || 4.5})
                </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-3xl font-bold text-red-500">
                    {formatPrice(product.costPrice)}
                  </p>
                  {!isSoldOut && product.discountAmount > 0 && (
                      <p className="text-base text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                      onClick={openWishlistModal}
                      className={`
                    p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110
                    ${
                          isInAnyWishlist
                              ? "bg-red-500 text-white shadow-red-500/50"
                              : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200"
                      }
                  `}
                  >
                    <Heart
                        size={24}
                        fill={isInAnyWishlist ? "currentColor" : "none"}
                        strokeWidth={2}
                    />
                  </button>

                  <button
                      onClick={goToDetail}
                      className="px-8 py-4 rounded-full bg-black text-white hover:bg-red-500 transition flex items-center justify-center gap-2 font-semibold"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showWishlistModal && (
              <WishlistSelectorModal
                  productId={product.id}
                  isOpen={showWishlistModal}
                  onClose={closeWishlistModal}
                  onSuccess={handleWishlistSuccess}
              />
          )}
        </>
    );
  }

  // GRID VIEW
  return (
      <>
        <div
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 group cursor-pointer relative"
            onClick={goToDetail}
        >
          <div className="relative overflow-hidden h-80">
            <img
                src={product.imageUrlFront}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />

            {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="bg-red-600 text-white px-8 py-3 rounded-full text-lg font-bold tracking-wider shadow-2xl border-4 border-white transform -rotate-12">
                    SOLD OUT
                  </div>
                </div>
            )}

            {!isSoldOut && product.discountAmount > 0 && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  -{product.discountAmount}%
                </div>
            )}

            {isHot && !isSoldOut && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 animate-pulse">
                  🔥 HOT
                </div>
            )}

            {!isHot && isNew && !isSoldOut && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  ✨ NEW
                </div>
            )}

            {/* NÚT TIM */}
            <div className="absolute bottom-3 right-3 z-20">
              <button
                  onClick={openWishlistModal}
                  className={`
                p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110
                ${
                      isInAnyWishlist
                          ? "bg-red-500 text-white shadow-red-500/50 opacity-100"
                          : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
                  }
              `}
              >
                <Heart
                    size={22}
                    fill={isInAnyWishlist ? "currentColor" : "none"}
                    strokeWidth={2}
                />
              </button>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-4 h-4 ${
                            i < Math.floor(product.rating || 4.5)
                                ? "text-yellow-400"
                                : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
              ({product.rating || 4.5})
            </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {formatPrice(product.costPrice)}
                </p>
                {!isSoldOut && product.discountAmount > 0 && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </p>
                )}
              </div>

              <button
                  onClick={goToDetail}
                  className="p-4 rounded-full bg-black text-white hover:bg-red-500 transition flex items-center justify-center"
              >
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        </div>

        {showWishlistModal && (
            <WishlistSelectorModal
                productId={product.id}
                isOpen={showWishlistModal}
                onClose={closeWishlistModal}
                onSuccess={handleWishlistSuccess}
            />
        )}
      </>
  );
};

export default ProductCard;