module.exports = async (sock, jid, type, owner) => {
try {

let teks = ""

if(type === "jual"){
teks = `
╔══ JUAL AKUN ══╗

Ingin menjual akun game?

📱 Hubungi owner:
wa.me/${owner}

Format:
.jualakun
`
}

else if(type === "beli"){
teks = `
╔══ BELI AKUN ══╗

Cari akun sultan / murah?

📱 Hubungi owner:
wa.me/${owner}

Format:
.beliakun
`
}

else if(type === "bt"){
teks = `
╔══ BARTER / TT AKUN ══╗

Bisa barter / tukar tambah akun

📱 Hubungi owner:
wa.me/${owner}

Format:
.bt
.tt
`
}

else if(type === "stok"){
teks = `
╔══ STOK AKUN READY ══╗

Gunakan:
.postakun (owner)
.sold (owner)

Atau chat owner:
wa.me/${owner}
`
}

else if(type === "rekber"){
teks = `
╔══ REKBER ADYVERA ══╗

Jasa rekening bersama aman

📱 Owner:
wa.me/${owner}
`
}

else if(type === "mc"){
teks = `
╔══ MC / MIDDLEMAN ══╗

Butuh perantara transaksi?

📱 Hubungi:
wa.me/${owner}
`
}

else {
teks = `
╔══ MARKET MENU ══╗
.jualakun
.beliakun
.bt
.tt
.stok
.rekber
.mc
╚══════════════╝
`
}

await sock.sendMessage(jid,{text:teks})

} catch(err){
await sock.sendMessage(jid,{text:"Market error"})
}
}
