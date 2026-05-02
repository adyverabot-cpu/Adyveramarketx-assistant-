module.exports = async (sock, jid, type, owner) => {
try {

let game = type.toUpperCase()
let teks = ""

if(type === "ml"){
teks = `
╔══ TOP UP MOBILE LEGENDS ══╗

💎 Diamond murah & cepat
📱 Order ke owner:
wa.me/${owner}

Format:
.topupml

🔥 ADYVERA TV
`
}

else if(type === "ff"){
teks = `
╔══ TOP UP FREE FIRE ══╗

💎 Diamond / Membership
📱 Order ke owner:
wa.me/${owner}

Format:
.topupff

🔥 ADYVERA TV
`
}

else if(type === "pubg"){
teks = `
╔══ TOP UP PUBG MOBILE ══╗

💎 UC cepat masuk
📱 Order ke owner:
wa.me/${owner}

Format:
.topuppubg
`
}

else if(type === "valorant"){
teks = `
╔══ TOP UP VALORANT ══╗

💎 VP murah aman
📱 Order ke owner:
wa.me/${owner}

Format:
.topupvalorant
`
}

else if(type === "pulsa"){
teks = `
╔══ ISI PULSA ══╗

📱 Semua Operator
📞 Order:
wa.me/${owner}

Format:
.pulsa
`
}

else if(type === "data"){
teks = `
╔══ PAKET DATA ══╗

📶 Semua Provider
📱 Order:
wa.me/${owner}

Format:
.data
`
}

else if(type === "voucher"){
teks = `
╔══ VOUCHER DIGITAL ══╗

🎫 Google Play
🎫 Garena
🎫 Steam
🎫 dll

📱 Order:
wa.me/${owner}

Format:
.voucher
`
}

else {
teks = `
╔══ TOPUP MENU ══╗
.topupml
.topupff
.topuppubg
.topupvalorant
.pulsa
.data
.voucher
╚══════════════╝
`
}

await sock.sendMessage(jid,{text:teks})

} catch(err){
await sock.sendMessage(jid,{text:"Topup system error"})
}
}
