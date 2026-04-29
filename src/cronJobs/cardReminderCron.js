import cron from 'node-cron'
import { GET_DB } from '~/config/mongodb'
import { BrevoProvider } from '~/providers/BrevoProvider'
import moment from 'moment'
import { env } from '~/config/environment'
import { ObjectId } from 'mongodb'

const CARD_COLLECTION_NAME = 'cards'
const USER_COLLECTION_NAME = 'users'

export const startCardReminderCron = () => {
  // Chạy mỗi phút
  cron.schedule('* * * * *', async () => {
    try {
      const now = moment().utc()
      
      // Tìm tất cả card có dueDate, reminder và chưa gửi reminder
      const cards = await GET_DB().collection(CARD_COLLECTION_NAME).find({
        dueDate: { $ne: null },
        reminder: { $ne: null },
        reminderSent: { $ne: true },
        _destroy: false
      }).toArray()

      for (const card of cards) {
        // card.dueDate bây giờ đã bao gồm cả thời gian (ISO String UTC)
        const dueDateMoment = moment(card.dueDate).utc()
        
        // Kiểm tra cấu trúc reminder
        if (!card.reminder || typeof card.reminder.value !== 'number' || !card.reminder.unit) {
          continue
        }

        const notificationTime = dueDateMoment.clone().subtract(card.reminder.value, card.reminder.unit)

        // Nếu đã tới hoặc qua thời gian thông báo
        if (now.isSameOrAfter(notificationTime)) {
          // Gửi email cho tất cả members
          if (card.memberIds && card.memberIds.length > 0) {
            const members = await GET_DB().collection(USER_COLLECTION_NAME).find({
              _id: { $in: card.memberIds.map(id => typeof id === 'string' ? new ObjectId(id) : id) }
            }).toArray()

            for (const member of members) {
              const subject = `[Thông báo] Thẻ "${card.title}" sắp đến hạn hoàn thành!`
              const htmlContent = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #172b4d; max-width: 600px; margin: auto; border: 1px solid #ebecf0; border-radius: 8px; overflow: hidden;">
                  <div style="background-color: #0052cc; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nhắc nhở công việc</h1>
                  </div>
                  <div style="padding: 30px;">
                    <p>Xin chào <strong>${member.displayName || member.email}</strong>,</p>
                    <p>Chúng tôi gửi thông báo này để nhắc bạn rằng thẻ công việc sau đây sắp đến hạn:</p>
                    <div style="background-color: #f4f5f7; padding: 20px; border-radius: 6px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #0052cc;">${card.title}</h3>
                      <p style="margin-bottom: 0;">Thời hạn: <strong style="color: #ae2e24;">${dueDateMoment.utcOffset(7).format('HH:mm DD/MM/YYYY')}</strong></p>
                    </div>
                    <p>Hãy nhanh chóng truy cập vào bảng để kiểm tra và hoàn thành công việc đúng hạn nhé!</p>
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${env.WEBSITE_DOMAIN}/boards/${card.boardId}" 
                         style="background-color: #0052cc; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                         Xem chi tiết thẻ
                      </a>
                    </div>
                  </div>
                  <div style="background-color: #f4f5f7; padding: 15px; text-align: center; font-size: 12px; color: #5e6c84;">
                    Đây là email tự động từ hệ thống Trello Clone. Vui lòng không trả lời email này.
                  </div>
                </div>
              `
              await BrevoProvider.sendEmail(member.email, subject, htmlContent)
            }
          }

          // Đánh dấu đã gửi
          await GET_DB().collection(CARD_COLLECTION_NAME).updateOne(
            { _id: card._id },
            { $set: { reminderSent: true } }
          )
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in card reminder cron job:', error)
    }
  })
}
