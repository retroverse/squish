const PhysicsEntity = require('./physicsEntity')
const PlayerEntity = require('./playerEntity')
const BirthEntity = require('./birthEntity')
const initTogglingPlayers = require('./togglingPlayers')
const { inputs } = require('./input')
const { least, most } = require('./util')
let entities = []
window.entities = [] // Kept in sync

const playerColours = ['#5468fe', '#fe4c55', '#ff9800', '#4caf50']
const playerSpawns = [
  [275, 290],
  [675, 290],
  [300, 490],
  [650, 490],
  [200, 60],
  [700, 60]
]

// Initialise toggling players
initTogglingPlayers()

const spawnPlayer = (n, opts, delayRespawn) => {
  const players = entities.filter(e => e.isPlayer || e.label === 'birth')
  let spawn = playerSpawns[Math.round(Math.random() * (playerSpawns.length - 1))]
  if (players.length) {
    const dist = ([ax, ay]) => ({x: bx, y: by}) => Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2)
    const distToNearestPlayer = (spawn) => dist(spawn)(players.reduce(least(dist(spawn))))
    spawn = playerSpawns.reduce(most(distToNearestPlayer))
  }
  const playerOpts = { number: n, colour: playerColours[n], inputs: inputs[n], spawnPlayer }
  const player = new PlayerEntity(...spawn, 50, 50, {...playerOpts, ...opts})
  entities.push(new BirthEntity(...spawn, 50, 50, { number: n, colour: player.getColour(), spawn: player, label: 'birth', dontProgressTime: delayRespawn }))
}

spawnPlayer(0)
spawnPlayer(1)
spawnPlayer(2)
spawnPlayer(3)

entities.push(new PhysicsEntity(150, 600, 700, 60, { colour: '#313131', kinematic: true, label: 'obstacle' }))
entities.push(new PhysicsEntity(200, 400, 200, 20, { colour: '#313131', kinematic: true, label: 'obstacle' }))
entities.push(new PhysicsEntity(600, 400, 200, 20, { colour: '#313131', kinematic: true, label: 'obstacle' }))

const addEntity = entity => entities.push(entity)

const byDepth = (a, b) => b.depth - a.depth

const main = ctx => {
  entities.sort(byDepth).forEach(ent => {
    ent.update(entities.filter(e => e !== ent), { addEntity })
    ent.draw(ctx)
  })
  entities = entities.filter(e => !e.remove)
  window.entities = entities
}

module.exports = main
