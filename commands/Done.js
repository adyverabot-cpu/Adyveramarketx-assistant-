module.exports = async (sock, jid, type, text, groups) => {
try {

if(type === "akun"){

if(!text) return sock.sendMessage(jid,{
text:
`Contoh:
.done akun 62812xxxx|Mobile Legends|Tukar Tambah|20:10 WIB`
})

let data = text.split("|")

if(data.length < 4) return sock.sendMessage(jid,{
text:"Data kurang!\nFormat:\n.done akun nomor|game|status|waktu"
})

let nomor = data[0]
let game = data[1]
let status = data[2]
let waktu = data[3]

let msg = `
🚨 BREAKING NEWS ADYVERA TV 🚨

@${nomor} baru saja melakukan BT / TT AKUN sukses 🔥

Game : ${game}
Status : ${status}
Waktu : ${waktu}

Terima kasih telah memakai jasa ADYVERAMARKETX
`

for(let g of groups){
await sock.sendMessage(g,{text:msg,mentions:[nomor+"@s.whatsapp.net"]})
}

return
}

if(type === "topup"){

if(!text) return sock.sendMessage(jid,{
text:
`Contoh:
.done topup 62812xxxx|Free Fire|70 Diamond|10000|20:10 WIB`
})

let data = text.split("|")

if(data.length < 5) return sock.sendMessage(jid,{
text:"Data kurang!\nFormat:\n.done topup nomor|game|nominal|harga|waktu"
})

let nomor = data[0]
let game = data[1]
let nominal = data[2]
let harga = data[3]
let waktu = data[4]

let msg = `
🚨 BREAKING NEWS ADYVERA TV 🚨

@${nomor} baru saja melakukan TOP UP sukses 🔥

Game : ${game}
Nominal : ${nominal}
Harga : ${harga}
Waktu : ${waktu}

Terima kasih telah memakai jasa ADYVERAMARKETX
`

for(let g of groups){
await sock.sendMessage(g,{text:msg,mentions:[nomor+"@s.whatsapp.net"]})
}

return
}

if(type === "bc"){

if(!text) return sock.sendMessage(jid,{text:"Contoh:\n.bc Halo semua"})

for(let g of groups){
await sock.sendMessage(g,{text:text})
}

return sock.sendMessage(jid,{text:"Broadcast sukses"})
}

} catch(err){
await sock.sendMessage(jid,{text:"Owner menu error"})
}
}
