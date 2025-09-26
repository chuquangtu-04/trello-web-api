import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPE } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { cardModel } from './cardModel'
import { columnModel } from './columnModel'
import { pagingSkipValue } from '~/utils/algorithms'

// Define collection (Name & Schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required(),
  columnOrderIds:Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // Những admin của board
  ownerIds:Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // Thành viên của board
  memberIds:Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Tạo board
const createNew = async (userId, data) => {
  try {
    const validateData = await validateBeforeCreate(data)
    const updateAddNewColumn = {
      ...validateData,
      ownerIds: [ObjectId.createFromHexString(userId)]
    }
    const createBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(updateAddNewColumn)
    return createBoard
  } catch (error) {throw new Error(error)}
}
// Tìm trả về board
const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: ObjectId.createFromHexString(id)
    })
    return result
  } catch (error) {throw new Error(error)}
}
// Query tổng hợp (aggregate) để lấy toàn bộ column và Cards thuộc về board
const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: ObjectId.createFromHexString(boardId) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        }
      ]
    ).toArray()
    return result[0] || null
  } catch (error) {throw new Error(error)}
}

// Nhiệm vụ của fn này là push 1 cái giá trị columnId vào cuối mảng columnOrdersIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: ObjectId.createFromHexString(column.boardId.toString())
      },
      {
        $push: { columnOrderIds: ObjectId.createFromHexString(column._id.toString()) }
      },
      {
        returnDocument: 'after'
      }
    )
    return result || null
  } catch (error) {throw new Error(error)}
}

const update = async (boardId, newColumnData) => {
  try {
    Object.keys(newColumnData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete newColumnData[fieldName]
      }
    })
    const newColumn = newColumnData.columnOrderIds.map(c => ObjectId.createFromHexString(c))
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: ObjectId.createFromHexString(boardId) },
      {
        $set: { columnOrderIds: newColumn }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {throw new Error(error)}
}

const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: column.boardId },
      {
        $pull: { columnOrderIds: column._id }
      },
      {
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {throw new Error(error)}
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      // Điều kiện 01: Board chưa bị xóa
      { _destroy: false },
      // Điều kiện 02: cái thằng userId đang thực hiện request này nó phải thuộc vào một trong 2 cái mảng
      // ownerIds hoặc memberIds, sử dụng toán tử $all của mongodb
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // sort title của board theo A-Z (mặc định sẽ bị: chữ B hoa đứng trước chữ a thường (theo chuẩn bảng mã ASCII))
        { $sort: { title: 1 } },
        // $facet để xử lý nhiều luồng trong một query
        { $facet: {
        // Luồng 01: query boards
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemsPerPage) }, // bỏ qua số lượng bản ghi của những page trước đó
            { $limit: itemsPerPage } // giới hạn tối đa số lượng bản ghi trả về trên 1 page
          ],
          // Luồng 02: query đến tổng tất cả số lượng bản ghi boards trong DB và trả về vào biến countedAllBoards
          'queryTotalBoards': [{ $count: 'countedAllBoards' }]
        } }
      ],
      // Khai báo thêm thuộc tính collation locale 'en' để fix vụ chữ B hoa và a thường ở trên
      // https://www.mongodb.com/docs/v6.0/reference/collation/#std-label-collation-document-fields

      { collation: { locale: 'en' } }
    ).toArray()
    const res = query[0]
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {throw new Error(error)}
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  validateBeforeCreate,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards
}