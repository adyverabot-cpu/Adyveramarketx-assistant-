const fs = require('fs')

module.exports = async (sock, jid) => {

let db = JSON.parse(fs.readFileSync('./database/users.json'))

let data = Object.entries(db)
.sort((a,b) => b[1].chat - a[1].chat)
.slice(0,10)

let teks = '💬 TOP CHAT USER 💬\n\n'

data.forEach((v,i)=>{
teks += `${i+1}. ${v[0].split('@')[0]} - ${v[1].chat} chat\n`
})

await sock.sendMessage(jid,{ text: teks })

}
