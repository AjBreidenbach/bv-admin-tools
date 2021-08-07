const fetch = require('node-fetch')
const assert = require('assert')

const {Agent} = require('http')

const agent = new Agent({keepAlive: true})

class Admin {
  constructor(origin, email, password) {
    this.origin = origin
    this.email = email
    this.password = password
  }


  async login() {
    this.token = await getSessionToken(this.origin, this.email, this.password)
    return this.token
  }


  async rpc(action, parameters) {
    if(!this.token) { await this.login() }
    assert(this.token, 'unable to log in')
    assert(typeof parameters == 'object', `parameters is not an object ${parameters}`)

    let result = await fetch(`${this.origin}/api/admin?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': this.token
      },
      body: JSON.stringify(parameters),
      agent
    })
    
    return result
  }


  ping(message) {
    return this.rpc('ping', {message})
  }

  addPronunciationCollection(author, copyright, license, name, org, url, lang) {
    if(typeof author == 'object')
      return this.rpc('addPronunciationCollection', author)

    return this.rpc('addPronunciationCollection', {author, copyright, license, name, org, url, lang})
  }


  addPronunciationEntry(collectionURL, text, audio) {
    if(typeof collectionURL == 'object') {
      let entry = collectionURL
      return this.addPronunciationEntry(entry.collectionURL, entry.text, entry.audio)
    }


    if(audio.constructor && audio.constructor.name == 'Buffer') {
      audio = audio.toString('base64')
    }

    
    return this.rpc('addPronunciationEntry', {collectionURL, text, audio})
  }
}


async function getSessionToken(origin, email, password) {

  let res =  await fetch(`${origin}/api/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  })

  let cookieHeader = res.headers.get('set-cookie')

  if(typeof cookieHeader == 'string')
    return cookieHeader.slice(0, cookieHeader.indexOf(';'))
}

module.exports = {Admin, getSessionToken}
