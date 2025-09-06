import Joi, { object } from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validateData = await validateBeforeCreate(data)
    // Biến đổi một số dữ liệu liên quan đến ObjectId chuẩn chỉnh
    const newColumnToAdd = {
      ...validateData,
      boardId: ObjectId.createFromHexString(validateData.boardId)
    }
    const createColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newColumnToAdd)
    return createColumn
  } catch (error) {throw new Error(error)}
}
const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
      _id: ObjectId.createFromHexString(id)
    })
    return result
  } catch (error) {throw new Error(error)}
}
const pushCardOrderIds = async (card) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: ObjectId.createFromHexString(card.columnId.toString())
      },
      {
        $push: { cardOrderIds: ObjectId.createFromHexString(card._id.toString()) }
      },
      {
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {throw new Error(error)}
}

// Sắp xếp lại thứ tự của column bằng cách cập nhật columnOrderIds
const updateColumn = async (columnId, newColumnData) => {
  newColumnData.cardOrderIds = newColumnData.cardOrderIds.map(c => ObjectId.createFromHexString(c))
  Object.keys(newColumnData).forEach(fieldName => {
    if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
      delete newColumnData[fieldName]
    }
  })
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: ObjectId.createFromHexString(columnId)
      },
      {
        $set: newColumnData
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {throw new Error(error)}
}
const updateCardOutColumn = async (activeColumnId, overColumnId, newUpdateActiveColumn, newUpdateOverColumn) => {
  newUpdateActiveColumn.cardOrderIds = newUpdateActiveColumn.cardOrderIds.map(c => ObjectId.createFromHexString(c))
  newUpdateOverColumn.cardOrderIds = newUpdateOverColumn.cardOrderIds.map(c => ObjectId.createFromHexString(c))
  Object.keys(newUpdateActiveColumn).forEach(fieldName => {
    if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
      delete newUpdateActiveColumn[fieldName]
    }
  })
  Object.keys(newUpdateOverColumn).forEach(fieldName => {
    if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
      delete newUpdateOverColumn[fieldName]
    }
  })
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).bulkWrite([
      {
        updateOne: {
          filter: { _id: ObjectId.createFromHexString(activeColumnId) },
          update: { $set: newUpdateActiveColumn }
        }
      },
      {
        updateOne: {
          filter: { _id: ObjectId.createFromHexString(overColumnId) },
          update: { $set: newUpdateOverColumn }
        }
      }
    ])
    return result
  } catch (error) {throw new Error(error)}
}
// Xóa mềm column
const softDeleteColumn = async (columnId, updateData) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: ObjectId.createFromHexString(columnId)
      },
      {
        $set: updateData
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {throw new Error(error)}
}
export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
  updateColumn,
  updateCardOutColumn,
  softDeleteColumn
}