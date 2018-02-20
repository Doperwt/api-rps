module.exports = (game,patchMove,player) => {
  if (!patchMove) {
    let err = new Error('you can not play alone')
      err.status = 422
      throw err}
  const { players } = game
  if (!!game.winnerId || game.draw){
    let err = new Error('game has already ended')
    err.status = 401
    throw err
  }

  if(players.length < 2){
    let err = new Error('you can not play alone')
    err.status = 422
    throw err
  }
  
  const playerIds = players.map(p => p.userId.toString())
  const imaPlayer = playerIds.includes(player)
  if(!imaPlayer){
    let err = new Error('you need to be a player')
    err.status = 401
    throw error
  }
  if(!['rock','paper','scissors'].includes(patchMove)){
    let err = new Error(`${patchMove} is not a valid move`)
    err.status = 422
    throw error
  }
  const newPlayers = game.players.map((player)=>{
    if(player.userId.toString()===player.userId.toString()){
      return { ...player, patchMove}
    }
  })
  debugger
}
