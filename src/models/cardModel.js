import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Dữ liệu comments của Card chúng ta sẽ học cách nhúng --- embedded vào bản ghi Card luôn như dưới đây:
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    // Chỗ này lưu ý: vì dùng hàm $push để thêm comment nên không set default Date.now luôn giống hàm insertOne khi create được.
    commentedAt: Joi.date().timestamp()
  }).default([]),


  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validateData = await validateBeforeCreate(data)
    // Biến đổi một số dữ liệu liên quan đến ObjectId chuẩn chỉnh
    const newCardToAdd = {
      ...validateData,
      boardId: ObjectId.createFromHexString(validateData.boardId),
      columnId: ObjectId.createFromHexString(validateData.columnId)
    }
    const createCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd)
    return createCard
  } catch (error) {throw new Error(error)}
}
const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: ObjectId.createFromHexString(id)
    })
    return result
  } catch (error) {throw new Error(error)}
}

const updateCardOutColumn = async (overColumnId, activeCardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: ObjectId.createFromHexString(activeCardId)
      },
      {
        $set: { columnId: ObjectId.createFromHexString(overColumnId) }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {throw new Error(error)}
}
const updateCard = async (cardId, newCardData) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: ObjectId.createFromHexString(cardId)
      },
      {
        $set: newCardData
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {throw new Error(error)}
}

// Xóa cards trong column
const hardDeleteCard = async (columnId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany(
      {
        columnId: ObjectId.createFromHexString(columnId)
      }
    )
    return result
  } catch (error) {throw new Error(error)}
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  updateCardOutColumn,
  hardDeleteCard,
  updateCard
}