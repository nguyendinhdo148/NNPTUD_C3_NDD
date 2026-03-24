const fs = require('fs');
const mailer = require('./utils/sendMail'); 
const generatePassword = require('./utils/random'); 

// 1. Thêm hàm tạo khoảng trễ (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendBulkEmails() {
    try {
        const data = fs.readFileSync('users.csv', 'utf8');
        const lines = data.trim().split('\n');

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const [username, email] = line.split(',');
            
            const newPassword = generatePassword();

            console.log(`Đang gửi email cho ${username} (${email})...`);
            
            await mailer.sendMail(email, newPassword);
            console.log(`-> Gửi thành công! Mật khẩu đã cấp: ${newPassword}`);

            // 2. Tạm dừng 2 giây (2000 mili-giây) trước khi gửi người tiếp theo
            // (Không cần dừng nếu đây là người cuối cùng)
            if (i < lines.length - 1) {
                console.log("⏳ Đang chờ 2 giây để tránh giới hạn của Mailtrap...");
                await delay(2000); 
            }
        }
        
        console.log("=== HOÀN TẤT GỬI MAIL ===");
        
    } catch (error) {
        console.error("Có lỗi xảy ra:", error);
    }
}

sendBulkEmails();