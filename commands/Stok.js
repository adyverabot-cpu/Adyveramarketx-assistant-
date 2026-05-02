const fs = require('fs')

module.exports = async (sock, jid, type, text) => {
try {

const path = './database/stok.json'

if (!fs.existsSync(path)) {
fs.writeFileSync(path, JSON.stringify([]))
}

let db = JSON.parse(fs.readFileSync(path))

if(type === "post"){

if(!text) return sock.sendMessage(jid,{text:"Contoh:\n.postakun ML Sultan 500K"})

let nomor = db.length + 1

db.push({
id: nomor,
nama: text,
status: "READY"
})

fs.writeFileSync(path, JSON.stringify(db,null,2))

return sock.sendMessage(jid,{
text:`✅ STOK BARU MASUK

No: ${nomor}
Akun: ${text}
Status: READY`
})
}

if(type === "sold"){

if(!text) return sock.sendMessage(jid,{text:"Contoh:\n.sold 1"})

let id = parseInt(text)

let cari = db.find(v => v.id === id)

if(!cari) return sock.sendMessage(jid,{text:"Nomor stok tidak ditemukan"})

cari.status = "SOLD"

fs.writeFileSync(path, JSON.stringify(db,null,2))

return sock.sendMessage(jid,{
text:`🔥 STOK NOMOR ${id} SOLD`
})
}

if(type === "list"){

let hasil = db.map(v =>
`${v.id}. ${v.nama} [${v.status}]`
).join("\n")

if(!hasil) hasil = "Belum ada stok"

return sock.sendMessage(jid,{
text:`╔══ STOK AKUN ══╗\n${hasil}`
})
}

} catch(err){
await sock.sendMessage(jid,{text:"Stok system error"})
}
  }
