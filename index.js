const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const config = require('./config');

async function startBot(){
 const { state, saveCreds } = await useMultiFileAuthState('./session');
 const sock = makeWASocket({ auth: state, logger: P({ level:'silent' }) });

 sock.ev.on('creds.update', saveCreds);

 sock.ev.on('connection.update', ({ connection, qr, lastDisconnect }) => {
   if(qr) qrcode.generate(qr, { small:true });
   if(connection === 'open') console.log(`${config.botName} aktif`);
   if(connection === 'close') {
     const shouldReconnect = true;
     if(shouldReconnect) startBot();
   }
 });

 sock.ev.on('messages.upsert', async ({ messages }) => {
   const m = messages[0];
   if(!m.message) return;
   const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
   if(!text.startsWith(config.prefix)) return;
   const cmd = text.slice(1).trim().toLowerCase();
   const jid = m.key.remoteJid;

   if(cmd === 'menu') {
     await sock.sendMessage(jid, { text: `${config.botName}\n.menu\n.profile\n.owner\n.topupml\n.stok` });
   }
   if(cmd === 'owner') {
     await sock.sendMessage(jid, { text: `Owner: ${config.ownerName}\nwa.me/${config.ownerNumber}` });
   }
 });
}
startBot();
else if(cmd === 'topupml')
require('./commands/topup')(sock, jid, 'ml', config.ownerNumber)

else if(cmd === 'topupff')
require('./commands/topup')(sock, jid, 'ff', config.ownerNumber)

else if(cmd === 'topuppubg')
require('./commands/topup')(sock, jid, 'pubg', config.ownerNumber)

else if(cmd === 'topupvalorant')
require('./commands/topup')(sock, jid, 'valorant', config.ownerNumber)

else if(cmd === 'pulsa')
require('./commands/topup')(sock, jid, 'pulsa', config.ownerNumber)

else if(cmd === 'data')
require('./commands/topup')(sock, jid, 'data', config.ownerNumber)

else if(cmd === 'voucher')
require('./commands/topup')(sock, jid, 'voucher', config.ownerNumber)
else if(cmd === 'jualakun')
require('./commands/akun')(sock, jid, 'jual', config.ownerNumber)

else if(cmd === 'beliakun')
require('./commands/akun')(sock, jid, 'beli', config.ownerNumber)

else if(cmd === 'bt')
require('./commands/akun')(sock, jid, 'bt', config.ownerNumber)

else if(cmd === 'tt')
require('./commands/akun')(sock, jid, 'bt', config.ownerNumber)

else if(cmd === 'stok')
require('./commands/akun')(sock, jid, 'stok', config.ownerNumber)

else if(cmd === 'rekber')
require('./commands/akun')(sock, jid, 'rekber', config.ownerNumber)

else if(cmd === 'mc')
require('./commands/akun')(sock, jid, 'mc', config.ownerNumber)
