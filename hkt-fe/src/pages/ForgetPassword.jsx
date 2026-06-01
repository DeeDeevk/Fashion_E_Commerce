// import React from "react";
// import { useNavigate } from "react-router";
// import { useState } from "react";
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const ForgotPassword = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//
//   const handleForgotPassword = async () => {
//     if (!email) {
//       alert("Please enter your email!");
//       return;
//     }
//
//     setLoading(true);
//
//     try {
//       const response = await fetch(
//         `${BASE_URL}/auth/forgot-password`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ email: email }),
//         },
//       );
//
//       const data = await response.json();
//       if (response.ok) {
//         sessionStorage.setItem("resetToken", data.result.token);
//         sessionStorage.setItem("otp", data.result.otp);
//
//         alert("OTP has been sent to your email. Please check!");
//
//         navigate("/reset_password");
//       } else {
//         alert(data.message || "Email does not exist or system error!");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Unable to connect to Server!");
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
//       <div className="bg-gray-100 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
//         {/* Left side - Form */}
//         <div className="p-8 md:p-12">
//           <h2 className="font-bold text-4xl mb-3">Forget Password?</h2>
//           <p className="text-gray-600 mb-8 text-sm">
//             Enter your email to receive a password reset link
//           </p>
//
//           <div className="grid gap-6">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <svg
//                   className="w-5 h-5 text-gray-600"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                   />
//                 </svg>
//                 <label className="text-gray-700 font-medium">Email:</label>
//               </div>
//               <div className="relative">
//                 <input
//                   type="email"
//                   name="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-400 transition"
//                   placeholder="Nhập email của bạn..."
//                 />
//                 <span className="absolute right-3 top-3 text-red-500">*</span>
//               </div>
//             </div>
//
//             <div className="flex gap-3 items-center mt-2 flex-wrap sm:flex-nowrap">
//               <button
//                 type="button"
//                 className="px-6 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition whitespace-nowrap"
//                 onClick={() => {
//                   navigate("/login");
//                 }}
//               >
//                 Sign In
//               </button>
//               <button
//                 type="button"
//                 className="px-6 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition whitespace-nowrap"
//                 onClick={() => {
//                   navigate("/register");
//                 }}
//               >
//                 Sign Up
//               </button>
//             </div>
//
//             <button
//               type="button"
//               onClick={handleForgotPassword}
//               disabled={loading}
//               className={`w-full py-4 rounded-lg text-white font-bold text-lg transition mt-4 ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
//             >
//               {loading ? "ĐANG GỬI..." : "GỬI MÃ XÁC NHẬN"}
//             </button>
//           </div>
//         </div>
//
//         {/* Right side - Image */}
//         <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-red-400 to-red-500 p-12">
//           <div className="relative">
//             <div className="absolute inset-0 bg-red-300 rounded-full blur-3xl opacity-50"></div>
//             <img
//               src="https://i.postimg.cc/J0TgG6NZ/Thiet-ke-chua-co-ten-(6).png"
//               alt="Profile"
//               className="relative rounded-full w-80 h-80 object-cover border-8 border-white shadow-2xl"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default ForgotPassword;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { ArrowRight } from "lucide-react";
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const ForgetPassword = () => {
//     const navigate = useNavigate();
//     const [email, setEmail] = useState("");
//     const [loading, setLoading] = useState(false);
//
//     const handleForgotPassword = async () => {
//         if (!email) {
//             toast.warning("Please enter your email!");
//             return;
//         }
//
//         setLoading(true);
//
//         try {
//             const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ email: email }),
//             });
//
//             const data = await response.json();
//             if (response.ok) {
//                 sessionStorage.setItem("resetToken", data.result.token);
//                 sessionStorage.setItem("otp", data.result.otp);
//
//                 toast.success("OTP has been sent to your email. Please check!");
//                 navigate("/reset_password");
//             } else {
//                 toast.error(data.message || "Email does not exist or system error!");
//             }
//         } catch (error) {
//             console.error("Error:", error);
//             toast.error("Unable to connect to Server!");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     return (
//         <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4 lg:p-8 font-sans">
//             <div className="max-w-5xl w-full flex flex-col md:flex-row bg-white border border-[#e8e4df] shadow-2xl">
//
//                 {/* L E F T   S I D E */}
//                 <div className="md:w-1/2 relative hidden md:block border-r border-[#e8e4df]">
//                     <img
//                         src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2074&auto=format&fit=crop"
//                         alt="Fashion Editorial"
//                         className="absolute inset-0 w-full h-full object-cover grayscale-[20%]"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
//                         <h2 className="text-white font-serif text-4xl mb-2">Recovery.</h2>
//                         <p className="text-white/80 text-sm font-light tracking-widest uppercase">Secure your account</p>
//                     </div>
//                 </div>
//
//                 {/* R I G H T   S I D E */}
//                 <div className="md:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-[#faf9f7]">
//                     <div className="mb-10 text-center md:text-left">
//                         <p className="text-[#888] text-[0.65rem] tracking-[0.25em] uppercase mb-3">Password Recovery</p>
//                         <h1 className="font-serif text-4xl text-[#1a1a1a] mb-4">Forget Password</h1>
//                         <p className="text-[#888] text-sm leading-relaxed">
//                             Enter your email address below. We'll send you an OTP code to securely reset your password.
//                         </p>
//                     </div>
//
//                     <div className="space-y-6">
//                         <div>
//                             <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Email Address</label>
//                             <input
//                                 type="email"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 className="w-full bg-transparent border-b border-[#e8e4df] py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors"
//                                 placeholder="Enter your email"
//                             />
//                         </div>
//
//                         <div className="pt-6 space-y-4">
//                             <button onClick={handleForgotPassword} disabled={loading} className="w-full bg-[#1a1a1a] text-[#faf9f7] py-4 text-[0.72rem] uppercase tracking-[0.18em] hover:bg-[#333] transition-colors flex items-center justify-center gap-2">
//                                 {loading ? "Sending..." : "Send OTP Code"} <ArrowRight size={14} />
//                             </button>
//
//                             <div className="flex gap-4 pt-2">
//                                 <button type="button" onClick={() => navigate("/login")} className="flex-1 bg-transparent text-[#1a1a1a] border border-[#1a1a1a] py-3 text-[0.7rem] uppercase tracking-[0.15em] hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors text-center">
//                                     Sign In
//                                 </button>
//                                 <button type="button" onClick={() => navigate("/register")} className="flex-1 bg-transparent text-[#1a1a1a] border border-[#1a1a1a] py-3 text-[0.7rem] uppercase tracking-[0.15em] hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors text-center">
//                                     Sign Up
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default ForgetPassword;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async () => {
        if (!email) {
            toast.warning("Please enter your email!");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }),
            });

            const data = await response.json();
            if (response.ok) {
                sessionStorage.setItem("resetToken", data.result.token);
                sessionStorage.setItem("otp", data.result.otp);
                toast.success("OTP has been sent to your email. Please check!");
                navigate("/reset_password");
            } else {
                toast.error(data.message || "Email does not exist or system error!");
            }
        } catch (error) {
            toast.error("Unable to connect to Server!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4 lg:p-8 font-sans">
            <div className="max-w-5xl w-full flex flex-col md:flex-row bg-white border border-[#e8e4df] shadow-2xl">

                {/* L E F T   S I D E */}
                <div className="md:w-1/2 relative hidden md:block border-r border-[#e8e4df]">
                    <img
                        src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2074&auto=format&fit=crop"
                        alt="Fashion Editorial"
                        className="absolute inset-0 w-full h-full object-cover grayscale-[20%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
                        <h2 className="text-white font-serif text-4xl mb-2">Recovery.</h2>
                        <p className="text-white/80 text-sm font-light tracking-widest uppercase">Secure your account</p>
                    </div>
                </div>

                {/* R I G H T   S I D E */}
                <div className="md:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-[#faf9f7]">

                    <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-[#888] hover:text-[#1a1a1a] transition-colors uppercase tracking-[0.15em] text-[0.65rem] font-bold mb-10 w-max">
                        <ArrowLeft size={14} /> Back to Home
                    </button>

                    <div className="mb-10 text-center md:text-left">
                        <p className="text-[#888] text-[0.65rem] tracking-[0.25em] uppercase mb-3">Password Recovery</p>
                        <h1 className="font-serif text-4xl text-[#1a1a1a] mb-4">Forget Password</h1>
                        <p className="text-[#888] text-sm leading-relaxed">
                            Enter your email address below. We'll send you an OTP code to securely reset your password.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-[#e8e4df] py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="pt-6 space-y-4">
                            <button onClick={handleForgotPassword} disabled={loading} className="w-full bg-[#1a1a1a] text-[#faf9f7] py-4 text-[0.72rem] uppercase tracking-[0.18em] hover:bg-[#333] transition-colors flex items-center justify-center gap-2">
                                {loading ? "Sending..." : "Send OTP Code"} <ArrowRight size={14} />
                            </button>

                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => navigate("/login")} className="flex-1 bg-transparent text-[#1a1a1a] border border-[#1a1a1a] py-3 text-[0.7rem] uppercase tracking-[0.15em] hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors text-center">
                                    Sign In
                                </button>
                                <button type="button" onClick={() => navigate("/register")} className="flex-1 bg-transparent text-[#1a1a1a] border border-[#1a1a1a] py-3 text-[0.7rem] uppercase tracking-[0.15em] hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors text-center">
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;