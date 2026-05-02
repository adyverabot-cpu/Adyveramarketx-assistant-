const fs = require('fs')

module.exports = async (sock, jid, sender, pushname) => {
try {
const path = './database/users.json'

if (!fs.existsSync(path)) {
fs.writeFileSync(path, JSON.stringify({}))
}

let db = JSON.parse(fs.readFileSync(path))

if (!db[sender]) {
db[sender] = {
chat: 0,
koin: 0,
trx: 0,
role: "MEMBER",
join: new Date().toLocaleDateString("id-ID")
}
fs.writeFileSync(path, JSON.stringify(db, null, 2))
}

let user = db[sender]

let ranking = Object.entries(db)
.sort((a,b) => b[1].koin - a[1].koin)
.findIndex(v => v[0] == sender) + 1

let level = "Pemula"

if (user.chat >= 100) level = "Aktif"
if (user.chat >= 300) level = "Sultan"
if (user.chat >= 700) level = "Legend"
if (user.chat >= 1500) level = "Titan"

let teks = `
╔═══ PROFILE USER ═══╗
👤 Nama : ${pushname || "User"}
📱 Nomor : ${sender.split("@")[0]}
💬 Total Chat : ${user.chat}
🪙 Koin : ${user.koin}
🏆 Ranking : #${ranking}
💎 Status : ${user.role}
🛒 Transaksi : ${user.trx}
📅 Join : ${user.join}
🔥 Level : ${level}
╚══════════════════╝
`

await sock.sendMessage(jid,{text:teks})

} catch(err){
await sock.sendMessage(jid,{text:"Gagal membuka profile"})
}
}
