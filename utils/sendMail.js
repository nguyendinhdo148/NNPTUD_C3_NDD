const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525, 
    auth: {
        // Thay bằng User và Pass thật của bạn trên Mailtrap
        user: "c26aed7e165e3d", 
        pass: "c3e293b5e5fdd0", // Đảm bảo đây là mật khẩu chính xác đã hiện ra hết (không có dấu ****)
    },
});

module.exports = {
    sendMail: async function (to, password) {
        await transporter.sendMail({
            from: 'admin@haha.com',
            to: to,
            subject: "Tài khoản của bạn",
            text: `Password của bạn là: ${password}`,
            html: `
                <h3>Chào bạn</h3>
                <p>Tài khoản đã được tạo</p>
                <p><b>Password:</b> ${password}</p>
            `,
        });
    }
}