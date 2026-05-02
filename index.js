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

sock.ev.on('messages.upsert', async ({ messages }) => {

try {

const m = messages[0]
if(!m.message) return

const jid = m.key.remoteJid
const sender = m.key.participant || jid
const pushname = m.pushName || "User"

const text =
m.message.conversation ||
m.message.extendedTextMessage?.text ||
''

let users = readJSON('./database/users.json', {})
let vipdb = readJSON('./database/vip.json', {})
let groupdb = readJSON('./database/groups.json', {})

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
const isOwner =
sender.includes(config.ownerNumber)

const isVIP = vipdb[sender]?.type === 'VIP'
const isVVIP = vipdb[sender]?.type === 'VVIP'

if(isGroup){

if(!groupdb[jid]){
groupdb[jid] = { antilink:false }
writeJSON('./database/groups.json', groupdb)
}

if(groupdb[jid].antilink){

if(text.includes('chat.whatsapp.com')){

await sock.sendMessage(jid,{
delete:m.key
})

await sock.sendMessage(jid,{
text:`🚫 Link grup terdeteksi @${sender.split('@')[0]}`,
mentions:[sender]
})

}

}

}

if(!text.startsWith(config.prefix)) return

let body = text.slice(1).trim()
let args = body.split(" ")
let cmd = args.shift().toLowerCase()

if(cmd === 'menu')
require('./commands/menu')(sock,jid,config,pushname)

else if(cmd === 'owner')
require('./commands/owner')(sock,jid,config)

else if(cmd === 'profile')
require('./commands/profile')(sock,jid,sender,pushname)

else if(cmd === 'top50'){
let rank = Object.entries(users)
.sort((a,b)=>b[1].koin-a[1].koin)
.slice(0,50)
.map((v,i)=>`${i+1}. ${v[0].split('@')[0]} - ${v[1].koin}`)
.join('\n')

sock.sendMessage(jid,{text:'🏆 TOP 50 USER\n\n'+rank})
}

else if(cmd === 'vip'){
vipdb[sender] = { type:'VIP' }
writeJSON('./database/vip.json', vipdb)
sock.sendMessage(jid,{text:'💎 VIP aktif'})
}

else if(cmd === 'vvip'){
vipdb[sender] = { type:'VVIP' }
writeJSON('./database/vip.json', vipdb)
sock.sendMessage(jid,{text:'👑 VVIP aktif'})
}

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
if(!isOwner) return sock.sendMessage(jid,{text:'Owner only'})
require('./commands/stok')(sock,jid,'post',args.join(' '))
}

else if(cmd === 'sold'){
if(!isOwner) return sock.sendMessage(jid,{text:'Owner only'})
require('./commands/stok')(sock,jid,'sold',args.join(' '))
}

else if(cmd === 'bc'){
if(!isOwner) return sock.sendMessage(jid,{text:'Owner only'})
require('./commands/done')(sock,jid,'bc',args.join(' '),groups)
}

else if(cmd === 'done'){
if(!isOwner) return sock.sendMessage(jid,{text:'Owner only'})
let tipe = args.shift()

if(tipe === 'akun')
require('./commands/done')(sock,jid,'akun',args.join(' '),groups)

if(tipe === 'topup')
require('./commands/done')(sock,jid,'topup',args.join(' '),groups)
}

else if(cmd === 'antilink'){
if(!isGroup) return
if(!isOwner) return

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

} catch(e){
console.log(e)
}

})

}

startBot()
