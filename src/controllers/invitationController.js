import { StatusCodes } from 'http-status-codes'
import { invitationService } from '~/services/invitationService'
const createNewBoardInvitation = async (req, res, next) => {
  try {
    // User thực hiện req này chính là Inviter - người đi mời
    const inviterId = req.jwtDecoded._id

    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId)
    res.status(StatusCodes.CREATED).json(resInvitation)
  } catch (error) {next(error)}
}

const getInvitations = async (req, res, next) => {
  try {
    // User thực hiện req này chính là Inviter - người đi mời
    const userId = req.jwtDecoded._id

    const resGetInvitations = await invitationService.getInvitations(userId)
    res.status(StatusCodes.OK).json(resGetInvitations)
  } catch (error) {next(error)}
}
export const invitationController = { createNewBoardInvitation, getInvitations }