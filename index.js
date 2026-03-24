const fs = require('fs');
const mailer = require('./utils/sendMail'); 
const generatePassword = require('./utils/random'); 

// Hàm tạo khoảng trễ 4 giây
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendBulkEmails() {
    try {
        // 1. Đọc file users.csv
        const data = fs.readFileSync('users.csv', 'utf8');
        const lines = data.trim().split('\n');
        
        // Tính tổng số user (trừ đi 1 dòng tiêu đề)
        const totalUsers = lines.length - 1;
        console.log(`📊 Tìm thấy ${totalUsers} người dùng trong file CSV.\n`);

        // 2. Chạy vòng lặp bắt đầu từ i = 1 (bỏ qua dòng 0 là 'username,email')
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Tách username và email
            const [username, email] = line.split(',');
            
            const newPassword = generatePassword();

            console.log(`[${i}/${totalUsers}] Đang gửi email cho ${username} (${email})...`);
            
            await mailer.sendMail(email, newPassword);
            console.log(`-> Gửi thành công! Mật khẩu: ${newPassword}`);

            // 3. Chờ 4 giây trước khi gửi người tiếp theo
            if (i < totalUsers) {
                console.log("⏳ Đang chờ 4 giây để Mailtrap không chặn...");
                await delay(10000); 
            }
        }
        
        console.log("\n=== HOÀN TẤT GỬI MAIL ===");
        
    } catch (error) {
        console.error("❌ Có lỗi xảy ra:", error);
    }
}

sendBulkEmails();