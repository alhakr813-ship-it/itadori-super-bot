const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

async function startItadoriBot() {
    // السطر ده بيخلي البوت يشتغل فوراً أول ما تحط كود الجلسة الطويل
    if (process.env.SESSION_ID && !fs.existsSync('./itadori_session/creds.json')) {
        if (!fs.existsSync('./itadori_session')) fs.mkdirSync('./itadori_session');
        const sessionData = Buffer.from(process.env.SESSION_ID.split('~')[1], 'base64').toString('utf-8');
        fs.writeFileSync('./itadori_session/creds.json', sessionData);
    }

    const { state, saveCreds } = await useMultiFileAuthState('itadori_session');
    console.log("سيرفر إيتادوري الخارجي يعمل بنجاح... ⚡");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (text === '.تسلية') {
            await sock.sendMessage(from, { text: '💥 بوت إيتادوري الأسطوري شغال من السيرفر الخارجي 24 ساعة! ⚡🔥' });
        }
    });
}

startItadoriBot();
