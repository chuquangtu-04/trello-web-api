import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

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

const updateCard = async (overColumnId, activeCardId) => {
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


export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  updateCard
}