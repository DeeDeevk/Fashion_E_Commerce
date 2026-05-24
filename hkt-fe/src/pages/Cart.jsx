import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import ChatBot from "../components/ChatBot"; 
import Contact from "../components/Contact";

const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const calculateSummary = (items) => {
    if (!Array.isArray(items))
        return {
            subtotal: 0,
            discount: 0,
            shippingFee: 0,
            total: 0,
            shippingText: "Not Yet",
            minFreeShipping: 1000000,
        };

    const selectedItems = items.filter((item) => item.selected);
    const subtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const minFreeShipping = 1000000;
    const standardShippingFee = 0;
    const discount = 0;

    const shippingFee = subtotal >= minFreeShipping ? 0 : standardShippingFee;
    const shippingText = subtotal >= minFreeShipping ? "Free" : "Not Yet";

    const total = subtotal - discount + shippingFee;

    return {
        subtotal,
        discount,
        shippingFee,
        total,
        shippingText,
        minFreeShipping,
    };
};

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [select, setSelect] = useState([]);
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [cart, setCart] = useState(null);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("accessToken");

            const res = await fetch(`http://localhost:8080/accounts/myinfor`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            console.log("Tài khoản đang login: ", data.result);
            setUser(data.result);
        } catch (error) {
            console.error("Lỗi fetch user", error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `http://localhost:8080/carts/account/${user.id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            console.log("Cart của user: ", data.result);
            setCart(data.result);
        } catch (error) {
            console.error("Lỗi fetch cart: ", error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchCart();
        }
    }, [user]);

    const hanldeFetchCart = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `http://localhost:8080/cart-details/cart/${cart.id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            const newCartItems = [];
            for (const cd of data) {
                console.log(cd);
            }
            console.log("Cart API: ", data);
            const items = Array.isArray(data)
                ? data
                : data.result || data.cartDetails || [];
            setCartItems(items);
        } catch (err) {
            console.error("Lỗi: ", err);
        }
    };

    const handleToggleSelect = async (cartDetailId) => {
        const updatedItems = cartItems.map((item) =>
            item.id === cartDetailId ? { ...item, selected: !item.selected } : item
        );

        setCartItems(updatedItems);

        try {
            const token = localStorage.getItem("accessToken");
            await fetch(`http://localhost:8080/cart-details/${cartDetailId}/select`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    selected: updatedItems.find((i) => i.id === cartDetailId).selected,
                }),
            });
        } catch (err) {
            console.error("Lỗi update select: ", err);
        }
    };

    useEffect(() => {
        const selectedItems = cartItems.filter((item) => item.selected);
        setSelect(selectedItems);
    }, [cartItems]);

    useEffect(() => {
        console.log("Select state đã cập nhật:", select);
    }, [select]);

    // const handleToggleIncrease = async (cartDetailId, priceAtTime) => {
    //     try {
    //         const token = localStorage.getItem("accessToken");
    //         const res = await fetch(
    //             `http://localhost:8080/cart-details/${cartDetailId}/increase-quantity`,
    //             {
    //                 method: "PUT",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );
    //
    //         const data = await res.json();
    //
    //         setCartItems((prev) =>
    //             prev.map((item) =>
    //                 item.id === cartDetailId ? { ...item, ...data } : item
    //             )
    //         );
    //         const resCart = await fetch(
    //             `http://localhost:8080/carts/update/${cart.id}/increase`,
    //             {
    //                 method: "PUT",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify({ price: priceAtTime }),
    //             }
    //         );
    //
    //         const dataCart = await resCart.json();
    //         if (resCart.ok) {
    //             window.dispatchEvent(new Event("cartUpdated"));
    //         }
    //         console.log("Update quantity response: ", data);
    //     } catch (err) {
    //         console.error("Lỗi update select: ", err);
    //     }
    // };

    const handleToggleIncrease = async (cartDetailId, priceAtTime, currentQuantity, maxStock) => {
    // const handleToggleIncrease = async (cartDetailId, priceAtTime) => {
        // Nếu số lượng hiện tại đã đạt tối đa trong kho, không cho tăng nữa
        if (currentQuantity >= maxStock) {
            toast.error(`Sản phẩm này chỉ còn tối đa ${maxStock} sản phẩm trong kho!`);
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `http://localhost:8080/cart-details/${cartDetailId}/increase-quantity`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            setCartItems((prev) =>
                prev.map((item) =>
                    item.id === cartDetailId ? { ...item, ...data } : item
                )
            );

            // SỬA TẠI ĐÂY: Thêm quantity: 1 vào body để backend cập nhật totalQuantity của giỏ hàng
            const resCart = await fetch(
                `http://localhost:8080/carts/update/${cart.id}/increase`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ price: priceAtTime, quantity: 1 }),
                }
            );

            if (resCart.ok) {
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (err) {
            console.error("Lỗi tăng số lượng: ", err);
        }
    };
    // const handleToggleDecrease = async (cartDetailId, priceAtTime) => {
    //     try {
    //         const token = localStorage.getItem("accessToken");
    //         const res = await fetch(
    //             `http://localhost:8080/cart-details/${cartDetailId}/decrease-quantity`,
    //             {
    //                 method: "PUT",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );
    //
    //         const data = await res.json();
    //         if (!data || data.quantity === 0) {
    //             setCartItems((prev) => prev.filter((i) => i.id !== cartDetailId));
    //             const resCart = await fetch(
    //                 `http://localhost:8080/carts/update/${cart.id}/decrease`,
    //                 {
    //                     method: "PUT",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                     body: JSON.stringify({ price: priceAtTime }),
    //                 }
    //             );
    //
    //             const dataCart = await resCart.json();
    //             if (resCart.ok) {
    //                 window.dispatchEvent(new Event("cartUpdated"));
    //             }
    //             return;
    //         }
    //         setCartItems((prev) =>
    //             prev.map((item) =>
    //                 item.id === cartDetailId ? { ...item, ...data } : item
    //             )
    //         );
    //         const resCart = await fetch(
    //             `http://localhost:8080/carts/update/${cart.id}/decrease`,
    //             {
    //                 method: "PUT",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify({ price: priceAtTime }),
    //             }
    //         );
    //
    //         const dataCart = await resCart.json();
    //         if (resCart.ok) {
    //             window.dispatchEvent(new Event("cartUpdated"));
    //         }
    //         console.log("Update quantity response: ", data);
    //     } catch (err) {
    //         console.error("Lỗi update select: ", err);
    //     }
    // };

    // Thêm currentQuantity và subtotal vào tham số truyền vào
    // const handleToggleDecrease = async (cartDetailId, priceAtTime, currentQuantity, subtotal) => {
    //     // NẾU SỐ LƯỢNG ĐANG LÀ 1 -> Bấm trừ nghĩa là XÓA HẲN sản phẩm
    //     if (currentQuantity <= 1) {
    //         if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
    //             handleDelete(cartDetailId, currentQuantity, subtotal);
    //         }
    //         return; // Dừng hàm lại không gọi API decrease nữa
    //     }
    //
    //     try {
    //         const token = localStorage.getItem("accessToken");
    //         const res = await fetch(
    //             `http://localhost:8080/cart-details/${cartDetailId}/decrease-quantity`,
    //             {
    //                 method: "PUT",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );
    //
    //         const data = await res.json();
    //
    //         // Đoạn check data.quantity === 0 lúc này có thể bỏ hoặc giữ làm fallback
    //         setCartItems((prev) =>
    //             prev.map((item) =>
    //                 item.id === cartDetailId ? { ...item, ...data } : item
    //             )
    //         );
    //
    //         const resCart = await fetch(
    //             `http://localhost:8080/carts/update/${cart.id}/decrease`,
    //             {
    //                 method: "PUT",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify({ price: priceAtTime }),
    //             }
    //         );
    //
    //         if (resCart.ok) {
    //             window.dispatchEvent(new Event("cartUpdated"));
    //         }
    //     } catch (err) {
    //         console.error("Lỗi update select: ", err);
    //     }
    // };
    // SỬA TẠI ĐÂY: Nhận thêm currentQuantity và subtotal từ giao diện truyền vào
    const handleToggleDecrease = async (cartDetailId, priceAtTime, currentQuantity, subtotal) => {
        // Nếu số lượng hiện tại đang là 1, bấm trừ nghĩa là XÓA hẳn sản phẩm
        if (currentQuantity <= 1) {
            if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
                handleDelete(cartDetailId, currentQuantity, subtotal);
            }
            return; // Dừng hàm, không gọi API decrease nữa
        }

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `http://localhost:8080/cart-details/${cartDetailId}/decrease-quantity`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            setCartItems((prev) =>
                prev.map((item) =>
                    item.id === cartDetailId ? { ...item, ...data } : item
                )
            );

            // SỬA TẠI ĐÂY: Thêm quantity: 1 vào body gửi lên API cập nhật giỏ hàng tổng
            const resCart = await fetch(
                `http://localhost:8080/carts/update/${cart.id}/decrease`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ price: priceAtTime, quantity: 1 }),
                }
            );

            if (resCart.ok) {
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (err) {
            console.error("Lỗi giảm số lượng: ", err);
        }
    };

    const handleDelete = async (cartDetailId, quantity, subtotal) => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `http://localhost:8080/cart-details/delete/${cartDetailId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.ok) {
                setCartItems(cartItems.filter((item) => item.id !== cartDetailId));
                const resCart = await fetch(
                    `http://localhost:8080/carts/update/${cart.id}/delete`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ price: subtotal, quantity: quantity }),
                    }
                );

                const dataCart = await resCart.json();
                if (resCart.ok) {
                    window.dispatchEvent(new Event("cartUpdated"));
                }
            } else {
                console.error("Delete failed:", res.statusText);
            }
        } catch (err) {
            console.error("Lỗi update select: ", err);
        }
    };

    const [editingItemData, setEditingItemData] = useState({});
    // const handleQuantityChange = (cartDetailId, value, maxStock) => {
    //     // Cho phép ô nhập trống tạm thời khi người dùng đang xóa để gõ số mới
    //     if (value === "") {
    //         setCartItems((prev) =>
    //             prev.map((item) => (item.id === cartDetailId ? { ...item, quantity: "" } : item))
    //         );
    //         return;
    //     }
    //
    //     let parsedValue = parseInt(value, 10);
    //     if (isNaN(parsedValue) || parsedValue < 1) {
    //         parsedValue = 1;
    //     }
    //
    //     // Kiểm tra với số lượng tồn kho (Giả sử thuộc tính trong item backend trả về là item.sizeStock)
    //     // Bạn hãy đổi 'sizeStock' thành tên thuộc tính chứa số lượng tồn kho của bạn
    //     // const stock = maxStock || 99; // fallback nếu chưa có dữ liệu stock
    //     const stock = maxStock ;
    //
    //     if (parsedValue > stock) {
    //         toast.error(`Sản phẩm này chỉ còn tối đa ${stock} sản phẩm trong kho!`);
    //         parsedValue = stock;
    //     }
    //
    //     setCartItems((prev) =>
    //         prev.map((item) =>
    //             item.id === cartDetailId
    //                 ? { ...item, quantity: parsedValue, subtotal: parsedValue * item.priceAtTime }
    //                 : item
    //         )
    //     );
    // };
// Hàm xử lý khi người dùng đang gõ số lượng từ bàn phím
    const handleQuantityChange = (cartDetailId, value, maxStock) => {
        // Cho phép ô nhập trống tạm thời khi người dùng xóa sạch để gõ số mới
        if (value === "") {
            setCartItems((prev) =>
                prev.map((item) => (item.id === cartDetailId ? { ...item, quantity: "" } : item))
            );
            return;
        }

        let parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            parsedValue = 0; // Tạm thời cho phép bằng 0 khi đang gõ
        }

        // THAY ĐỔI TẠI ĐÂY: Sử dụng biến maxStock động lấy từ kho thực tế của sản phẩm
        const stockAvailable = maxStock || 0;
        if (parsedValue > stockAvailable) {
            toast.error(`Sản phẩm này chỉ còn tối đa ${stockAvailable} sản phẩm trong kho!`);
            parsedValue = stockAvailable; // Tự động đưa về số lượng tối đa trong kho
        }

        // // Kiểm tra giới hạn tồn kho (Ví dụ trường tồn kho là item.stock hoặc mặc định là 99)
        // const stock = maxStock || 99;
        // if (parsedValue > stock) {
        //     toast.error(`Sản phẩm này chỉ còn tối đa ${stock} sản phẩm trong kho!`);
        //     parsedValue = stock;
        // }

        setCartItems((prev) =>
            prev.map((item) =>
                item.id === cartDetailId
                    ? { ...item, quantity: parsedValue, subtotal: parsedValue * item.priceAtTime }
                    : item
            )
        );
    };
    // const handleBlurQuantity = async (item) => {
    //     let finalQty = parseInt(item.quantity, 10);
    //     if (isNaN(finalQty) || finalQty < 1) {
    //         finalQty = 1;
    //     }
    //
    //     try {
    //         const token = localStorage.getItem("accessToken");
    //
    //         // 1. Gọi API cập nhật số lượng mới lên DB
    //         const res = await fetch(`http://localhost:8080/cart-details/${item.id}/update-quantity`, {
    //             method: "PUT",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${token}`,
    //             },
    //             body: JSON.stringify({ quantity: finalQty }),
    //         });
    //
    //         const data = await res.json();
    //
    //         if (!res.ok) {
    //             toast.error(data.message || "Không thể cập nhật số lượng");
    //             // Nếu lỗi từ backend (ví dụ vượt tồn kho), tải lại giỏ hàng để đồng bộ đúng
    //             hanldeFetchCart();
    //             return;
    //         }
    //
    //         // Cập nhật lại item theo data chuẩn từ backend trả về
    //         setCartItems((prev) =>
    //             prev.map((i) => (i.id === item.id ? { ...i, ...data } : i))
    //         );
    //
    //         // 2. Tính toán lại giỏ hàng tổng (Carts) nếu backend yêu cầu cập nhật thủ công qua API này giống như hàm tăng/giảm của bạn
    //         // Tuy nhiên cách tối ưu nhất là gọi lại hàm hanldeFetchCart() để lấy dữ liệu mới nhất
    //         hanldeFetchCart();
    //         window.dispatchEvent(new Event("cartUpdated"));
    //
    //     } catch (err) {
    //         console.error("Lỗi cập nhật số lượng trực tiếp: ", err);
    //         toast.error("Đã xảy ra lỗi khi cập nhật số lượng.");
    //     }
    // };

// Hàm xử lý khi người dùng nhấn Enter hoặc click ra ngoài ô nhập (onBlur)
    const handleBlurQuantity = async (item) => {
        let finalQty = parseInt(item.quantity, 10);

        // XỬ LÝ KHI NHẬP BẰNG 0 HOẶC ĐỂ TRỐNG: Hiển thị thông báo xác nhận xóa sản phẩm
        if (isNaN(finalQty) || finalQty <= 0) {
            if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
                // Lấy lại số lượng và subtotal gốc trước khi sửa từ state tạm editingItemData
                const original = editingItemData[item.id] || { quantity: 1, subtotal: item.priceAtTime };

                // Gọi hàm handleDelete có sẵn của bạn để xóa hoàn toàn trong DB và trừ tiền giỏ tổng
                handleDelete(item.id, original.quantity, original.subtotal);
            } else {
                // Nếu người dùng nhấn Hủy (Cancel) -> Gọi hàm tải lại giỏ hàng để khôi phục số lượng cũ
                hanldeFetchCart();
            }
            return;
        }

        // XỬ LÝ KHI NHẬP SỐ HỢP LỆ (> 0): Gọi API cập nhật số lượng lên hệ thống
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8080/cart-details/${item.id}/update-quantity`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity: finalQty }),
            });

            const data = await res.json();
            if (res.ok) {
                // Đồng bộ lại toàn bộ dữ liệu giỏ hàng chi tiết và tổng tiền
                hanldeFetchCart();
                if (user?.id) fetchCart();
                window.dispatchEvent(new Event("cartUpdated"));
            } else {
                toast.error(data.message || "Không thể cập nhật số lượng");
                hanldeFetchCart();
            }
        } catch (err) {
            console.error("Lỗi cập nhật số lượng nhập tay: ", err);
            hanldeFetchCart();
        }
    };

    useEffect(() => {
        if (cart?.id) {
            hanldeFetchCart();
        }
    }, [cart]);

    const summary = calculateSummary(cartItems);

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.warning("Giỏ hàng rỗng!!!");
        } else if (select.length === 0) {
            toast.warning("Vui lòng chọn sản phẩm muốn thanh toán!!!");
        } else {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            navigate("/checkout", {
                state: { userId: user.id, select: select, cartId: cart.id, },
            });
        }
    };

    return (
        <div className="min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-10">
                            <h1 className="text-4xl font-bold text-gray-900">Cart</h1>
                            <span className="text-sm font-semibold text-gray-500 cursor-pointer hover:text-red-500">
                🔍︎ Track Order
              </span>
                        </div>
                        <div className="grid grid-cols-6 font-semibold border-b pb-3 text-gray-700 text-sm uppercase">
                            <div className="col-span-3">Item</div>
                            <div className="text-center">Quantity</div>
                            <div className="text-right">Unit Price</div>
                            <div className="text-center"></div>
                        </div>
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-6 items-center border-b py-6"
                                >
                                    <div className="col-span-3 flex items-start space-x-4">
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={() => handleToggleSelect(item.id)}
                                            className="mt-2 w-4 h-4 border-gray-300 rounded"
                                        />

                                        <img
                                            src={item.productImage}
                                            alt={item.productName}
                                            className="w-24 h-24 object-cover rounded"
                                        />

                                        <div className="flex flex-col">
                                            <div className="font-semibold text-base hover:text-red-500">
                                                {item.productName}
                                            </div>
                                            <div className="text-gray-500 text-sm">
                                                {item.productName ? item.productName.split(",")[0] : ""}
                                            </div>
                                            <div className="text-gray-500 text-sm">
                                                Size: {item.sizeName}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center border border-gray-300 rounded-full w-24 mx-auto p-1">
                                            <button
                                                className="text-lg px-2 hover:bg-gray-100 rounded-full"
                                                onClick={() =>
                                                    // handleToggleDecrease(item.id, item.priceAtTime)
                                                    // Truyền thêm item.quantity và item.subtotal vào hàm
                                                    handleToggleDecrease(item.id, item.priceAtTime, item.quantity, item.subtotal)
                                                }
                                            >
                                                -
                                            </button>

                                            {/*<input*/}
                                            {/*    type="number"*/}
                                            {/*    value={item.quantity}*/}
                                            {/*    min="1"*/}
                                            {/*    readOnly*/}
                                            {/*    className="w-10 text-center text-sm bg-transparent"*/}
                                            {/*/>*/}

                                             {/*MỚI*/}
                                            {/*<input*/}
                                            {/*    type="number"*/}
                                            {/*    value={item.quantity}*/}
                                            {/*    min="1"*/}
                                            {/*    // Giả sử backend trả về trường số lượng tồn kho nằm trong 'item.stock' hoặc 'item.sizeQuantity'*/}
                                            {/*    // Bạn hãy thay 'item.stock' bằng tên biến thực tế trong API của bạn*/}
                                            {/*    onChange={(e) => handleQuantityChange(item.id, e.target.value, item.stock)}*/}
                                            {/*    onBlur={() => handleBlurQuantity(item)}*/}
                                            {/*    onKeyDown={(e) => {*/}
                                            {/*        if (e.key === 'Enter') {*/}
                                            {/*            e.target.blur(); // Tự động trigger onBlur khi bấm Enter*/}
                                            {/*        }*/}
                                            {/*    }}*/}
                                            {/*    className="w-12 text-center text-sm bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"*/}
                                            {/*/>*/}

                                            {/* ĐOẠN CODE MỚI ĐÃ CẬP NHẬT */}
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                min="0" // Cho phép gõ số 0

                                                // // Giả sử backend trả về số lượng kho ở biến 'item.stock'. Bạn hãy đổi tên biến này nếu cần.
                                                // onChange={(e) => handleQuantityChange(item.id, e.target.value, item.stock)}
                                                //
                                                // onFocus={() => {
                                                //     // Trước khi người dùng sửa, lưu ngay số lượng và subtotal gốc vào bộ nhớ tạm
                                                //     setEditingItemData((prev) => ({
                                                //         ...prev,
                                                //         [item.id]: { quantity: item.quantity, subtotal: item.subtotal }
                                                //     }));
                                                // }}
                                                // Truyền item.stock (số lượng kho thực tế) vào hàm kiểm tra
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value, item.stock)}
                                                onFocus={() => {
                                                    setEditingItemData((prev) => ({
                                                        ...prev,
                                                        [item.id]: { quantity: item.quantity, subtotal: item.subtotal }
                                                    }));
                                                }}
                                                onBlur={() => handleBlurQuantity(item)}

                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.target.blur(); // Tự động kích hoạt hành động rời chuột (onBlur) khi nhấn Enter
                                                    }
                                                }}

                                                // Class CSS giúp ẩn hoàn toàn 2 nút mũi tên tăng giảm mặc định của trình duyệt đối với kiểu input number
                                                className="w-10 text-center text-sm bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />

                                            <button
                                                className="text-lg px-2 hover:bg-gray-100 rounded-full"
                                                onClick={() =>
                                                    handleToggleIncrease(item.id, item.priceAtTime)
                                                }
                                            >
                                                +
                                            </button>
                                            {/*<button*/}
                                            {/*    className="text-lg px-2 hover:bg-gray-100 rounded-full"*/}
                                            {/*    onClick={() => {*/}
                                            {/*        // Thay 'item.stock' bằng tên biến tồn kho thực tế của bạn*/}
                                            {/*        if (item.quantity >= (item.stock || 99)) {*/}
                                            {/*            toast.error("Số lượng đã đạt giới hạn tồn kho!");*/}
                                            {/*            return;*/}
                                            {/*        }*/}
                                            {/*        handleToggleIncrease(item.id, item.priceAtTime);*/}
                                            {/*    }}*/}
                                            {/*>*/}
                                            {/*    +*/}
                                            {/*</button>*/}
                                        </div>
    {/*                                    <span className="text-[11px] text-gray-500 font-medium tracking-wide bg-gray-100 px-2 py-0.5 rounded-full">*/}
    {/*    Còn lại: {item.stock ?? 0} sản phẩm*/}
    {/*</span>*/}
                                        <span className="text-[11px] text-gray-500 font-medium tracking-wide bg-gray-100 px-2 py-0.5 rounded-full">
        Còn lại: {item.stock ?? 0} sản phẩm
    </span>
                                    </div>
                                    <div className="text-right font-semibold text-lg">
                                        {formatVND(item.subtotal)}
                                    </div>
                                    <div className="text-center">
                                        <button
                                            onClick={() =>
                                                handleDelete(item.id, item.quantity, item.subtotal)
                                            }
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                Cart is empty.
                            </div>
                        )}

                        <div className="mt-8 flex justify-start">
                            <button
                                onClick={() => navigate("/product")}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md transition font-semibold hover:bg-black hover:text-white"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-1 border-t-4 border-red-500 p-6 rounded-lg bg-gray-50 shadow-md h-fit">
                        <h2 className="text-3xl font-bold mb-6 text-red-500">Summary</h2>

                        <div className="mb-6 pb-4 border-b">
                            <div className="flex">
                                <input
                                    type="text"
                                    placeholder="Discount Code"
                                    className="flex-grow border border-gray-300 p-3 rounded-l focus:outline-none focus:ring-1 focus:ring-gray-400"
                                />
                                <button className="bg-black text-white px-4 py-3 rounded-r font-semibold hover:bg-gray-800 transition">
                                    Apply
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-lg text-gray-800">
                                <span>Subtotal:</span>
                                <span className="font-semibold">
                  {formatVND(summary.subtotal)}
                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping fee:</span>
                                <span>{summary.shippingText}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Discount:</span>
                                <span>{formatVND(summary.discount)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-xl border-t pt-4">
                            <span>Total:</span>
                            <span className="text-red-500">{formatVND(summary.total)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full mt-8 bg-black text-white py-3 rounded font-bold text-lg hover:bg-gray-800 transition shadow-lg"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
            <ChatBot/>
      <Contact/>
        </div>
    );
};

export default Cart;
