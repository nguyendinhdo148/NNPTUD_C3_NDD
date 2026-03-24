const nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

// Token của bạn
const TOKEN = "d41a01753896770f93a5af2badf9fca6";

// Cấu hình theo đúng chuẩn code mẫu bạn vừa tìm được
const transporter = nodemailer.createTransport(
    MailtrapTransport({
        token: TOKEN,
        sandbox: true,
        testInboxId: 4485325, // Chính xác là ID hộp thư của bạn đây rồi!
    })
);

module.exports = {
    sendMail: async function (to, password) {
        try {
            await transporter.sendMail({
                from: { address: "admin@haha.com", name: "System Admin" },
                to: to,
                subject: "Tài khoản của bạn",
                text: `Password của bạn là: ${password}`,
                html: `
                    <h3>Chào bạn</h3>
                    <p>Tài khoản đã được tạo</p>
                    <p><b>Password:</b> ${password}</p>
                `,
                category: "User Import",
            });
        } catch (error) {
            console.error(`❌ Lỗi khi gửi mail tới ${to}:`, error);
            throw error;
        }
    }
}