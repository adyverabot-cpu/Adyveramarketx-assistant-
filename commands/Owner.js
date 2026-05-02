module.exports = async (sock, jid, config) => {
await sock.sendMessage(jid,{
text:`Owner: ${config.ownerName}
wa.me/${config.ownerNumber}`
})
}
