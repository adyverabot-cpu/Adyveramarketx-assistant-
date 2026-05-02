const fs = require('fs')

module.exports = async (sock, jid, type, text, groups) => {

const upath = './database/users.json'
const tpath = './database/transaksi.json'

if(!fs.existsSync(upath)) fs.writeFileSync(upath, JSON.stringify({}))
if(!fs.existsSync(tpath)) fs.writeFileSync(tpath, JSON.stringify([]))

let users = JSON.parse(fs.readFileSync(upath))
let trx = JSON.parse(fs.readFileSync(tpath))

function now(){
return new Date().toLocaleString("id-ID")
}

function addKoin(id,jumlah){
if(!users[id]){
users[id]={
chat:0,
koin:0,
trx:0,
role:'MEMBER',
join:new Date().toLocaleDateString("id-ID")
}
}
users[id].koin += jumlah
users[id].trx += 1
fs.writeFileSync(upath, JSON.stringify(users,null,2))
}

function saveTrx(data){
trx.push(data)
fs.writeFileSync(tpath, JSON.stringify(trx,null,2))
}

if(type === 'bc'){

if(!text) return sock.sendMessage(jid,{text:'Isi pesan broadcast'})

for(let g of groups){
await sock.sendMessage(g,{text:text})
}

return sock.sendMessage(jid,{text:'✅ Broadcast sukses ke semua grup'})
}

if(type === 'akun'){

let d = text.split('|')

if(d.length < 4){
return sock.sendMessage(jid,{
text:'Contoh:\n.done akun 62812xxxx|Mobile Legends|Tukar Tambah|20:10 WIB'
})
}

let nomor = d[0].replace(/\D/g,'')
let buyer = nomor + '@s.whatsapp.net'
let game = d[1]
let status = d[2]
let waktu = d[3]

addKoin(buyer,10)

let idtrx = 'AKN' + Date.now()

saveTrx({
id:idtrx,
buyer:nomor,
jenis:'AKUN',
game,
status,
waktu,
tanggal:now()
})

let msg = `
╔════════════════════╗
🚨 BREAKING NEWS ADYVERA TV 🚨
╚════════════════════╝

🧾 ID : ${idtrx}

@${nomor} baru saja melakukan
BT / TT AKUN sukses 🔥

🎮 Game : ${game}
📌 Status : ${status}
🕒 Waktu : ${waktu}
🎁 Reward : +10 Koin

Terima kasih telah memakai
ADYVERAMARKETX
`

for(let g of groups){
await sock.sendMessage(g,{
text:msg,
mentions:[buyer]
})
}

return sock.sendMessage(jid,{text:'✅ Breaking news akun terkirim'})
}

if(type === 'topup'){

let d = text.split('|')

if(d.length < 5){
return sock.sendMessage(jid,{
text:'Contoh:\n.done topup 62812xxxx|Free Fire|70 Diamond|10000|20:10 WIB'
})
}

let nomor = d[0].replace(/\D/g,'')
let buyer = nomor + '@s.whatsapp.net'
let game = d[1]
let nominal = d[2]
let harga = d[3]
let waktu = d[4]

addKoin(buyer,5)

let idtrx = 'TPU' + Date.now()

saveTrx({
id:idtrx,
buyer:nomor,
jenis:'TOPUP',
game,
nominal,
harga,
waktu,
tanggal:now()
})

let msg = `
╔════════════════════╗
🚨 BREAKING NEWS ADYVERA TV 🚨
╚════════════════════╝

🧾 ID : ${idtrx}

@${nomor} baru saja melakukan
TOP UP sukses 🔥

🎮 Game : ${game}
💎 Nominal : ${nominal}
💰 Harga : ${harga}
🕒 Waktu : ${waktu}
🎁 Reward : +5 Koin

Terima kasih telah memakai
ADYVERAMARKETX
`

for(let g of groups){
await sock.sendMessage(g,{
text:msg,
mentions:[buyer]
})
}

return sock.sendMessage(jid,{text:'✅ Breaking news topup terkirim'})
}

  }
