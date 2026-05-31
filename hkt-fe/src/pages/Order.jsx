// import React, { useState, useEffect } from "react";
// import {
//   Package,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Truck,
//   DollarSign,
//   CheckCircle2,
//   ListChecks,
// } from "lucide-react";
// import { useNavigate } from "react-router";
// import { toast } from "sonner";
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const Order = () => {
//   const [activeTab, setActiveTab] = useState("all");
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const userId = localStorage.getItem("userId");
//   const navigate = useNavigate();
//
//   const fetchOrders = async () => {
//     try {
//       const token = localStorage.getItem("accessToken");
//
//       const res = await fetch(`${BASE_URL}/orders/account/${userId}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//
//       const data = await res.json();
//       setOrders(data);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   useEffect(() => {
//     fetchOrders();
//   }, []);
//
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(price);
//   };
//
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };
//
//   const getStatusInfo = (status) => {
//     const statusMap = {
//       PENDING: {
//         label: "Pending Confirmation",
//         color: "text-yellow-600",
//         bgColor: "bg-yellow-50",
//         icon: <Clock size={16} />,
//       },
//       CONFIRMED: {
//         label: "Confirmed",
//         color: "text-blue-600",
//         bgColor: "bg-blue-50",
//         icon: <CheckCircle size={16} />,
//       },
//       SHIPPING: {
//         label: "Shipping",
//         color: "text-purple-600",
//         bgColor: "bg-purple-50",
//         icon: <Truck size={16} />,
//       },
//       COMPLETED: {
//         label: "Completed",
//         color: "text-green-600",
//         bgColor: "bg-green-50",
//         icon: <CheckCircle size={16} />,
//       },
//       CANCELLED: {
//         label: "Cancelled",
//         color: "text-red-600",
//         bgColor: "bg-red-50",
//         icon: <XCircle size={16} />,
//       },
//     };
//     return statusMap[status] || statusMap.PENDING;
//   };
//
//   const getPaymentMethodLabel = (method) => {
//     const methodMap = {
//       COD: "Cash on Delivery",
//       BANKING: "Bank Transfer",
//       MOMO: "MoMo Wallet",
//       VNPAY: "VNPAY",
//     };
//     return methodMap[method] || method;
//   };
//
//   const getFilteredOrders = () => {
//     if (activeTab === "all") return orders;
//     if (activeTab === "pending")
//       return orders.filter((o) => o.statusOrder === "PENDING");
//     if (activeTab === "confirmed")
//       return orders.filter((o) => o.statusOrder === "CONFIRMED");
//     return orders;
//   };
//
//   const filteredOrders = getFilteredOrders();
//
//   const handleCancel = async (id) => {
//     toast(
//       (t) => (
//         <div className="p-3">
//           <p className="font-semibold text-sm text-gray-900 flex items-center gap-2">
//             <span className="text-red-500 text-sm">⚠️</span>
//             Are you sure you want to cancel this order?
//           </p>
//           <div className="flex gap-3 mt-4 justify-start">
//             <button
//               className="
//             px-4 py-2
//             bg-red-500 text-white
//             rounded-md
//             hover:bg-red-600
//             transition
//             font-medium
//             shadow-sm
//           "
//               onClick={async () => {
//                 toast.dismiss(t);
//
//                 try {
//                   const token = localStorage.getItem("accessToken");
//
//                   await fetch(`${BASE_URL}/orders/status/${id}`, {
//                     method: "PUT",
//                     headers: {
//                       "Content-Type": "application/json",
//                       Authorization: `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({ statusOrder: "CANCELLED" }),
//                   });
//
//                   await fetchOrders();
//
//                   toast.success("Cancel successful!!!");
//                 } catch (error) {
//                   toast.error("Error to cancel!");
//                 }
//               }}
//             >
//               Cancel
//             </button>
//             <button
//               className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-medium"
//               onClick={() => toast.dismiss(t)}
//             >
//               No
//             </button>
//           </div>
//         </div>
//       ),
//       {
//         duration: Infinity,
//         className: "shadow-lg rounded-xl border border-gray-200",
//       },
//     );
//   };
//
//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6">
//         <div className="mb-8">
//           <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Orders</h1>
//           <p className="text-gray-600">Manage and track your orders</p>
//         </div>
//
//         <div className="flex justify-center mb-10">
//           <div className="w-full bg-white rounded-full shadow-lg p-1 flex gap-1 justify-between border border-gray-200">
//             {[
//               { key: "all", label: "All", icon: <ListChecks size={18} /> },
//               {
//                 key: "pending",
//                 label: "Pending",
//                 icon: <Clock size={18} />,
//               },
//               {
//                 key: "confirmed",
//                 label: "Confirmed",
//                 icon: <CheckCircle2 size={18} />,
//               },
//             ].map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setActiveTab(tab.key)}
//                 className={`
//                   flex-1 px-8 py-3 rounded-full font-semibold text-base
//                   flex items-center justify-center gap-2
//                   transition-all duration-300 ease-in-out
//                   ${
//                     activeTab === tab.key
//                       ? "bg-black text-white shadow-md scale-[1.03]"
//                       : "text-gray-700 hover:bg-gray-100 hover:text-black"
//                   }
//                 `}
//               >
//                 {tab.icon}
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>
//
//         {loading ? (
//           <div className="text-center py-12">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
//           </div>
//         ) : filteredOrders.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
//               <Package size={40} className="text-gray-400" />
//             </div>
//             <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
//             <p className="text-gray-600 mb-6">
//               You currently have no orders in this section
//             </p>
//             <button
//               onClick={() => (window.location.href = "/product")}
//               className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-red-500 transition"
//             >
//               Shop Now
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredOrders.map((order) => {
//               const statusInfo = getStatusInfo(order.statusOrder);
//               return (
//                 <div
//                   key={order.id}
//                   className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
//                 >
//                   <div className="p-4 sm:p-6 border-b border-gray-100">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
//                       <div className="text-sm">
//                         <p className="font-semibold text-gray-900">
//                           Order Code: {order.orderCode}
//                         </p>
//                         <p className="text-gray-600 mt-1">
//                           Order Date: {formatDate(order.orderDate)}
//                         </p>
//                       </div>
//
//                       <div
//                         className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.color} text-sm font-medium`}
//                       >
//                         {statusInfo.icon}
//                         <span>{statusInfo.label}</span>
//                       </div>
//                     </div>
//
//                     <div className="bg-gray-50 rounded-lg p-4 text-sm">
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                         <div>
//                           <span className="text-gray-600">Receiver: </span>
//                           <span className="font-medium">
//                             {order.customerTrading.receiverName}
//                           </span>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Phone: </span>
//                           <span className="font-medium">
//                             {order.customerTrading.receiverPhone}
//                           </span>
//                         </div>
//                         <div className="sm:col-span-2">
//                           <span className="text-gray-600">Address: </span>
//                           <span className="font-medium">
//                             {order.customerTrading.receiverAddress}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <DollarSign size={16} className="text-gray-600" />
//                           <span className="font-medium">
//                             {getPaymentMethodLabel(order.paymentMethod)}
//                           </span>
//                         </div>
//                       </div>
//
//                       {order.note && (
//                         <div className="mt-2 pt-2 border-t border-gray-200">
//                           <span className="text-gray-600">Note: </span>
//                           <span className="font-medium italic">
//                             {order.note}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//
//                   <div className="p-4 sm:p-6">
//                     <div className="space-y-4">
//                       {order.orderDetails.map((detail) => (
//                         <div key={detail.id} className="flex gap-4">
//                           <div className="flex-1 min-w-0">
//                             <h4
//                               className="font-semibold text-gray-900 line-clamp-2 hover:text-red-500"
//                               onClick={() =>
//                                 navigate(`/product/${detail.productId}`)
//                               }
//                             >
//                               {detail.productName}
//                             </h4>
//                             <p className="text-sm text-gray-600 mt-1">
//                               Quantity: {detail.quantity}
//                             </p>
//                             <p className="text-red-500 font-bold mt-1">
//                               {formatPrice(detail.unitPrice)}
//                             </p>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-sm text-gray-600">Total Price</p>
//                             <p className="text-red-500 font-bold">
//                               {formatPrice(detail.quantity * detail.unitPrice)}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                       <div className="flex gap-4">
//                         <div className="flex-1 min-w-0">
//                           <h4 className="font-semibold text-gray-900 line-clamp-2">
//                             Shopping fee
//                           </h4>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-red-500 font-bold">
//                             {formatPrice(30000)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//
//                     <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                       <div className="text-right sm:text-left">
//                         <p className="text-sm text-gray-600">Total Amount:</p>
//                         <p className="text-2xl font-bold text-red-500">
//                           {formatPrice(
//                             order.orderDetails.reduce(
//                               (sum, detail) => sum + detail.totalPrice,
//                               0,
//                             ) + 30000,
//                           )}
//                         </p>
//                       </div>
//
//                       <div className="flex gap-3 flex-wrap">
//                         {order.statusOrder === "PENDING" && (
//                           <button
//                             className="px-6 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition"
//                             onClick={() => handleCancel(order.id)}
//                           >
//                             Cancel Order
//                           </button>
//                         )}
//
//                         {order.statusOrder === "COMPLETED" && (
//                           <button className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition">
//                             Buy Again
//                           </button>
//                         )}
//
//                         {order.statusOrder === "SHIPPING" && (
//                           <button className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition">
//                             Track Order
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
//
// export default Order;
// File: src/pages/Order.jsx

// import React, { useState, useEffect } from "react";
// import { Package, Clock, CheckCircle, XCircle, Truck, CheckCircle2, ListChecks } from "lucide-react";
// import { useNavigate } from "react-router";
// import { toast } from "sonner";
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const Order = () => {
//     const [activeTab, setActiveTab] = useState("all");
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const userId = localStorage.getItem("userId");
//     const navigate = useNavigate();
//
//     const fetchOrders = async () => {
//         try {
//             const token = localStorage.getItem("accessToken");
//             const res = await fetch(`${BASE_URL}/orders/account/${userId}`, {
//                 headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//             });
//             const data = await res.json();
//             setOrders(data);
//         } catch (error) {
//             console.error("Error fetching orders:", error);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     useEffect(() => { fetchOrders(); }, []);
//
//     const formatPrice = (price) => {
//         return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
//     };
//
//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
//     };
//
//     const getStatusInfo = (status) => {
//         const statusMap = {
//             PENDING: { label: "Pending", color: "text-[#c8a96e]", borderColor: "border-[#c8a96e]", icon: <Clock size={14} /> },
//             CONFIRMED: { label: "Confirmed", color: "text-blue-600", borderColor: "border-blue-600", icon: <CheckCircle size={14} /> },
//             SHIPPING: { label: "Shipping", color: "text-purple-600", borderColor: "border-purple-600", icon: <Truck size={14} /> },
//             COMPLETED: { label: "Completed", color: "text-green-600", borderColor: "border-green-600", icon: <CheckCircle size={14} /> },
//             CANCELLED: { label: "Cancelled", color: "text-red-500", borderColor: "border-red-500", icon: <XCircle size={14} /> },
//         };
//         return statusMap[status] || statusMap.PENDING;
//     };
//
//     const getPaymentMethodLabel = (method) => {
//         const methodMap = { COD: "Cash on Delivery", BANKING: "Bank Transfer", MOMO: "MoMo Wallet", VNPAY: "VNPAY" };
//         return methodMap[method] || method;
//     };
//
//     const getFilteredOrders = () => {
//         if (activeTab === "all") return orders;
//         if (activeTab === "pending") return orders.filter((o) => o.statusOrder === "PENDING");
//         if (activeTab === "confirmed") return orders.filter((o) => o.statusOrder === "CONFIRMED");
//         return orders;
//     };
//
//     const filteredOrders = getFilteredOrders();
//
//     const handleCancel = async (id) => {
//         toast((t) => (
//             <div className="p-2 font-sans">
//                 <p className="font-semibold text-sm text-[#1a1a1a] mb-4">Are you sure you want to cancel this order?</p>
//                 <div className="flex gap-3">
//                     <button className="flex-1 bg-red-600 text-white py-2 text-[0.7rem] uppercase tracking-widest font-bold transition-colors hover:bg-red-700"
//                             onClick={async () => {
//                                 toast.dismiss(t);
//                                 try {
//                                     const token = localStorage.getItem("accessToken");
//                                     await fetch(`${BASE_URL}/orders/status/${id}`, {
//                                         method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//                                         body: JSON.stringify({ statusOrder: "CANCELLED" }),
//                                     });
//                                     await fetchOrders();
//                                     toast.success("Order cancelled successfully.");
//                                 } catch (error) { toast.error("Error to cancel!"); }
//                             }}>Cancel Order</button>
//                     <button className="flex-1 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] py-2 text-[0.7rem] uppercase tracking-widest font-bold transition-colors hover:bg-[#1a1a1a] hover:text-white"
//                             onClick={() => toast.dismiss(t)}>No</button>
//                 </div>
//             </div>
//         ), { duration: Infinity, className: "rounded-none border border-[#1a1a1a] shadow-xl" });
//     };
//
//     return (
//         <div className="min-h-screen bg-[#faf9f7] py-12 px-4 sm:px-6 lg:px-8 font-sans">
//             <div className="max-w-5xl mx-auto">
//
//                 <h1 className="font-serif text-4xl text-[#1a1a1a] mb-8">My Orders</h1>
//
//                 {/* TABS */}
//                 <div className="flex gap-6 sm:gap-10 border-b border-[#e8e4df] mb-10 overflow-x-auto hide-scrollbar">
//                     {[
//                         { key: "all", label: "All Orders", icon: <ListChecks size={16} /> },
//                         { key: "pending", label: "Pending", icon: <Clock size={16} /> },
//                         { key: "confirmed", label: "Confirmed", icon: <CheckCircle2 size={16} /> },
//                     ].map((tab) => (
//                         <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 pb-4 text-[0.72rem] uppercase tracking-[0.15em] font-medium transition-colors whitespace-nowrap relative ${activeTab === tab.key ? "text-[#1a1a1a]" : "text-[#888] hover:text-[#1a1a1a]"}`}>
//                             {tab.icon} {tab.label}
//                             {activeTab === tab.key && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1a1a1a]" />}
//                         </button>
//                     ))}
//                 </div>
//
//                 {loading ? (
//                     <div className="flex justify-center py-20">
//                         <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin"></div>
//                     </div>
//                 ) : filteredOrders.length === 0 ? (
//                     <div className="text-center py-24 bg-white border border-[#e8e4df]">
//                         <Package size={48} className="mx-auto text-[#e8e4df] mb-4" strokeWidth={1} />
//                         <h3 className="text-lg font-serif text-[#1a1a1a] mb-2">No Orders Found</h3>
//                         <p className="text-[#888] text-sm mb-8">You currently have no orders in this section.</p>
//                         <button onClick={() => navigate("/product")} className="bg-[#1a1a1a] text-[#faf9f7] px-8 py-3 text-[0.7rem] uppercase tracking-[0.15em] hover:bg-[#333] transition-colors">
//                             Continue Shopping
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="space-y-8">
//                         {filteredOrders.map((order) => {
//                             const statusInfo = getStatusInfo(order.statusOrder);
//                             return (
//                                 <div key={order.id} className="bg-white border border-[#e8e4df] p-6 lg:p-8 hover:border-[#1a1a1a] transition-colors duration-300">
//
//                                     {/* ORDER HEADER */}
//                                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-[#e8e4df]">
//                                         <div>
//                                             <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-1">Order #{order.orderCode}</p>
//                                             <p className="text-sm text-[#1a1a1a] font-medium">{formatDate(order.orderDate)}</p>
//                                         </div>
//                                         <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 border ${statusInfo.borderColor} ${statusInfo.color} text-[0.65rem] font-bold uppercase tracking-widest`}>
//                                             {statusInfo.icon} {statusInfo.label}
//                                         </div>
//                                     </div>
//
//                                     {/* SHIPPING INFO */}
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//                                         <div>
//                                             <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-3">Shipping Info</p>
//                                             <p className="text-sm text-[#1a1a1a] font-semibold mb-1">{order.customerTrading.receiverName}</p>
//                                             <p className="text-sm text-[#888] mb-1">{order.customerTrading.receiverPhone}</p>
//                                             <p className="text-sm text-[#888]">{order.customerTrading.receiverAddress}</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-3">Payment Method</p>
//                                             <p className="text-sm text-[#1a1a1a] font-medium mb-4">{getPaymentMethodLabel(order.paymentMethod)}</p>
//                                             {order.note && (
//                                                 <>
//                                                     <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-2">Note</p>
//                                                     <p className="text-sm text-[#1a1a1a] italic">{order.note}</p>
//                                                 </>
//                                             )}
//                                         </div>
//                                     </div>
//
//                                     {/* ORDER ITEMS */}
//                                     <div className="mb-6">
//                                         <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-4">Items</p>
//                                         <div className="space-y-4">
//                                             {order.orderDetails.map((detail) => (
//                                                 <div key={detail.id} className="flex justify-between items-center text-sm">
//                                                     <div className="flex-1 pr-4">
//                                                         <span onClick={() => navigate(`/product/${detail.productId}`)} className="text-[#1a1a1a] font-semibold cursor-pointer hover:text-[#c8a96e] transition-colors">{detail.productName}</span>
//                                                         <span className="text-[#888] ml-2">x{detail.quantity}</span>
//                                                     </div>
//                                                     <div className="text-[#1a1a1a]">{formatPrice(detail.quantity * detail.unitPrice)}</div>
//                                                 </div>
//                                             ))}
//                                             <div className="flex justify-between items-center text-sm pt-4 border-t border-[#f0ece6] text-[#888]">
//                                                 <span>Shipping Fee</span>
//                                                 <span>{formatPrice(30000)}</span>
//                                             </div>
//                                         </div>
//                                     </div>
//
//                                     {/* FOOTER & ACTIONS */}
//                                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-[#1a1a1a] gap-4">
//                                         <div>
//                                             <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-1">Total Amount</p>
//                                             <p className="text-xl font-serif text-[#1a1a1a]">{formatPrice(order.orderDetails.reduce((sum, detail) => sum + detail.totalPrice, 0) + 30000)}</p>
//                                         </div>
//
//                                         <div className="flex gap-3 w-full sm:w-auto">
//                                             {order.statusOrder === "PENDING" && (
//                                                 <button onClick={() => handleCancel(order.id)} className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-[0.7rem] uppercase tracking-widest font-bold">
//                                                     Cancel Order
//                                                 </button>
//                                             )}
//                                             {order.statusOrder === "COMPLETED" && (
//                                                 <button onClick={() => navigate("/product")} className="w-full sm:w-auto px-6 py-3 bg-[#1a1a1a] text-[#faf9f7] hover:bg-[#333] transition-colors text-[0.7rem] uppercase tracking-widest font-bold">
//                                                     Buy Again
//                                                 </button>
//                                             )}
//                                             {order.statusOrder === "SHIPPING" && (
//                                                 <button className="w-full sm:w-auto px-6 py-3 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors text-[0.7rem] uppercase tracking-widest font-bold">
//                                                     Track Order
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default Order;
import React, { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, Truck, CheckCircle2, ListChecks } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Order = () => {
    const [activeTab, setActiveTab] = useState("all");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy userId an toàn
    const userStr = localStorage.getItem("user");
    const userId = userStr ? JSON.parse(userStr).id : localStorage.getItem("userId");

    const navigate = useNavigate();

    const fetchOrders = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${BASE_URL}/orders/account/${userId}`, {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            // Kiểm tra dữ liệu an toàn
            if (res.ok) {
                setOrders(Array.isArray(data) ? data : (data.result || []));
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [userId]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            PENDING: { label: "Pending", color: "text-[#c8a96e]", borderColor: "border-[#c8a96e]", icon: <Clock size={14} /> },
            CONFIRMED: { label: "Confirmed", color: "text-blue-600", borderColor: "border-blue-600", icon: <CheckCircle size={14} /> },
            SHIPPING: { label: "Shipping", color: "text-purple-600", borderColor: "border-purple-600", icon: <Truck size={14} /> },
            COMPLETED: { label: "Completed", color: "text-green-600", borderColor: "border-green-600", icon: <CheckCircle size={14} /> },
            CANCELLED: { label: "Cancelled", color: "text-red-500", borderColor: "border-red-500", icon: <XCircle size={14} /> },
        };
        return statusMap[status] || statusMap.PENDING;
    };

    const getPaymentMethodLabel = (method) => {
        const methodMap = { COD: "Cash on Delivery", BANKING: "Bank Transfer", MOMO: "MoMo Wallet", VNPAY: "VNPAY" };
        return methodMap[method] || method;
    };

    const getFilteredOrders = () => {
        if (activeTab === "all") return orders;
        if (activeTab === "pending") return orders.filter((o) => o.statusOrder === "PENDING");
        if (activeTab === "confirmed") return orders.filter((o) => o.statusOrder === "CONFIRMED");
        return orders;
    };

    const filteredOrders = getFilteredOrders();

    const handleCancel = async (id) => {
        toast((t) => (
            <div className="p-2 font-sans">
                <p className="font-semibold text-sm text-[#1a1a1a] mb-4">Are you sure you want to cancel this order?</p>
                <div className="flex gap-3">
                    <button className="flex-1 bg-red-600 text-white py-2 text-[0.7rem] uppercase tracking-widest font-bold transition-colors hover:bg-red-700"
                            onClick={async () => {
                                toast.dismiss(t);
                                try {
                                    const token = localStorage.getItem("accessToken");
                                    await fetch(`${BASE_URL}/orders/status/${id}`, {
                                        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ statusOrder: "CANCELLED" }),
                                    });
                                    await fetchOrders();
                                    toast.success("Order cancelled successfully.");
                                } catch (error) { toast.error("Error to cancel!"); }
                            }}>Cancel Order</button>
                    <button className="flex-1 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] py-2 text-[0.7rem] uppercase tracking-widest font-bold transition-colors hover:bg-[#1a1a1a] hover:text-white"
                            onClick={() => toast.dismiss(t)}>No</button>
                </div>
            </div>
        ), { duration: Infinity, className: "rounded-none border border-[#1a1a1a] shadow-xl" });
    };

    return (
        <div className="min-h-screen bg-[#faf9f7] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <h1 className="font-serif text-4xl text-[#1a1a1a] mb-8">My Orders</h1>

                <div className="flex gap-6 sm:gap-10 border-b border-[#e8e4df] mb-10 overflow-x-auto hide-scrollbar">
                    {[
                        { key: "all", label: "All Orders", icon: <ListChecks size={16} /> },
                        { key: "pending", label: "Pending", icon: <Clock size={16} /> },
                        { key: "confirmed", label: "Confirmed", icon: <CheckCircle2 size={16} /> },
                    ].map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 pb-4 text-[0.72rem] uppercase tracking-[0.15em] font-medium transition-colors whitespace-nowrap relative ${activeTab === tab.key ? "text-[#1a1a1a]" : "text-[#888] hover:text-[#1a1a1a]"}`}>
                            {tab.icon} {tab.label}
                            {activeTab === tab.key && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1a1a1a]" />}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-24 bg-white border border-[#e8e4df]">
                        <Package size={48} className="mx-auto text-[#e8e4df] mb-4" strokeWidth={1} />
                        <h3 className="text-lg font-serif text-[#1a1a1a] mb-2">No Orders Found</h3>
                        <p className="text-[#888] text-sm mb-8">You currently have no orders in this section.</p>
                        <button onClick={() => navigate("/product")} className="bg-[#1a1a1a] text-[#faf9f7] px-8 py-3 text-[0.7rem] uppercase tracking-[0.15em] hover:bg-[#333] transition-colors">
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {filteredOrders.map((order) => {
                            const statusInfo = getStatusInfo(order.statusOrder);
                            return (
                                <div key={order.id} className="bg-white border border-[#e8e4df] p-6 lg:p-8 hover:border-[#1a1a1a] transition-colors duration-300">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-[#e8e4df]">
                                        <div>
                                            <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-1">Order #{order.orderCode}</p>
                                            <p className="text-sm text-[#1a1a1a] font-medium">{formatDate(order.orderDate)}</p>
                                        </div>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 border ${statusInfo.borderColor} ${statusInfo.color} text-[0.65rem] font-bold uppercase tracking-widest`}>
                                            {statusInfo.icon} {statusInfo.label}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-3">Shipping Info</p>
                                            <p className="text-sm text-[#1a1a1a] font-semibold mb-1">{order.customerTrading.receiverName}</p>
                                            <p className="text-sm text-[#888] mb-1">{order.customerTrading.receiverPhone}</p>
                                            <p className="text-sm text-[#888]">{order.customerTrading.receiverAddress}</p>
                                        </div>
                                        <div>
                                            <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-3">Payment Method</p>
                                            <p className="text-sm text-[#1a1a1a] font-medium mb-4">{getPaymentMethodLabel(order.paymentMethod)}</p>
                                            {order.note && (
                                                <>
                                                    <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-2">Note</p>
                                                    <p className="text-sm text-[#1a1a1a] italic">{order.note}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-4">Items</p>
                                        <div className="space-y-4">
                                            {order.orderDetails.map((detail) => (
                                                <div key={detail.id} className="flex justify-between items-center text-sm">
                                                    <div className="flex-1 pr-4">
                                                        <span onClick={() => navigate(`/product/${detail.productId}`)} className="text-[#1a1a1a] font-semibold cursor-pointer hover:text-[#c8a96e] transition-colors">{detail.productName}</span>
                                                        <span className="text-[#888] ml-2">x{detail.quantity}</span>
                                                    </div>
                                                    <div className="text-[#1a1a1a]">{formatPrice(detail.quantity * detail.unitPrice)}</div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center text-sm pt-4 border-t border-[#f0ece6] text-[#888]">
                                                <span>Shipping Fee</span>
                                                <span>{formatPrice(30000)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-[#1a1a1a] gap-4">
                                        <div>
                                            <p className="text-[0.65rem] text-[#888] tracking-[0.15em] uppercase mb-1">Total Amount</p>
                                            <p className="text-xl font-serif text-[#1a1a1a]">{formatPrice(order.orderDetails.reduce((sum, detail) => sum + detail.totalPrice, 0) + 30000)}</p>
                                        </div>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            {order.statusOrder === "PENDING" && (
                                                <button onClick={() => handleCancel(order.id)} className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-[0.7rem] uppercase tracking-widest font-bold">
                                                    Cancel Order
                                                </button>
                                            )}
                                            {order.statusOrder === "COMPLETED" && (
                                                <button onClick={() => navigate("/product")} className="w-full sm:w-auto px-6 py-3 bg-[#1a1a1a] text-[#faf9f7] hover:bg-[#333] transition-colors text-[0.7rem] uppercase tracking-widest font-bold">
                                                    Buy Again
                                                </button>
                                            )}
                                            {order.statusOrder === "SHIPPING" && (
                                                <button className="w-full sm:w-auto px-6 py-3 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors text-[0.7rem] uppercase tracking-widest font-bold">
                                                    Track Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Order;