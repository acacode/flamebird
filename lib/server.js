var express = require('express')
const bodyParser = require('body-parser')
const http = require('http')

function createServer(port) {
  var app = express()
  app.use(bodyParser.urlencoded())

  app.use(bodyParser.json())
  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/app/index.html') // eslint-disable-line
  })
  app.use(express.static(__dirname + '/app')) // eslint-disable-line
  const server = http.createServer(app)

  require('./ws')(server)
  // start our server
  server.listen(port, function() {
    console.log('Server started on port ' + server.address().port + ' :)')
  })
  return app
}

module.exports.createServer = createServer
