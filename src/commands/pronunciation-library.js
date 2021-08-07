let {getSessionToken, Admin} = require('../admin')

function register(program) {
  program
    .command('pronunciation <library>')
    .action(library => {
      program.getPassword().then(password => main(library, program, password))
    })
}


function openDB(filename) {
  const sqlite3 = require('sqlite3')
  const {open} = require('sqlite')

  return open({
    filename,
    driver: sqlite3.Database
  })
}

async function main(library, program, password) {
  let db = await openDB(library)
  let admin = new Admin(program.destination, program.username, password)
  let promises = []

  await db.each(
    'select authors, copyright, license, name, org, url, lang from collections',
    [],
    (err, row) => {
      promises.push(
        admin.addPronunciationCollection(row)
        .catch(e => {
          console.error(e)
          process.exit(1)
        })
      )

    }
  )
  
  await Promise.all(promises)


  let {count} = await db.get('select count(*) as count from entries')
  let lastId = 0
  const BATCH_SIZE = 100

  while(count > 0) {
    let batch = await db.all(
      'select * from entries where id > ? order by id limit ?', 
      lastId, 
      Math.min(BATCH_SIZE, count)
    )


    count -= batch.length
    lastId = batch[batch.length - 1].id
  
    await Promise.all(
      batch.map(entry => 
        admin.addPronunciationEntry(entry)
        .catch(e => {
          process.error(e)
          process.exit(1)
        })
      )
    )
  } 

}

module.exports = {register}
