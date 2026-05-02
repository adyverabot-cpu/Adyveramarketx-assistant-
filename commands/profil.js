const fs = require('fs')

module.exports = async (sock, jid, sender, pushname) => {
try {

const usersPath = './database/users.json'
const vipPath = './database/vip.json'
const vvipPath = './database/vvip.json'

if (!fs.existsSync(usersPath)) fs.writeFileSync(usersPath, '{}')
if (!fs.existsSync(vipPath)) fs.writeFileSync(vipPath, '{}')
if (!fs.existsSync(vvipPath)) fs.writeFileSync(vvipPath, '{}')

let db = JSON.parse(fs.readFileSync(usersPath))
let vip = JSON.parse(fs.readFileSync(vipPath))
let vvip = JSON.parse(fs.readFileSync(vvipPath))

if (!db[sender]) {
db[sender] = {
chat: 0,
koin: 0,
trx: 0,
role: 'MEMBER',
join: new Date().toLocaleDateString('id-ID')
}
fs.writeFileSync(usersPath, JSON.stringify(db, null, 2))
}

let user = db[sender]

if (vvip[sender]) user.role = 'VVIP'
else if (vip[sender]) user.role = 'VIP'

let totalPoint = user.koin + user.chat + (user.trx * 10)

let ranking = Object.entries(db)
.sort((a,b)=>{
let pa = a[1].koin + a[1].chat + (a[1].trx * 10)
let pb = b[1].koin + b[1].chat + (b[1].trx * 10)
return pb - pa
})
.findIndex(v => v[0] == sender) + 1

let totalUser = Object.keys(db).length

let level = 'Pemula'
if (user.chat >= 100) level = 'Aktif'
if (user.chat >= 300) level = 'Sultan'
if (user.chat >= 700) level = 'Legend'
if (user.chat >= 1500) level = 'Titan'

let badge = '🥉'
if (user.role == 'VIP') badge = '💎'
if (user.role == 'VVIP') badge = '👑'

let teks = `
╔════ PROFILE ULTIMATE ════╗
👤 Nama : ${pushname}
📱 Nomor : ${sender.split('@')[0]}
💬 Chat : ${user.chat}
🪙 Koin : ${user.koin}
🛒 Transaksi : ${user.trx}
🏆 Ranking : #${ranking}
${badge} Status : ${user.role}
🔥 Level : ${level}
📅 Join : ${user.join}
📊 Point : ${totalPoint}
👥 Total User : ${totalUser}
╚═══════════════════════╝
`

await sock.sendMessage(jid,{ text: teks })

} catch(err){
await sock.sendMessage(jid,{ text:'Gagal membuka profile' })
}
}
