const nodemailer = require("nodemailer");
require("dotenv").config();

// Cấu hình transporter — giống application.yml Spring Boot
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ==================== SIMPLE EMAIL ====================
const sendSimpleEmail = async (to, subject, content) => {
  await transporter.sendMail({
    from: process.env.MAIL_USERNAME,
    to,
    subject,
    text: content,
  });
};

// ==================== HTML EMAIL ====================
const sendHtmlEmail = async (to, subject, htmlContent) => {
  await transporter.sendMail({
    from: process.env.MAIL_USERNAME,
    to,
    subject,
    html: htmlContent,
  });
};

// ==================== GỬI EMAIL CHO TẤT CẢ CUSTOMERS (SALE) ====================
const sendEmailToAllCustomers = async (customers, products) => {
  for (const customer of customers) {
    try {
      const html = buildSoldOffEmail(products, customer);
      await sendHtmlEmail(
        customer.email,
        "Sản phẩm hot sale trên website!",
        html,
      );
      console.log("Đang gửi email cho:", customer.email);
    } catch (err) {
      console.error("Lỗi gửi cho", customer.email, ":", err.message);
    }
  }
  console.log("=== ĐÃ GỬI XONG TẤT CẢ EMAIL ===");
};

// ==================== GỬI EMAIL SAU KHI MUA HÀNG ====================
const sendEmailToCustomerAfterPurchase = async (customer, order) => {
  const html = buildNotificationAfterPurchase(customer, order);
  await sendHtmlEmail(
    customer.email,
    "Cảm ơn bạn đã mua hàng tại KH3TShop!",
    html,
  );
};

// ==================== GỬI EMAIL HỌP ====================
const createMeetingEmail = async (employees, meetLink) => {
  for (const employee of employees) {
    try {
      await sendMeetingEmail(employee.email, meetLink);
      console.log("Đang gửi email họp cho:", employee.email);
    } catch (err) {
      console.error("Lỗi gửi cho", employee.email, ":", err.message);
    }
  }
  console.log("=== ĐÃ GỬI XONG EMAIL HỌP ===");
};

const sendMeetingEmail = async (employeeEmail, meetLink) => {
  const html = `
    <h2>Cuộc họp mới đã được tạo</h2>
    <p>Vui lòng tham gia cuộc họp qua đường link sau:</p>
    <a href='${meetLink}' style='font-size:18px;font-weight:600;color:#2a7ae4;'>
      Tham gia Google Meet
    </a>
  `;
  await sendHtmlEmail(employeeEmail, "Lịch họp mới từ KH3TShop", html);
};

// ==================== BUILD HTML: SAU MUA HÀNG ====================
const buildNotificationAfterPurchase = (customer, order) => {
  return `
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;
                border-radius: 10px; background: #f9f9f9; border: 1px solid #e5e7eb;'>

      <h2 style='color: #D72638; text-align: center;'>KH3TShop Thông Báo</h2>

      <p style='font-size: 15px; color: #333;'>
        Xin chào <strong>${customer.fullName}</strong>,
      </p>

      <p style='font-size: 15px; color: #333;'>
        Đơn hàng có mã code <strong>${order.orderCode}</strong> của bạn đã được xác nhận.
      </p>

      <div style='text-align:center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;'>
        <p style='font-size: 14px; color: #777;'>Cảm ơn bạn đã luôn tin tưởng KH3TShop!</p>
        <p style='font-size: 13px; color: #aaa;'>© 2025 KH3TShop. Tất cả các quyền được bảo lưu.</p>
      </div>
    </div>
  `;
};

// ==================== BUILD HTML: SALE ====================
const buildSoldOffEmail = (products, customer) => {
  const productRows = products
    .map((p) => {
      const salePrice = (p.price * (100 - p.discountAmount)) / 100;
      return `
      <div style='display: flex; padding: 15px; border-bottom: 1px solid #f0f0f0;'>
        <div style='width: 30%;'>
          <img src='${p.imageUrlFront}' alt='product' style='width: 100%; border-radius: 8px;'>
        </div>
        <div style='width: 70%; padding-left: 15px;'>
          <h3 style='margin: 0; font-size: 16px; color: #111;'>${p.name}</h3>
          <p style='margin: 6px 0; font-size: 14px; color: #555;'>
            Giá gốc: <span style='text-decoration: line-through; color: #999;'>
              ${p.price.toLocaleString("vi-VN")}₫
            </span><br>
            Giảm còn: <strong style='color: #D72638;'>
              ${salePrice.toLocaleString("vi-VN")}₫
            </strong><br>
            Giảm giá: <strong style='color: #16a34a;'>${p.discountAmount}%</strong>
          </p>
        </div>
      </div>
    `;
    })
    .join("");

  return `
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;
                border-radius: 10px; background: #ffffff; border: 1px solid #e5e7eb;'>

      <h2 style='color: #D72638; text-align: center;'>KH3TShop Thông Báo Khuyến Mãi</h2>

      <p style='font-size: 15px; color: #333;'>
        Xin chào <strong>${customer.fullName}</strong>,
      </p>
      <p style='font-size: 15px; color: #333;'>
        Dưới đây là danh sách sản phẩm
        <strong style='color:#D72638;'>đang sale sốc</strong> dành cho bạn:
      </p>

      <div style='margin-top: 20px;'>${productRows}</div>

      <div style='text-align: center; margin: 30px 0;'>
        <a href='http://localhost:5173/product'
           style='display: inline-block; padding: 12px 25px; background-color: #D72638;
                  color: #ffffff; text-decoration: none; border-radius: 5px;
                  font-weight: bold; font-size: 16px;'>
          Xem thêm tại Website
        </a>
      </div>

      <div style='text-align:center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;'>
        <p style='font-size: 14px; color: #777;'>Cảm ơn bạn đã luôn tin tưởng KH3TShop!</p>
        <p style='font-size: 13px; color: #aaa;'>© 2025 KH3TShop. Tất cả các quyền được bảo lưu.</p>
      </div>
    </div>
  `;
};

module.exports = {
  sendSimpleEmail,
  sendHtmlEmail,
  sendEmailToAllCustomers,
  sendEmailToCustomerAfterPurchase,
  createMeetingEmail,
};
