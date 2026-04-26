export const updateCardSocket = (socket) => {
  socket.on('FE_CARD_COMPLETED_TOGGLED', (updatedCard) => {
    // Phát lại sự kiện cho tất cả các client khác đang connect cùng namespace/room để cập nhật lại giao diện
    socket.broadcast.emit('BE_CARD_COMPLETED_TOGGLED', updatedCard)
  })
}
