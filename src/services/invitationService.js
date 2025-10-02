/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatter'
import { cloneDeep } from 'lodash'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người đi mời: chính là người đang request, nên chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)

    // Người được mời: lấy theo email nhận từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)

    // Tìm luôn cái board ra để lấy data xử lý
    const board = await boardModel.findOneById(reqBody.boardId)

    // Nếu không tồn tại 1 trong 3 thì cứ thẳng tay reject
    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // Tạo data chi tiết để lưu vào trong DB
    // (đoạn này có thể hoặc làm sai lệch type, boardInvitation, status để test xem Model validate chặt chưa.)
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)

    // Vì các dữ liệu inviter, invitee và board là đang ở giá trị mảng 1 phần tử
    // nếu lấy ra được nên chúng ta biến đổi nó về Json Object trước khi trả về.
    // const resInvitation = cloneDeep(getInvitations)
    // resInvitation.forEach(info => {
    //   info.inviterId = info.inviterId[0] || {},
    //   info.inviteeId = info.inviteeId[0] || {},
    //   info.board = info.board[0] || {}
    // })
    const resInvitation = getInvitations.map(i => ({
      ...i,
      inviterId: i.inviterId[0] || {},
      inviteeId: i.inviteeId[0] || {},
      board: i.board[0] || {}
    }))
    return resInvitation
  } catch (error) {
    throw error
  }
}

const updateInvitations = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

    // Sau khi có Invitation thì lấy full thông tin của board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId.toString())
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

    // Kiểm tra xem nếu status là ACCEPTED join board mà cái thằng user (invitee) đã là owner hoặc member của board rồi thì trả về thông báo lỗi luôn.
    // Note: 2 mảng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId nên cho nó về String hết luôn để check
    const updateData = {
      boardInvitation : { status: status, boardId: boardId },
      updatedAt: Date.now()
    }
    // const BE_allUsers = getBoard.memberIds.concat(getBoard.ownerIds)
    const BE_allUsers = [...getBoard.memberIds, ...getBoard.ownerIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && BE_allUsers.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are on board')
      // result = await invitationModel.update(invitationId, updateData)
      // await boardModel.updateMemberOrOwner(boardId.toString(), { memberIds: userId })
    }

    // Bước 1: Cập nhật status trong bản ghi Invitation
    const updateInvitation = await invitationModel.update(invitationId, updateData)
    // Bước 2: Nếu trong trường hợp Accept một lời mời thành công, thì cần phải thêm thông tin của thằng user
    // (userId) vào bản ghi memberIds trong collections board
    if (updateInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMembersIds(boardId.toString(), { memberIds: userId })
    }
    return updateInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation, getInvitations, updateInvitations
}
