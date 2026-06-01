// import React from "react";
// import { useState } from "react";
// import { Navigate, useNavigate } from "react-router-dom";
// import { toast } from "sonner";
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const Register = () => {
//   const navigate = useNavigate();
//
//   // Define Regex for reuse
//   const REGEX = {
//     // RFC 5322 standard Email
//     email: /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/,
//     // Vietnamese phone number (10 digits)
//     phoneNumber: /^(0[3|5|7|8|9])+([0-9]{8})$/,
//     // Password: at least 8 characters (Note: Your regex below currently checks for numbers only, you might want to update it to match the description)
//     password: /^(0-9){8,}$/,
//   };
//
//   const [formData, setFormData] = useState({
//     fullName: "",
//     phoneNumber: "",
//     email: "",
//     gender: "Male", // Default value
//     dateOfBirth: "",
//     username: "",
//     password: "",
//     password_confirmed: "",
//   });
//
//   // New state to track validation status of each field
//   // null: untouched, true: valid, false: invalid
//   const [validationStatus, setValidationStatus] = useState({
//     fullName: null,
//     phoneNumber: null,
//     email: null,
//     username: null,
//     password: null,
//     password_confirmed: null,
//   });
//
//   // Handle validation when user leaves the input field (onBlur)
//   const handleValidation = (e) => {
//     const { name, value } = e.target;
//     let isValid = false;
//
//     if (value.trim() === "") {
//       isValid = false;
//     } else {
//       switch (name) {
//         case "fullName":
//           isValid = value.trim().length > 0;
//           break;
//         case "username":
//           isValid = value.trim().length > 0;
//           break;
//         case "email":
//           isValid = REGEX.email.test(value);
//           break;
//         case "phoneNumber":
//           isValid = REGEX.phoneNumber.test(value);
//           break;
//         case "password":
//           isValid = value.length > 8;
//           // When password changes, re-check the confirmed password
//           if (formData.password_confirmed) {
//             setValidationStatus((prev) => ({
//               ...prev,
//               password_confirmed: value === formData.password_confirmed,
//             }));
//           }
//           break;
//         case "password_confirmed":
//           isValid = formData.password === value;
//           break;
//         default:
//           break;
//       }
//     }
//
//     setValidationStatus((prev) => ({ ...prev, [name]: isValid }));
//   };
//
//   // Helper function to determine border class
//   const getBorderClass = (fieldName) => {
//     if (validationStatus[fieldName] === true) {
//       return "border-green-500 focus:border-green-500"; // Valid
//     }
//     if (validationStatus[fieldName] === false) {
//       return "border-red-400 focus:border-red-400"; // Invalid
//     }
//     return "border-gray-200 focus:border-red-400"; // Default
//   };
//
//   // Helper function to display icon
//   const renderIcon = (fieldName) => {
//     if (validationStatus[fieldName] === true) {
//       return (
//         <span className="absolute right-3 top-3 text-green-500 text-xl font-bold">
//           ✓
//         </span>
//       );
//     }
//     // Show * if invalid or untouched
//     return <span className="absolute right-3 top-3 text-red-500">*</span>;
//   };
//
//   // Handle changes in input fields
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };
//
//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//
//     // Check if confirmed password matches
//     if (formData.password !== formData.password_confirmed) {
//       toast.warning("Passwords do not match");
//       return;
//     }
//
//     // JSON data structure
//     const accountData = {
//       username: formData.username,
//       password: formData.password,
//       customer: {
//         fullName: formData.fullName,
//         phoneNumber: formData.phoneNumber,
//         email: formData.email,
//         gender: formData.gender.toUpperCase(),
//         dateOfBirth: formData.dateOfBirth,
//       },
//     };
//
//     try {
//       const response = await fetch(`${BASE_URL}/accounts`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(accountData),
//       });
//
//       if (response.ok) {
//         const result = await response.json();
//         console.log("Account created successfully", result);
//         toast.success("Registration successful");
//       } else {
//         const errorData = await response.json();
//         console.error("Error creating account:", errorData);
//         toast.error(
//           `Registration failed: ${errorData.message || "Please try again."}`,
//         );
//       }
//     } catch (error) {
//       console.error("Network or unknown error:", error);
//       toast.error(
//         "An error occurred. Please check your network connection and try again.",
//       );
//     }
//   };
//
//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2">
//         {/* Left side - Form */}
//         <div className="p-8 md:p-12">
//           <h2 className="font-bold text-4xl mb-2">Sign Up</h2>
//           <p className="text-gray-500 mb-8">Enter user information</p>
//
//           <form className="grid gap-4" onSubmit={handleSubmit}>
//             <div className="relative">
//               <input
//                 type="text"
//                 name="fullName"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 onBlur={handleValidation}
//                 className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
//                   "fullName",
//                 )}`}
//                 placeholder="Họ và tên..."
//                 required
//               />
//               {renderIcon("fullName")}
//             </div>
//
//             <div className="relative">
//               <input
//                 type="text"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 onBlur={handleValidation}
//                 className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
//                   "phoneNumber",
//                 )}`}
//                 placeholder="Số điện thoại..."
//                 required
//               />
//               {renderIcon("phoneNumber")}
//             </div>
//
//             <div className="relative">
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 onBlur={handleValidation}
//                 className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
//                   "email",
//                 )}`}
//                 placeholder="Email..."
//                 required
//               />
//               {renderIcon("email")}
//             </div>
//
//             <div className="grid gap-2">
//               <label className="font-semibold text-sm text-gray-700">
//                 Giới tính:
//               </label>
//               <div className="flex gap-6">
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="radio"
//                     name="gender"
//                     value="MALE"
//                     className="accent-red-500 w-4 h-4"
//                     checked={formData.gender == "MALE"}
//                     onChange={handleChange}
//                     defaultChecked
//                     required
//                   />
//                   <span className="text-gray-700">Nam</span>
//                 </label>
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="radio"
//                     name="gender"
//                     value="FEMALE"
//                     className="accent-red-500 w-4 h-4"
//                     checked={formData.gender == "FEMALE"}
//                     onChange={handleChange}
//                     required
//                   />
//                   <span className="text-gray-700">Nữ</span>
//                 </label>
//               </div>
//             </div>
//
//             <div className="relative">
//               <input
//                 type="date"
//                 name="dateOfBirth"
//                 value={formData.dateOfBirth}
//                 onChange={handleChange}
//                 className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-400 transition text-gray-600"
//                 required
//               />
//             </div>
//
//             <div className="relative">
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 onBlur={handleValidation}
//                 className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
//                   "username",
//                 )}`}
//                 placeholder="Username..."
//                 required
//               />
//               {renderIcon("username")}
//             </div>
//
//             <div className="relative">
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 onBlur={handleValidation}
//                 className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
//                   "password",
//                 )}`}
//                 placeholder="Mật khẩu..."
//                 required
//               />
//               {renderIcon("password")}
//             </div>
//
//             <div className="relative">
//               <input
//                 type="password"
//                 name="password_confirmed"
//                 value={formData.password_confirmed}
//                 onChange={handleChange}
//                 onBlur={handleValidation}
//                 className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
//                   "password_confirmed",
//                 )}`}
//                 placeholder="Nhập lại mật khẩu..."
//                 required
//               />
//               {renderIcon("password_confirmed")}
//             </div>
//
//             <div className="flex gap-3 mt-4">
//               <button
//                 type="button"
//                 className="px-6 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
//                 onClick={() => {
//                   navigate("/login");
//                 }}
//               >
//                 Sign In
//               </button>
//               <button
//                 type="button"
//                 className="px-6 py-3 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
//               >
//                 Sign Up
//               </button>
//             </div>
//
//             <button
//               type="submit"
//               className="w-full py-4 rounded-lg bg-black text-white font-bold text-lg hover:bg-gray-800 transition mt-2"
//             >
//               REGISTER
//             </button>
//
//             <button
//               type="button"
//               className="w-full py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
//               onClick={() => {
//                 navigate("/");
//               }}
//             >
//               Quay lại
//             </button>
//           </form>
//         </div>
//
//         {/* Right side - Image */}
//         <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-red-400 to-red-500 p-12">
//           <div className="relative">
//             <div className="absolute inset-0 bg-red-300 rounded-full blur-3xl opacity-50"></div>
//             <img
//               src="https://legiakhanhxd.s3.ap-southeast-1.amazonaws.com/6f1c8330-63ab-4113-ab8c-4ebab755b4a1.jpg"
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
// export default Register;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { ArrowRight } from "lucide-react";
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const Register = () => {
//     const navigate = useNavigate();
//
//     const REGEX = {
//         email: /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/,
//         phoneNumber: /^(0[3|5|7|8|9])+([0-9]{8})$/,
//     };
//
//     const [formData, setFormData] = useState({
//         fullName: "", phoneNumber: "", email: "", gender: "MALE", dateOfBirth: "", username: "", password: "", password_confirmed: "",
//     });
//
//     const [validationStatus, setValidationStatus] = useState({
//         fullName: null, phoneNumber: null, email: null, username: null, password: null, password_confirmed: null,
//     });
//
//     const handleValidation = (e) => {
//         const { name, value } = e.target;
//         let isValid = false;
//
//         if (value.trim() !== "") {
//             switch (name) {
//                 case "fullName": isValid = value.trim().length > 0; break;
//                 case "username": isValid = value.trim().length > 0; break;
//                 case "email": isValid = REGEX.email.test(value); break;
//                 case "phoneNumber": isValid = REGEX.phoneNumber.test(value); break;
//                 case "password":
//                     isValid = value.length >= 8;
//                     if (formData.password_confirmed) setValidationStatus(p => ({ ...p, password_confirmed: value === formData.password_confirmed }));
//                     break;
//                 case "password_confirmed": isValid = formData.password === value; break;
//                 default: break;
//             }
//         }
//         setValidationStatus(p => ({ ...p, [name]: isValid }));
//     };
//
//     const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (formData.password !== formData.password_confirmed) {
//             toast.warning("Passwords do not match"); return;
//         }
//
//         const accountData = {
//             username: formData.username,
//             password: formData.password,
//             customer: {
//                 fullName: formData.fullName, phoneNumber: formData.phoneNumber, email: formData.email, gender: formData.gender.toUpperCase(), dateOfBirth: formData.dateOfBirth,
//             },
//         };
//
//         try {
//             const response = await fetch(`${BASE_URL}/accounts`, {
//                 method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(accountData),
//             });
//
//             if (response.ok) {
//                 toast.success("Registration successful");
//                 navigate("/login");
//             } else {
//                 const errorData = await response.json();
//                 toast.error(`Registration failed: ${errorData.message || "Please try again."}`);
//             }
//         } catch (error) {
//             toast.error("An error occurred. Please check your network connection.");
//         }
//     };
//
//     // Helper cho viền (border) để hiển thị lỗi mà không làm mất đi vẻ Minimalist
//     const getBorderClass = (fieldName) => {
//         if (validationStatus[fieldName] === false) return "border-red-500 focus:border-red-500 text-red-500";
//         return "border-[#e8e4df] focus:border-[#1a1a1a] text-[#1a1a1a]";
//     };
//
//     return (
//         <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4 lg:p-8 font-sans">
//             <div className="max-w-6xl w-full flex flex-col md:flex-row-reverse bg-white border border-[#e8e4df] shadow-2xl">
//
//                 {/* R I G H T   S I D E   -   I M A G E (Reversed cho khác Login) */}
//                 <div className="md:w-2/5 relative hidden md:block border-l border-[#e8e4df]">
//                     <img
//                         src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
//                         alt="Fashion Lookbook"
//                         className="absolute inset-0 w-full h-full object-cover grayscale-[20%]"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
//                         <h2 className="text-white font-serif text-4xl mb-2">Join Us.</h2>
//                         <p className="text-white/80 text-sm font-light tracking-widest uppercase">Define your style</p>
//                     </div>
//                 </div>
//
//                 {/* L E F T   S I D E   -   F O R M */}
//                 <div className="md:w-3/5 p-8 lg:p-14 bg-[#faf9f7]">
//                     <div className="mb-10">
//                         <p className="text-[#888] text-[0.65rem] tracking-[0.25em] uppercase mb-3">Become a member</p>
//                         <h1 className="font-serif text-4xl text-[#1a1a1a]">Sign Up</h1>
//                     </div>
//
//                     <form className="space-y-6" onSubmit={handleSubmit}>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//
//                             <div className="md:col-span-2">
//                                 <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Full Name</label>
//                                 <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('fullName')}`} placeholder="Enter your full name" required />
//                             </div>
//
//                             <div>
//                                 <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Phone</label>
//                                 <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('phoneNumber')}`} placeholder="Phone number" required />
//                             </div>
//
//                             <div>
//                                 <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Email</label>
//                                 <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('email')}`} placeholder="Email address" required />
//                             </div>
//
//                             <div>
//                                 <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-4">Gender</label>
//                                 <div className="flex gap-6 items-center">
//                                     <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1a1a1a]">
//                                         <input type="radio" name="gender" value="MALE" className="accent-[#1a1a1a]" checked={formData.gender === "MALE"} onChange={handleChange} required /> Male
//                                     </label>
//                                     <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1a1a1a]">
//                                         <input type="radio" name="gender" value="FEMALE" className="accent-[#1a1a1a]" checked={formData.gender === "FEMALE"} onChange={handleChange} required /> Female
//                                     </label>
//                                 </div>
//                             </div>
//
//                             <div>
//                                 <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Date of Birth</label>
//                                 <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-transparent border-b border-[#e8e4df] py-2 text-sm outline-none focus:border-[#1a1a1a] transition-colors text-[#1a1a1a]" required />
//                             </div>
//
//                             <div className="md:col-span-2">
//                                 <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Username</label>
//                                 <input type="text" name="username" value={formData.username} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('username')}`} placeholder="Create a username" required />
//                             </div>
//
//                             <div>
//                                 <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Password</label>
//                                 <input type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('password')}`} placeholder="Create password" required />
//                             </div>
//
//                             <div>
//                                 <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Confirm Password</label>
//                                 <input type="password" name="password_confirmed" value={formData.password_confirmed} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('password_confirmed')}`} placeholder="Confirm password" required />
//                             </div>
//                         </div>
//
//                         <div className="pt-8 flex flex-col md:flex-row gap-4 items-center">
//                             <button type="submit" className="w-full md:w-2/3 bg-[#1a1a1a] text-[#faf9f7] py-4 text-[0.72rem] uppercase tracking-[0.18em] hover:bg-[#333] transition-colors flex items-center justify-center gap-2">
//                                 Create Account <ArrowRight size={14} />
//                             </button>
//                             <button type="button" onClick={() => navigate("/login")} className="w-full md:w-1/3 bg-transparent text-[#1a1a1a] border border-[#1a1a1a] py-4 text-[0.72rem] uppercase tracking-[0.18em] hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors text-center">
//                                 Sign In
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default Register;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
    const navigate = useNavigate();

    const REGEX = {
        email: /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/,
        phoneNumber: /^(0[3|5|7|8|9])+([0-9]{8})$/,
    };

    const [formData, setFormData] = useState({
        fullName: "", phoneNumber: "", email: "", gender: "MALE", dateOfBirth: "", username: "", password: "", password_confirmed: "",
    });

    const [validationStatus, setValidationStatus] = useState({
        fullName: null, phoneNumber: null, email: null, username: null, password: null, password_confirmed: null,
    });

    const handleValidation = (e) => {
        const { name, value } = e.target;
        let isValid = false;

        if (value.trim() !== "") {
            switch (name) {
                case "fullName": isValid = value.trim().length > 0; break;
                case "username": isValid = value.trim().length > 0; break;
                case "email": isValid = REGEX.email.test(value); break;
                case "phoneNumber": isValid = REGEX.phoneNumber.test(value); break;
                case "password":
                    isValid = value.length >= 8;
                    if (formData.password_confirmed) setValidationStatus(p => ({ ...p, password_confirmed: value === formData.password_confirmed }));
                    break;
                case "password_confirmed": isValid = formData.password === value; break;
                default: break;
            }
        }
        setValidationStatus(p => ({ ...p, [name]: isValid }));
    };

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmed) {
            toast.warning("Passwords do not match"); return;
        }

        const accountData = {
            username: formData.username,
            password: formData.password,
            customer: {
                fullName: formData.fullName, phoneNumber: formData.phoneNumber, email: formData.email, gender: formData.gender.toUpperCase(), dateOfBirth: formData.dateOfBirth,
            },
        };

        try {
            const response = await fetch(`${BASE_URL}/accounts`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(accountData),
            });

            if (response.ok) {
                toast.success("Registration successful");
                navigate("/login");
            } else {
                const errorData = await response.json();
                toast.error(`Registration failed: ${errorData.message || "Please try again."}`);
            }
        } catch (error) {
            toast.error("An error occurred. Please check your network connection.");
        }
    };

    const getBorderClass = (fieldName) => {
        if (validationStatus[fieldName] === false) return "border-red-500 focus:border-red-500 text-red-500";
        return "border-[#e8e4df] focus:border-[#1a1a1a] text-[#1a1a1a]";
    };

    return (
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4 lg:p-8 font-sans">
            <div className="max-w-6xl w-full flex flex-col md:flex-row-reverse bg-white border border-[#e8e4df] shadow-2xl">

                {/* R I G H T   S I D E */}
                <div className="md:w-2/5 relative hidden md:block border-l border-[#e8e4df]">
                    <img
                        src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
                        alt="Fashion Lookbook"
                        className="absolute inset-0 w-full h-full object-cover grayscale-[20%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
                        <h2 className="text-white font-serif text-4xl mb-2">Join Us.</h2>
                        <p className="text-white/80 text-sm font-light tracking-widest uppercase">Define your style</p>
                    </div>
                </div>

                {/* L E F T   S I D E   -   F O R M */}
                <div className="md:w-3/5 p-8 lg:p-14 bg-[#faf9f7] flex flex-col justify-center">

                    <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-[#888] hover:text-[#1a1a1a] transition-colors uppercase tracking-[0.15em] text-[0.65rem] font-bold mb-8 w-max">
                        <ArrowLeft size={14} /> Back to Home
                    </button>

                    <div className="mb-10">
                        <p className="text-[#888] text-[0.65rem] tracking-[0.25em] uppercase mb-3">Become a member</p>
                        <h1 className="font-serif text-4xl text-[#1a1a1a]">Sign Up</h1>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('fullName')}`} placeholder="Enter your full name" required />
                            </div>
                            <div>
                                <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Phone</label>
                                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('phoneNumber')}`} placeholder="Phone number" required />
                            </div>
                            <div>
                                <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('email')}`} placeholder="Email address" required />
                            </div>
                            <div>
                                <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-4">Gender</label>
                                <div className="flex gap-6 items-center">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1a1a1a]">
                                        <input type="radio" name="gender" value="MALE" className="accent-[#1a1a1a]" checked={formData.gender === "MALE"} onChange={handleChange} required /> Male
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1a1a1a]">
                                        <input type="radio" name="gender" value="FEMALE" className="accent-[#1a1a1a]" checked={formData.gender === "FEMALE"} onChange={handleChange} required /> Female
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Date of Birth</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-transparent border-b border-[#e8e4df] py-2 text-sm outline-none focus:border-[#1a1a1a] transition-colors text-[#1a1a1a]" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('username')}`} placeholder="Create a username" required />
                            </div>
                            <div>
                                <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('password')}`} placeholder="Create password" required />
                            </div>
                            <div>
                                <label className="block text-[#888] text-[0.65rem] tracking-[0.15em] uppercase mb-2">Confirm Password</label>
                                <input type="password" name="password_confirmed" value={formData.password_confirmed} onChange={handleChange} onBlur={handleValidation} className={`w-full bg-transparent border-b py-2 text-sm outline-none transition-colors ${getBorderClass('password_confirmed')}`} placeholder="Confirm password" required />
                            </div>
                        </div>

                        <div className="pt-8 flex flex-col gap-4">
                            <button type="submit" className="w-full bg-[#1a1a1a] text-[#faf9f7] py-4 text-[0.72rem] uppercase tracking-[0.18em] hover:bg-[#333] transition-colors flex items-center justify-center gap-2">
                                Create Account <ArrowRight size={14} />
                            </button>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => navigate("/login")} className="flex-1 bg-transparent text-[#1a1a1a] border border-[#1a1a1a] py-3 text-[0.7rem] uppercase tracking-[0.15em] hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors text-center">
                                    Sign In
                                </button>
                                <button type="button" onClick={() => navigate("/forget_password")} className="flex-1 bg-transparent text-[#1a1a1a] border border-[#1a1a1a] py-3 text-[0.7rem] uppercase tracking-[0.15em] hover:bg-[#1a1a1a] hover:text-[#faf9f7] transition-colors text-center">
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;