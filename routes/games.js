// routes/games.js
const router = require('express').Router()
const passport = require('../config/auth')
const { Game } = require('../models')
const utils = require('../lib/utils')
const processMove = require('../lib/processMove')
const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
    .get('/games', (req, res, next) => {
      Game.find()
        // Newest games first
        .sort({ createdAt: -1 })
        // Send the data in JSON format
        .then((games) => res.json(games))
        // Throw a 500 error if something goes wrong
        .catch((error) => next(error))
    })
    .get('/games/:id', (req, res, next) => {
      const id = req.params.id

      Game.findById(id)
        .then((game) => {
          if (!game) { return next() }
          res.json(game)
        })
        .catch((error) => next(error))
    })
    .post('/games', authenticate, (req, res, next) => {
      const newGame = {
        userId: req.account._id,
        players: [{
          userId: req.account._id
        }]
      }

      Game.create(newGame)
        .then((game) => {
          io.emit('action', {
            type: 'GAME_CREATED',
            payload: game
          })
          res.json(game)
        })
        .catch((error) => next(error))
    })
    .put('/games/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const updatedGame = req.body

      Game.findByIdAndUpdate(id, { $set: updatedGame }, { new: true })
        .then((game) => {
          io.emit('action', {
            type: 'GAME_UPDATED',
            payload: game
          })
          res.json(game)
        })
        .catch((error) => next(error))
    })
    .patch('/games/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const weapon = req.body.move
      const userId = req.account.id.toString()
      console.log(id,'<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
      Game.findById(id)
        .then((game) => {
          // let patchForGame = JSON.parse(JSON.stringify(game))
          // console.log(game.players)
          // const  player0  = game.players[0].userId.toString()
          // const  player1  = game.players[1].userId.toString()
          // console.log(player0,player1)
          // let players = game.players
          if (!game) { return next() }
          // debugger
          // if(userId== player0 ) {
          //   if (players[0].symbol === null ){
          //     game.players[0].symbol = weapon
          //     console.log(game.player[0].symbol)
          //   }
          // }
          // else if (userId== player1){
          //   if (players[1].symbol === null ){
          //     game.players[1].symbol = weapon
          //     console.log(game.player[1].symbol)
          //   }
          // }
          const updatedGame = processMove(game,weapon, userId)
          console.log(updatedGame)
          debugger
          Game.findByIdAndUpdate(id, { $set: updatedGame }, { new: true })
            .then((game) => {
              // debugger
              io.emit('action', {
                type: 'GAME_UPDATED',
                payload: game
              })
              res.json(game)
            })
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })
    .delete('/games/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      Game.findByIdAndRemove(id)
        .then(() => {
          io.emit('action', {
            type: 'GAME_REMOVED',
            payload: id
          })
          res.status = 200
          res.json({
            message: 'Removed',
            _id: id
          })
        })
        .catch((error) => next(error))
    })

  return router
}
