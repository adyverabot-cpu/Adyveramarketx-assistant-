const fs = require('fs')

module.exports = async (sock,jid) => {

let db = JSON.parse(fs.readFileSync('./database/users.json'))

let data = Object.entries(db)
.sort((a,b)=>b[1].koin-a[1].koin)
.slice(0,10)

let teks = '🪙 TOP KOIN USER 🪙\n\n'

data.forEach((v,i)=>{
teks += `${i+1}. ${v[0].split('@')[0]} - ${v[1].koin} koin\n`
})

sock.sendMessage(jid,{text:teks})
}
