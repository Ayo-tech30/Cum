import { db } from '../../index.js';
import { formatNumber } from '../../utils/formatter.js';

export default {
    name: 'rob',
    description: 'Try to rob someone',
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (!mentioned || mentioned.length === 0) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please mention someone to rob!\nUsage: .rob @user'
            }, { quoted: msg });
        }

        const targetId = mentioned[0].split('@')[0];
        
        if (targetId === context.userId) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ You can\'t rob yourself! 🤦'
            }, { quoted: msg });
        }

        const now = Date.now();
        const lastRob = context.userData.lastRob || 0;
        const cooldown = 7200000; // 2 hours

        if (now - lastRob < cooldown) {
            const remaining = Math.floor((cooldown - (now - lastRob)) / 60000);
            return await sock.sendMessage(context.from, {
                text: `⏰ You need to wait ${remaining} minutes before robbing again!`
            }, { quoted: msg });
        }

        // Get target data
        const targetData = (await db.ref(`users/${targetId}`).once('value')).val();
        
        if (!targetData || (targetData.balance || 0) < 1000) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Target is too poor to rob! They need at least 1,000 coins in wallet.'
            }, { quoted: msg });
        }

        // 50% success rate
        const success = Math.random() > 0.5;
        
        if (success) {
            // Rob 10-30% of their wallet
            const percentage = Math.random() * 0.2 + 0.1; // 10-30%
            const stolen = Math.floor(targetData.balance * percentage);
            
            await db.ref(`users/${context.userId}/balance`).set((context.userData.balance || 0) + stolen);
            await db.ref(`users/${targetId}/balance`).set(targetData.balance - stolen);
            await db.ref(`users/${context.userId}/lastRob`).set(now);
            
            await sock.sendMessage(context.from, {
                text: `🎉 **ROB SUCCESSFUL!**\n\n💰 You stole ${formatNumber(stolen)} coins from @${targetId}!\n\n💵 Your balance: ${formatNumber((context.userData.balance || 0) + stolen)} coins`,
                mentions: mentioned
            }, { quoted: msg });
        } else {
            // Failed - lose money as fine
            const fine = Math.floor(Math.random() * 500) + 500; // 500-1000 coins
            const actualFine = Math.min(fine, context.userData.balance || 0);
            
            await db.ref(`users/${context.userId}/balance`).set((context.userData.balance || 0) - actualFine);
            await db.ref(`users/${context.userId}/lastRob`).set(now);
            
            await sock.sendMessage(context.from, {
                text: `❌ **ROB FAILED!**\n\n🚔 You got caught!\n💸 Fine: ${formatNumber(actualFine)} coins\n\n💵 Your balance: ${formatNumber((context.userData.balance || 0) - actualFine)} coins`
            }, { quoted: msg });
        }
    }
};
