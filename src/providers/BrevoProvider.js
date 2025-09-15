// Lưu ý Brevo là tên thương hiệu mới của sib - Sendinblue
// Vì thế trong phần hướng dẫn trên github có thể nó vẫn còn giữ tên biến SibApiV3Sdk
// https://github.com/getbrevo/brevo-node
const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

/**
 * Có thể xem thêm phần docs cấu hình theo từng ngôn ngữ khác nhau tùy dự án ở Brevo Dashboard > Account > SMTP & API > API Keys
 * https://brevo.com
 * Với Nodejs thì tốt nhất cứ lên github repo của bọn nó là nhanh nhất:
 * https://github.com/getbrevo/brevo-node
 */
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  // Khởi tạo một cái sendSmtpEmail với những thông tin cần thiết
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  // Tài khoản gửi mail: lưu ý địa chỉ admin phải là cái email dùng để tạo tài khoản trên Brevo
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Những tài khoản nhận mail
  // 'to' phải là một Array để sau chúng ta có thể tùy biến gửi 1 email tới nhiều user tùy tính năng dự án
  sendSmtpEmail.to = [{ email: recipientEmail }]

  // Tiêu đề của email
  sendSmtpEmail.subject =customSubject

  // Nội dung email
  sendSmtpEmail.htmlContent = htmlContent

  // Gọi hành động gửi mail
  // Thằng sendTransacEmail của thư viện nó sẽ return một Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}