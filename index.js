const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const P = require('pino')
const fs = require('fs')
const config = require('./config')

let groups = []

function readJSON(path, def){
if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(def,null,2))
return JSON.parse(fs.readFileSync(path))
}

function writeJSON(path,data){
fs.writeFileSync(path, JSON.stringify(data,null,2))
}

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState('./session')

const sock = makeWASocket({
auth: state,
logger: P({ level:'silent' })
})

sock.ev.on('creds.update', saveCreds)

sock.ev.on('connection.update', async ({ connection, qr }) => {

if(qr) qrcode.generate(qr,{small:true})

if(connection === 'open'){

console.log(config.botName + ' aktif')

let all = await sock.groupFetchAllParticipating()
groups = Object.keys(all)

}

if(connection === 'close'){
startBot()
}

})

sock.ev.on('group-participants.update', async (anu) => {

try{

let db = readJSON('./database/groups.json', {})
let set = db[anu.id] || {}

for(let user of anu.participants){

if(anu.action === 'add' && set.welcome){

await sock.sendMessage(anu.id,{
text:`👋 Selamat datang @${user.split('@')[0]} di ${config.tvName}`,
mentions:[user]
})

}

if(anu.action === 'remove' && set.goodbye){

await sock.sendMessage(anu.id,{
text:`👋 Selamat tinggal @${user.split('@')[0]}`,
mentions:[user]
})

}

}

}catch(e){}

})

sock.ev.on('messages.upsert', async ({ messages }) => {

try{

const m = messages[0]
if(!m.message) return

const jid = m.key.remoteJid
const sender = m.key.participant || jid
const pushname = m.pushName || 'User'

const text =
m.message.conversation ||
m.message.extendedTextMessage?.text ||
''

let users = readJSON('./database/users.json', {})
let vipdb = readJSON('./database/vip.json', {})
let groupdb = readJSON('./database/groups.json', {})
let admindb = readJSON('./database/admin.json', [])

if(!users[sender]){
users[sender] = {
chat:0,
koin:0,
trx:0,
role:'MEMBER',
join:new Date().toLocaleDateString("id-ID")
}
}

users[sender].chat += 1
writeJSON('./database/users.json', users)

const isGroup = jid.endsWith('@g.us')
const isOwner = sender.includes(config.ownerNumber)
const isAdminBot = admindb.includes(sender)
const isMaster = isOwner || isAdminBot

if(isGroup){

if(!groupdb[jid]){
groupdb[jid] = {
antilink:false,
welcome:false,
goodbye:false
}
writeJSON('./database/groups.json', groupdb)
}

let set = groupdb[jid]

if(set.antilink && text.includes('chat.whatsapp.com')){

await sock.sendMessage(jid,{ delete:m.key })

await sock.sendMessage(jid,{
text:`🚫 Link grup terdeteksi @${sender.split('@')[0]}`,
mentions:[sender]
})

return
}

}

if(!text.startsWith(config.prefix)) return

let body = text.slice(1).trim()
let args = body.split(' ')
let cmd = args.shift().toLowerCase()

if(cmd === 'menu')
require('./commands/menu')(sock,jid,config,pushname)

else if(cmd === 'owner')
require('./commands/owner')(sock,jid,config)

else if(cmd === 'profile')
require('./commands/profile')(sock,jid,sender,pushname)

else if(cmd === 'topupml')
require('./commands/topup')(sock,jid,'ml',config.ownerNumber)

else if(cmd === 'topupff')
require('./commands/topup')(sock,jid,'ff',config.ownerNumber)

else if(cmd === 'topuppubg')
require('./commands/topup')(sock,jid,'pubg',config.ownerNumber)

else if(cmd === 'topupvalorant')
require('./commands/topup')(sock,jid,'valorant',config.ownerNumber)

else if(cmd === 'pulsa')
require('./commands/topup')(sock,jid,'pulsa',config.ownerNumber)

else if(cmd === 'data')
require('./commands/topup')(sock,jid,'data',config.ownerNumber)

else if(cmd === 'voucher')
require('./commands/topup')(sock,jid,'voucher',config.ownerNumber)

else if(cmd === 'jualakun')
require('./commands/akun')(sock,jid,'jual',config.ownerNumber)

else if(cmd === 'beliakun')
require('./commands/akun')(sock,jid,'beli',config.ownerNumber)

else if(cmd === 'bt')
require('./commands/akun')(sock,jid,'bt',config.ownerNumber)

else if(cmd === 'tt')
require('./commands/akun')(sock,jid,'bt',config.ownerNumber)

else if(cmd === 'rekber')
require('./commands/akun')(sock,jid,'rekber',config.ownerNumber)

else if(cmd === 'mc')
require('./commands/akun')(sock,jid,'mc',config.ownerNumber)

else if(cmd === 'stok')
require('./commands/stok')(sock,jid,'list','')

else if(cmd === 'postakun'){
if(!isMaster) return sock.sendMessage(jid,{text:'Admin only'})
require('./commands/stok')(sock,jid,'post',args.join(' '))
}

else if(cmd === 'sold'){
if(!isMaster) return sock.sendMessage(jid,{text:'Admin only'})
require('./commands/stok')(sock,jid,'sold',args.join(' '))
}

else if(cmd === 'bc'){
if(!isMaster) return sock.sendMessage(jid,{text:'Admin only'})
require('./commands/done')(sock,jid,'bc',args.join(' '),groups)
}

else if(cmd === 'done'){
if(!isMaster) return sock.sendMessage(jid,{text:'Admin only'})

let tipe = args.shift()

if(tipe === 'akun')
require('./commands/done')(sock,jid,'akun',args.join(' '),groups)

if(tipe === 'topup')
require('./commands/done')(sock,jid,'topup',args.join(' '),groups)
}

else if(cmd === 'breakingnews'){

if(!isMaster) return sock.sendMessage(jid,{
text:'❌ Hanya admin / owner'
})

if(!isGroup) return

let isi = args.join(' ')
if(!isi) return sock.sendMessage(jid,{
text:'Contoh:\n.breakingnews Promo malam ini'
})

let meta = await sock.groupMetadata(jid)
let members = meta.participants.map(v=>v.id)

let waktu = new Date().toLocaleString('id-ID')

let teks = `
╔══════════════════════╗
🚨 BREAKING NEWS ADYVERA TV 🚨
╚══════════════════════╝

📰 Berita:
${isi}

🕒 Waktu : ${waktu}
📡 Sumber : ${config.botName}

🔥 Tetap pantau ADYVERA TV
`

await sock.sendMessage(jid,{
text:teks,
mentions:members
})

}

else if(cmd === 'hidetag'){

if(!isOwner) return sock.sendMessage(jid,{
text:'❌ Hanya owner utama'
})

if(!isGroup) return

let isi = args.join(' ')
if(!isi) return sock.sendMessage(jid,{
text:'Contoh:\n.hidetag Tes semua'
})

let meta = await sock.groupMetadata(jid)
let members = meta.participants.map(v=>v.id)

await sock.sendMessage(jid,{
text:`
╔════════════╗
📢 HIDDEN TAG
╚════════════╝

${isi}
`,
mentions:members
})

}

else if(cmd === 'antilink'){

if(!isMaster) return

if(args[0] === 'on'){
groupdb[jid].antilink = true
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'✅ Antilink aktif'})
}

if(args[0] === 'off'){
groupdb[jid].antilink = false
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'❌ Antilink mati'})
}

}

else if(cmd === 'welcome'){

if(!isMaster) return

if(args[0] === 'on'){
groupdb[jid].welcome = true
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'✅ Welcome aktif'})
}

if(args[0] === 'off'){
groupdb[jid].welcome = false
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'❌ Welcome mati'})
}

}

else if(cmd === 'goodbye'){

if(!isMaster) return

if(args[0] === 'on'){
groupdb[jid].goodbye = true
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'✅ Goodbye aktif'})
}

if(args[0] === 'off'){
groupdb[jid].goodbye = false
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'❌ Goodbye mati'})
}

}

else if(cmd === 'addadmin'){

if(!isOwner) return

let num = args[0]
if(!num) return

let id = num + '@s.whatsapp.net'

if(!admindb.includes(id)){
admindb.push(id)
writeJSON('./database/admin.json', admindb)
}

sock.sendMessage(jid,{text:'✅ Admin ditambahkan'})

}

else if(cmd === 'deladmin'){

if(!isOwner) return

let num = args[0]
if(!num) return

let id = num + '@s.whatsapp.net'

admindb = admindb.filter(v=>v!==id)
writeJSON('./database/admin.json', admindb)

sock.sendMessage(jid,{text:'✅ Admin dihapus'})

}

else if(cmd === 'listadmin'){

let teks = admindb.map((v,i)=>`${i+1}. ${v.split('@')[0]}`).join('\n')
if(!teks) teks = 'Belum ada admin'

sock.sendMessage(jid,{text:teks})

}

}catch(e){
console.log(e)
}

})

}

startBot()
