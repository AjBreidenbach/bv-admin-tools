#!/usr/bin/env node
const fs = require('fs')
const Path = require('path')
const Prompt = require('prompt-password')

const {Command} = require('commander')

let program = new Command()

program
.option('-d, --destination <url>')
.option('-u, --username <login>')
.hook('preAction', _ => {
  let {username, destination} = program.opts()
  program.username = username
  program.destination = destination || 'http://localhost:6992'
  let promptPromise
  if (username) {
    let prompt = new Prompt({
      type: 'password',
      message: `Enter password for ${username}:`,
      name: 'password'
    })

    promptPromise = prompt.run()
  }
  program.getPassword = _ => promptPromise || new Promise(resolve => resolve(null))
})

for (let command of fs.readdirSync(Path.join(__dirname, 'src', 'commands'))) {
  let commandModule = require(`./src/commands/${command}`)

  commandModule.register(program)
  
}

program.parse()

