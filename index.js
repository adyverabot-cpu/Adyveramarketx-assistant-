const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const P = require('pino')
const fs = require('fs')
const config = require('./config')

let groups = []
let reconnecting = false

function readJSON(path, def) {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify(def, null, 2))
  }
  return JSON.parse(fs.readFileSync(path))
}

function writeJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

async function startBot() {
  console.log('Memulai bot...')

  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async ({ connection, qr }) => {
    try {
      if (qr) {
        console.log('Scan QR berikut:')
        qrcode.generate(qr, { small: true })
      }

      if (connection === 'open') {
        reconnecting = false
        console.log(config.botName + ' aktif')

        try {
          let all = await sock.groupFetchAllParticipating()
          groups = Object.keys(all)
        } catch {
          groups = []
        }
      }

      if (connection === 'close') {
        if (reconnecting) return
        reconnecting = true

        console.log('Koneksi terputus, reconnect 5 detik...')
        setTimeout(() => startBot(), 5000)
      }
    } catch (e) {
      console.log('CONNECTION ERROR:', e)
    }
  })

  sock.ev.on('group-participants.update', async (anu) => {
    try {
      let db = readJSON('./database/groups.json', {})
      let set = db[anu.id] || {}

      for (let user of anu.participants) {
        if (anu.action === 'add' && set.welcome) {
          await sock.sendMessage(anu.id, {
            text: `👋 Selamat datang @${user.split('@')[0]} di ${config.botName}`,
            mentions: [user]
          })
        }

        if (anu.action === 'remove' && set.goodbye) {
          await sock.sendMessage(anu.id, {
            text: `👋 Selamat tinggal @${user.split('@')[0]}`,
            mentions: [user]
          })
        }
      }
    } catch (e) {
      console.log('GROUP UPDATE ERROR:', e)
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const m = messages[0]
      if (!m.message) return

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

      if (!users[sender]) {
        users[sender] = {
          chat: 0,
          koin: 0,
          trx: 0,
          role: 'MEMBER',
          join: new Date().toLocaleDateString('id-ID')
        }
      }

      users[sender].chat += 1

      if (vvipdb[sender]) users[sender].role = 'VVIP'
      else if (vipdb[sender]) users[sender].role = 'VIP'
      else if (admindb.includes(sender)) users[sender].role = 'ADMIN'
      else users[sender].role = 'MEMBER'

      writeJSON('./database/users.json', users)

      const isGroup = jid.endsWith('@g.us')
      const ownerMain = config.ownerNumber + '@s.whatsapp.net'
      const isOwner = sender === ownerMain || ownerdb.includes(sender)
      const isAdminBot = admindb.includes(sender)
      const isMaster = isOwner || isAdminBot

      if (isGroup) {
        if (!groupdb[jid]) {
          groupdb[jid] = {
            antilink: false,
            welcome: false,
            goodbye: false
          }
          writeJSON('./database/groups.json', groupdb)
        }

        let set = groupdb[jid]

        if (set.antilink && text.includes('chat.whatsapp.com')) {
          try {
            await sock.sendMessage(jid, { delete: m.key })
          } catch {}

          await sock.sendMessage(jid, {
            text: `🚫 Link grup terdeteksi @${sender.split('@')[0]}`,
            mentions: [sender]
          })

          return
        }
      }

      if (!text.startsWith(config.prefix)) return

      let body = text.slice(1).trim()
      let args = body.split(' ')
      let cmd = args.shift().toLowerCase()

      if (cmd === 'menu')
        require('./commands/menu')(sock, jid, config, pushname)

      else if (cmd === 'owner')
        require('./commands/owner')(sock, jid, config)

      else if (cmd === 'profile')
        require('./commands/profile')(sock, jid, sender, pushname)

      else if (cmd === 'leaderboard')
        require('./commands/leaderboard')(sock, jid)

      else if (cmd === 'topchat')
        require('./commands/topchat')(sock, jid)

      else if (cmd === 'topkoin')
        require('./commands/topkoin')(sock, jid)

      else if (cmd === 'toptrx')
        require('./commands/toptrx')(sock, jid)

      else {
        sock.sendMessage(jid, {
          text: '❌ Command tidak ditemukan, ketik .menu'
        })
      }

    } catch (e) {
      console.log('MESSAGE ERROR:', e)
    }
  })
}

startBot().catch(err => {
  console.log('START ERROR:', err)
})
