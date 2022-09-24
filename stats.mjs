import fs from 'fs'
import fetch from 'node-fetch'
import { parse } from 'node-html-parser'
import { table } from 'table'

process.env.TZ = 'Europe/Madrid'

const url = 'https://www.opinionstage.com/polls/2862718/poll'
const totalUrl = 'https://www.opinionstage.com/widgets/api/polls/2862718/votes'

function extractDataOption (option) {
  return [
    option.querySelector('.w-option__label').textContent,
    option.querySelector('.w-option__stats').textContent
  ]
}

async function getPollOptions () {
  const res = await fetch(url)
  const root = parse(await res.text())
  const options = root.querySelectorAll('.w-option')
  return options
    .map(option => extractDataOption(option))
    .sort((a, b) => parseInt(b[1], 10) - parseInt(a[1], 10))
    .map((option, index) => [index + 1, ...option])
}

async function getTotalVotes () {
  const res = await fetch(totalUrl)
  const json = await res.json()
  return json.count
}

async function start () {
  const data = await getPollOptions()
  const votes = await getTotalVotes()
  const date = new Date().toLocaleString('es-ES')
  const headerContent = `${votes} VOTOS\n${date}`

  const config = {
    header: { content: headerContent },
    columns: [
      { alignment: 'right' },
      { alignment: 'left' },
      { alignment: 'right' }
    ]
  }

  fs.writeFileSync('stats.txt', table(data, config))

  console.log('OK.')
}

start()
