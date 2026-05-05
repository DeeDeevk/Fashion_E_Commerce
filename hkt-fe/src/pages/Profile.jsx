import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as customerService from "../services/customer.service.js";
import * as addressService from "../services/address.service.js";

// --- UTILS ---
const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const isProfileChanged = (profile, initialProfile) => {
  if (!profile || !initialProfile) return false;
  return profile.fullName !== initialProfile.fullName || profile.phoneNumber !== initialProfile.phoneNumber || profile.gender !== initialProfile.gender || formatDateForInput(profile.dateOfBirth) !== formatDateForInput(initialProfile.dateOfBirth);
};

// --- ADDRESS SECTION ---
const AddressSection = ({ accountId, isCustomerProfile }) => {
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editForm, setEditForm] = useState({ id: null, delivery_address: "", province: "", delivery_note: "", accountId });
  const [currentActionId, setCurrentActionId] = useState(null);
  const [newAddress, setNewAddress] = useState({ delivery_address: "", delivery_note: "", province: "", accountId });

  const fetchAddresses = async () => {
    if (!accountId) return;
    setAddressLoading(true);
    try {
      const list = await addressService.getAddresses(accountId);
      setAddresses(list);
    } catch { toast.error("Không thể tải danh sách địa chỉ"); setAddresses([]); }
    finally { setAddressLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, [accountId]);

  const handleNewAddressChange = (e) => { const { name, value } = e.target; setNewAddress((prev) => ({ ...prev, [name]: value })); };
  const handleEditFormChange = (e) => { const { name, value } = e.target; setEditForm((prev) => ({ ...prev, [name]: value })); };

  const handleStartEdit = (address) => {
    setShowAddForm(false);
    setEditingAddress(address.id);
    setCurrentActionId(null);
    setEditForm({ id: address.id, delivery_address: address.delivery_address || "", province: address.province || "", delivery_note: address.delivery_note || "", accountId });
  };

  const handleCancelEdit = () => { setEditingAddress(null); setEditForm({ id: null, delivery_address: "", province: "", delivery_note: "", accountId }); setCurrentActionId(null); };

  const handleEditAddress = async (e) => {
    e.preventDefault();
    if (!editForm.id) return;
    if (!editForm.delivery_address.trim() || !editForm.province.trim()) { toast.error("Địa chỉ và Tỉnh/Thành phố là bắt buộc."); return; }
    setCurrentActionId(editForm.id);
    try { await addressService.updateAddress(editForm); toast.success("Cập nhật địa chỉ thành công!"); handleCancelEdit(); await fetchAddresses(); }
    catch (error) { toast.error("Cập nhật thất bại: " + (error.response?.data?.message || error.message)); }
    finally { setCurrentActionId(null); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.delivery_address.trim() || !newAddress.province.trim()) { toast.error("Địa chỉ và Tỉnh/Thành phố là bắt buộc."); return; }
    setCurrentActionId("ADD_NEW");
    try { await addressService.addAddress(newAddress); toast.success("Thêm địa chỉ thành công!"); setShowAddForm(false); setNewAddress({ delivery_address: "", delivery_note: "", province: "", accountId }); fetchAddresses(); }
    catch { toast.error("Thêm địa chỉ thất bại"); }
    finally { setCurrentActionId(null); }
  };

  const handleDeleteAddress = async (id) => {
    const addressId = parseInt(id, 10);
    if (isNaN(addressId) || addressId <= 0) { toast.error("ID địa chỉ không hợp lệ."); return; }
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    setCurrentActionId(addressId);
    try { await addressService.deleteAddress(addressId); toast.success("Xóa địa chỉ thành công!"); fetchAddresses(); }
    catch (err) { toast.error(err.response?.data?.message || err.message); }
    finally { setCurrentActionId(null); }
  };

  const isAddressLoading = (id) => currentActionId === id;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Địa chỉ giao hàng</h2>
        {isCustomerProfile && (
          <button onClick={() => { setShowAddForm(!showAddForm); handleCancelEdit(); }} className="text-red-600 hover:text-red-800 font-medium">{showAddForm ? "Hủy" : "Thêm mới"}</button>
        )}
      </div>
      {addressLoading && !editingAddress ? (<p className="text-center text-gray-500">Đang tải...</p>) : addresses.length === 0 && !showAddForm ? (<p className="text-center text-gray-500 py-8">Chưa có địa chỉ nào.</p>) : (
        <div className="flex-grow overflow-y-auto space-y-4 pr-2">
          {addresses.map((addr) => (
            <div key={addr.id}>
              {editingAddress === addr.id ? (
                <form onSubmit={handleEditAddress} className="bg-red-100 rounded-lg p-4 border-2 border-red-500">
                  <h4 className="font-bold mb-3 text-red-700">Sửa địa chỉ</h4>
                  <input name="delivery_address" value={editForm.delivery_address} onChange={handleEditFormChange} placeholder="Địa chỉ..." required className="w-full p-2 mb-2 border border-red-300 rounded" />
                  <input name="province" value={editForm.province} onChange={handleEditFormChange} placeholder="Tỉnh/Thành phố" required className="w-full p-2 mb-2 border border-red-300 rounded" />
                  <input name="delivery_note" value={editForm.delivery_note} onChange={handleEditFormChange} placeholder="Ghi chú..." className="w-full p-2 mb-3 border border-red-300 rounded" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={isAddressLoading(editForm.id)} className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-50">{isAddressLoading(editForm.id) ? "Đang lưu..." : "Lưu"}</button>
                    <button type="button" onClick={handleCancelEdit} className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400">Hủy</button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md flex justify-between">
                  <div>
                    <p className="font-semibold text-black mb-1">{addr.delivery_address}</p>
                    <p className="text-sm text-gray-600 mb-1">{addr.province}</p>
                    <p className="text-sm text-gray-500 italic">Ghi chú: {addr.delivery_note || "Không"}</p>
                  </div>
                  {isCustomerProfile && addr.id > 0 && (
                    <div className="flex space-x-2">
                      <button onClick={() => handleStartEdit(addr)} disabled={currentActionId !== null} className="text-blue-600 hover:bg-blue-100 p-1 rounded">✏️</button>
                      <button onClick={() => handleDeleteAddress(addr.id)} disabled={currentActionId !== null} className="text-red-600 hover:bg-red-100 p-1 rounded">🗑️</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showAddForm && (
        <form onSubmit={handleAddAddress} className="mt-6 bg-red-50 rounded-lg p-4">
          <h4 className="font-bold mb-3 text-red-700">Thêm địa chỉ mới</h4>
          <input name="delivery_address" value={newAddress.delivery_address} onChange={handleNewAddressChange} placeholder="Địa chỉ..." required className="w-full p-3 mb-3 border border-gray-300 rounded" />
          <input name="province" value={newAddress.province} onChange={handleNewAddressChange} placeholder="Tỉnh/Thành phố" required className="w-full p-3 mb-3 border border-gray-300 rounded" />
          <input name="delivery_note" value={newAddress.delivery_note} onChange={handleNewAddressChange} placeholder="Ghi chú giao hàng" className="w-full p-3 mb-4 border border-gray-300 rounded" />
          <button disabled={isAddressLoading("ADD_NEW")} className="w-full bg-red-600 text-white p-3 rounded font-semibold hover:bg-red-700 disabled:opacity-50">{isAddressLoading("ADD_NEW") ? "Đang lưu..." : "Lưu địa chỉ"}</button>
        </form>
      )}
    </div>
  );
};

// --- PROFILE PAGE ---
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [initialProfile, setInitialProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ id: null, accountId: null, fullName: "", phoneNumber: "", gender: "MALE", dateOfBirth: "" });

  const NAME_REGEX = /^[A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ\s]+$/;
  const PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8,9}$/;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const customerData = await customerService.getProfile();
      if (!customerData) throw new Error("Không tìm thấy hồ sơ khách hàng");
      const newProfile = { id: customerData.id, accountId: customerData.accountId || null, fullName: customerData.fullName || "", phoneNumber: customerData.phoneNumber || "", email: customerData.email || "", gender: customerData.gender || "MALE", dateOfBirth: customerData.dateOfBirth || null };
      setProfile(newProfile);
      setInitialProfile(newProfile);
      setFormData({ id: newProfile.id, accountId: newProfile.accountId, fullName: newProfile.fullName, phoneNumber: newProfile.phoneNumber, email: newProfile.email, gender: newProfile.gender, dateOfBirth: formatDateForInput(newProfile.dateOfBirth) });
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.fullName.trim()) { newErrors.fullName = "Họ tên là bắt buộc."; isValid = false; }
    else if (!NAME_REGEX.test(formData.fullName)) { newErrors.fullName = "Họ tên chỉ được chứa chữ cái và khoảng trắng."; isValid = false; }
    if (!formData.phoneNumber.trim()) { newErrors.phoneNumber = "Số điện thoại là bắt buộc."; isValid = false; }
    else if (!PHONE_REGEX.test(formData.phoneNumber)) { newErrors.phoneNumber = "Số điện thoại không hợp lệ (VD: 0901234567)."; isValid = false; }
    if (formData.dateOfBirth) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.dateOfBirth >= today) { newErrors.dateOfBirth = "Ngày sinh không thể ở tương lai."; isValid = false; }
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error("Vui lòng kiểm tra lại thông tin."); return; }
    if (!formData.id) { toast.error("Không xác định được ID khách hàng."); return; }
    setSaving(true);
    try {
      await customerService.updateProfile({ id: formData.id, fullName: formData.fullName, phoneNumber: formData.phoneNumber, email: formData.email, gender: formData.gender, dateOfBirth: formData.dateOfBirth || null });
      toast.success("Cập nhật hồ sơ thành công!");
      await fetchProfile();
    } catch (err) { toast.error(err.response?.data?.message || err.message || "Cập nhật thất bại."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div></div>;

  const hasChanged = isProfileChanged(profile, initialProfile);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-red-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center justify-between mb-8"><h1 className="text-3xl font-extrabold text-black">Hồ sơ của tôi</h1></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Username / Email</label>
                <input value={profile?.email || ""} readOnly className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed" />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Họ tên</label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập họ tên" className={`w-full p-3 border rounded-lg focus:ring-2 transition ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-red-500 focus:ring-red-200'}`} />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Số điện thoại</label>
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Nhập số điện thoại" className={`w-full p-3 border rounded-lg focus:ring-2 transition ${errors.phoneNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-red-500 focus:ring-red-200'}`} />
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Ngày sinh</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={`w-full p-3 border rounded-lg focus:ring-2 transition ${errors.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-red-500 focus:ring-red-200'}`} />
                {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Giới tính</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition">
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <button disabled={!hasChanged || saving} className="w-full bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
            </div>
          </form>
          <AddressSection accountId={formData.accountId} isCustomerProfile={true} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
