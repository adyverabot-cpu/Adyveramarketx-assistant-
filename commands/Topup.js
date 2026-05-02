module.exports = async (sock, jid, game, owner) => {
try {

let teks = `
╔══ TOP UP ${game.toUpperCase()} ══╗

Silakan order ke owner:

📱 wa.me/${owner}

💸 Harga murah
⚡ Proses cepat
✅ Aman & terpercaya

Powered by ADYVERA TV
`

await sock.sendMessage(jid,{text:teks})

} catch(err){
await sock.sendMessage(jid,{text:"Topup error"})
}
}
