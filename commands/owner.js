module.exports = async (sock, jid, config) => {
try {

let teks = `
╔══ OWNER ADYVERA ══╗

👑 Nama : ${config.ownerName}
📱 Nomor : ${config.ownerNumber}

📞 Chat Owner:
https://wa.me/${config.ownerNumber}

💼 Layanan:
• Top Up Game
• Jual Beli Akun
• Rekber
• MC
• Jasa Grup

🔥 Powered by ${config.botName}
╚═══════════════╝
`

await sock.sendMessage(jid,{text:teks})

} catch(err){
await sock.sendMessage(jid,{text:"Owner error"})
}
}
