const fs = require('fs')

module.exports = async (sock, jid, config, pushname) => {
try {

const path = './database/users.json'

if (!fs.existsSync(path)) {
fs.writeFileSync(path, JSON.stringify({}))
}

let db = JSON.parse(fs.readFileSync(path))
let totalUser = Object.keys(db).length

let teks = `
╔════════════════════╗
      🤖 ${config.botName}
╚════════════════════╝

Halo ${pushname || "User"} 👋

📊 Total Pengguna : ${totalUser}
👑 Owner : ${config.ownerName}

╔══ MENU UTAMA ══╗
.menu
.profile
.owner
.top50
.vip
.vvip
╚═══════════════╝

╔══ TOPUP MENU ══╗
.topupml
.topupff
.topuppubg
.topupvalorant
.pulsa
.data
.voucher
╚═══════════════╝

╔══ MARKET MENU ══╗
.jualakun
.beliakun
.bt
.tt
.stok
.postakun
.sold
.rekber
.mc
╚═══════════════╝

╔══ GROUP MENU ══╗
.antilink on
.antilink off
.warn
.kick
╚═══════════════╝

╔══ OWNER MENU ══╗
.done akun
.done topup
.bc
╚═══════════════╝

Terima kasih memakai
${config.tvName} 🔥
`

await sock.sendMessage(jid,{text:teks})

} catch(err){
await sock.sendMessage(jid,{text:"Menu error"})
}
                       }
