const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const P = require('pino')
const fs = require('fs')
const config = require('./config')

let groups = []
let reconnecting = false

function readJSON(path, def){
if(!fs.existsSync(path)){
fs.writeFileSync(path, JSON.stringify(def,null,2))
}
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

reconnecting = false
console.log(config.botName + ' aktif')

try{
let all = await sock.groupFetchAllParticipating()
groups = Object.keys(all)
}catch(e){
groups = []
}

}

if(connection === 'close'){

if(reconnecting) return
reconnecting = true

setTimeout(() => {
startBot()
}, 5000)

}

})

sock.ev.on('group-participants.update', async (anu) => {

try{

let db = readJSON('./database/groups.json', {})
let set = db[anu.id] || {}

for(let user of anu.participants){

if(anu.action === 'add' && set.welcome){

await sock.sendMessage(anu.id,{
text:`👋 Selamat datang @${user.split('@')[0]} di ${config.botName}`,
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
let groupdb = readJSON('./database/groups.json', {})
let admindb = readJSON('./database/admin.json', [])
let vipdb = readJSON('./database/vip.json', {})
let vvipdb = readJSON('./database/vvip.json', {})
let ownerdb = readJSON('./database/owner.json', [])

if(!users[sender]){
users[sender] = {
chat:0,
koin:0,
trx:0,
role:'MEMBER',
join:new Date().toLocaleDateString('id-ID')
}
}

users[sender].chat += 1

if(vvipdb[sender]) users[sender].role = 'VVIP'
else if(vipdb[sender]) users[sender].role = 'VIP'
else if(admindb.includes(sender)) users[sender].role = 'ADMIN'
else users[sender].role = 'MEMBER'

writeJSON('./database/users.json', users)

const isGroup = jid.endsWith('@g.us')
const ownerMain = config.ownerNumber + '@s.whatsapp.net'
const isOwner = sender === ownerMain || ownerdb.includes(sender)
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

try{
await sock.sendMessage(jid,{ delete:m.key })
}catch(e){}

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
require('./commands/akun')(sock,jid,'tt',config.ownerNumber)

else if(cmd === 'rekber')
require('./commands/akun')(sock,jid,'rekber',config.ownerNumber)

else if(cmd === 'mc')
require('./commands/akun')(sock,jid,'mc',config.ownerNumber)

else if(cmd === 'stok')
require('./commands/stok')(sock,jid,'list','')

else if(cmd === 'postakun'){
if(!isMaster) return sock.sendMessage(jid,{text:'❌ Admin only'})
require('./commands/stok')(sock,jid,'post',args.join(' '))
}

else if(cmd === 'sold'){
if(!isMaster) return sock.sendMessage(jid,{text:'❌ Admin only'})
require('./commands/stok')(sock,jid,'sold',args.join(' '))
}

else if(cmd === 'bc'){
if(!isMaster) return sock.sendMessage(jid,{text:'❌ Admin only'})
require('./commands/done')(sock,jid,'bc',args.join(' '),groups)
}

else if(cmd === 'done'){
if(!isMaster) return sock.sendMessage(jid,{text:'❌ Admin only'})

let tipe = args.shift()

if(tipe === 'akun'){
require('./commands/done')(sock,jid,'akun',args.join(' '),groups)
}

else if(tipe === 'topup'){
require('./commands/done')(sock,jid,'topup',args.join(' '),groups)
}

else{
sock.sendMessage(jid,{text:'Contoh:\n.done akun\n.done topup'})
}
}

else if(cmd === 'breakingnews'){

if(!isMaster) return sock.sendMessage(jid,{text:'❌ Hanya admin / owner'})
if(!isGroup) return

let isi = args.join(' ')
if(!isi) return sock.sendMessage(jid,{text:'Contoh:\n.breakingnews Promo malam ini'})

let meta = await sock.groupMetadata(jid)
let members = meta.participants.map(v=>v.id)

await sock.sendMessage(jid,{
text:`🚨 BREAKING NEWS ADYVERA TV 🚨

${isi}

🕒 ${new Date().toLocaleString('id-ID')}`,
mentions:members
})

}

else if(cmd === 'hidetag'){

if(!isOwner) return sock.sendMessage(jid,{text:'❌ Hanya owner'})
if(!isGroup) return

let isi = args.join(' ')
if(!isi) return sock.sendMessage(jid,{text:'Contoh:\n.hidetag Halo semua'})

let meta = await sock.groupMetadata(jid)
let members = meta.participants.map(v=>v.id)

await sock.sendMessage(jid,{
text:isi,
mentions:members
})

}

else if(cmd === 'antilink'){

if(!isMaster || !isGroup) return

if(args[0] === 'on'){
groupdb[jid].antilink = true
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'✅ Antilink aktif'})
}

else if(args[0] === 'off'){
groupdb[jid].antilink = false
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'❌ Antilink mati'})
}

}

else if(cmd === 'welcome'){

if(!isMaster || !isGroup) return

if(args[0] === 'on'){
groupdb[jid].welcome = true
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'✅ Welcome aktif'})
}

else if(args[0] === 'off'){
groupdb[jid].welcome = false
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'❌ Welcome mati'})
}

}

else if(cmd === 'goodbye'){

if(!isMaster || !isGroup) return

if(args[0] === 'on'){
groupdb[jid].goodbye = true
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'✅ Goodbye aktif'})
}

else if(args[0] === 'off'){
groupdb[jid].goodbye = false
writeJSON('./database/groups.json', groupdb)
sock.sendMessage(jid,{text:'❌ Goodbye mati'})
}

}

else if(cmd === 'addadmin'){

if(!isOwner) return

let num = args[0]
if(!num) return sock.sendMessage(jid,{text:'Contoh:\n.addadmin 62812xxxx'})

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

else if(cmd === 'addowner'){

if(sender !== ownerMain) return sock.sendMessage(jid,{text:'❌ Hanya owner utama'})

let num = args[0]
if(!num) return sock.sendMessage(jid,{text:'Contoh:\n.addowner 62812xxxx'})

let id = num + '@s.whatsapp.net'

if(!ownerdb.includes(id)){
ownerdb.push(id)
writeJSON('./database/owner.json', ownerdb)
}

sock.sendMessage(jid,{text:'✅ Owner ditambahkan'})

}

else if(cmd === 'delowner'){

if(sender !== ownerMain) return sock.sendMessage(jid,{text:'❌ Hanya owner utama'})

let num = args[0]
if(!num) return

let id = num + '@s.whatsapp.net'

ownerdb = ownerdb.filter(v=>v!==id)
writeJSON('./database/owner.json', ownerdb)

sock.sendMessage(jid,{text:'✅ Owner dihapus'})

}

else if(cmd === 'listowner'){

let list = [ownerMain, ...ownerdb]
let teks = list.map((v,i)=>`${i+1}. ${v.split('@')[0]}`).join('\n')

sock.sendMessage(jid,{text:teks})

}
  else if(cmd === 'leaderboard')
require('./commands/leaderboard')(sock,jid)

else if(cmd === 'topchat')
require('./commands/topchat')(sock,jid)

else if(cmd === 'topkoin')
require('./commands/topkoin')(sock,jid)

else if(cmd === 'toptrx'){
   require('./commands/toptrx')(sock,jid)
  }
        
else{
sock.sendMessage(jid,{text:'❌ Command tidak ditemukan, ketik .menu'})
}

}catch(e){
console.log(e)
}

})

}

startBot()
