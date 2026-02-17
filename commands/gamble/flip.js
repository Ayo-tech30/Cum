import { db } from '../../index.js';
import { formatNumber, sleep } from '../../utils/formatter.js';

export default {
    name: 'flip',
    description: 'Flip a coin with animation',
    execute: async (sock, msg, args, context) => {
        const bet = parseInt(args[0]);
        const choice = args[1]?.toLowerCase();

        if (!bet || isNaN(bet) || bet <= 0) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Specify bet and choice!\nUsage: .flip <amount> <heads/tails>'
            }, { quoted: msg });
        }

        if (!choice || (choice !== 'heads' && choice !== 'tails' && choice !== 'h' && choice !== 't')) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Choose heads (h) or tails (t)!\nUsage: .flip <amount> <heads/tails>'
            }, { quoted: msg });
        }

        if (bet > (context.userData.balance || 0)) {
            return await sock.sendMessage(context.from, {
                text: `⚠️ Insufficient funds!\n💰 Balance: ${formatNumber(context.userData.balance || 0)}`
            }, { quoted: msg });
        }

        const userChoice = choice === 'h' ? 'heads' : choice === 't' ? 'tails' : choice;
        
        // Animation
        const flipping = await sock.sendMessage(context.from, {
            text: '🪙 Flipping...'
        }, { quoted: msg });

        await sleep(500);
        await sock.sendMessage(context.from, {
            text: '🪙 Spinning...',
            edit: flipping.key
        });

        await sleep(500);
        await sock.sendMessage(context.from, {
            text: '🪙 Landing...',
            edit: flipping.key
        });

        await sleep(500);

        const result = Math.random() > 0.5 ? 'heads' : 'tails';
        const win = result === userChoice;
        const emoji = result === 'heads' ? '🗣️' : '🔰';

        if (win) {
            await db.ref(`users/${context.userId}/balance`).set((context.userData.balance || 0) + bet);
            await sock.sendMessage(context.from, {
                text: `${emoji} **${result.toUpperCase()}!**\n\n🎉 YOU WIN!\n💰 +${formatNumber(bet)} coins\n\n💵 Balance: ${formatNumber((context.userData.balance || 0) + bet)}`,
                edit: flipping.key
            });
        } else {
            await db.ref(`users/${context.userId}/balance`).set((context.userData.balance || 0) - bet);
            await sock.sendMessage(context.from, {
                text: `${emoji} **${result.toUpperCase()}!**\n\n😢 YOU LOSE!\n💸 -${formatNumber(bet)} coins\n\n💵 Balance: ${formatNumber((context.userData.balance || 0) - bet)}`,
                edit: flipping.key
            });
        }
    }
};
