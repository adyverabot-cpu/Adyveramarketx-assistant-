const fs = require('fs')

module.exports = async (sock, jid) => {

let db = JSON.parse(fs.readFileSync('./database/users.json'))

let data = Object.entries(db).sort((a,b)=>{
let pa = a[1].chat + a[1].koin + (a[1].trx * 10)
let pb = b[1].chat + b[1].koin + (b[1].trx * 10)
return pb - pa
}).slice(0,10)

let teks = '🏆 LEADERBOARD TOP 10 🏆\n\n'

data.forEach((v,i)=>{
teks += `${i+1}. ${v[0].split('@')[0]}\n`
teks += `💬${v[1].chat} 🪙${v[1].koin} 🛒${v[1].trx}\n\n`
})

await sock.sendMessage(jid,{ text: teks })

}
