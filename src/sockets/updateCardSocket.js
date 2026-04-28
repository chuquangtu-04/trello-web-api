export const updateCardSocket = (socket) => {
  // Join card room
  socket.on('FE_USER_JOINED_CARD', (cardId) => {
    socket.join(`card_${cardId}`)
    // console.log('User joined card room:', `card_${cardId}`)
  })

  // Leave card room
  socket.on('FE_USER_LEFT_CARD', (cardId) => {
    socket.leave(`card_${cardId}`)
    // console.log('User left card room:', `card_${cardId}`)
  })

  socket.on('FE_CARD_COMPLETED_TOGGLED', (updatedCard) => {
    socket.broadcast.emit('BE_CARD_COMPLETED_TOGGLED', updatedCard)
  })

  // Typing event
  socket.on('FE_USER_TYPING_COMMENT', (data) => {
    // data: { cardId, userDisplayName }
    socket.to(`card_${data.cardId}`).emit('BE_USER_TYPING_COMMENT', data)
  })

  socket.on('FE_USER_STOPPED_TYPING_COMMENT', (data) => {
    socket.to(`card_${data.cardId}`).emit('BE_USER_STOPPED_TYPING_COMMENT', data)
  })
}
