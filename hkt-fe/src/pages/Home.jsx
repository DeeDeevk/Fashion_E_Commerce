import { Link } from "react-router-dom";

const Home = () => {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">
          HKT <span className="text-red-500">STUDIO</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Chào mừng bạn đến với HKT Studio — Thời trang trẻ trung, năng động!
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {isLoggedIn ? (
            <Link to="/profile" className="px-8 py-3 bg-red-500 text-white rounded-full font-semibold text-lg hover:bg-red-600 transition shadow-lg">
              Xem hồ sơ
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-8 py-3 bg-black text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition shadow-lg">
                Đăng nhập
              </Link>
              <Link to="/register" className="px-8 py-3 border-2 border-black text-black rounded-full font-semibold text-lg hover:bg-black hover:text-white transition">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
