module.exports = async (sock,jid,config,pushname) => {

let teks = `
╔════════════════════╗
   🤖 ${config.botName}
╚════════════════════╝

👤 User : ${pushname}
📌 Prefix : ${config.prefix}

╔═ MENU UTAMA ═╗
.menu
.profile
.owner
.listowner
.listadmin

╔═ TOPUP MENU ═╗
.topupml
.topupff
.topuppubg
.topupvalorant
.pulsa
.data
.voucher

╔═ MARKET MENU ═╗
.jualakun
.beliakun
.bt
.tt
.rekber
.mc
.stok

╔═ GROUP MENU ═╗
.breakingnews
.antilink on/off
.welcome on/off
.goodbye on/off

╔═ OWNER MENU ═╗
.addadmin
.deladmin
.addowner
.delowner
.bc
.done akun
.done topup

╚════════════════════╝
© ADYVERA TV
`

await sock.sendMessage(jid,{ text: teks })

}
