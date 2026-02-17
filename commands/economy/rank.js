import { db } from '../../index.js';
import { formatNumber } from '../../utils/formatter.js';

export default {
    name: 'rank',
    description: 'Check your rank on the leaderboard',
    execute: async (sock, msg, args, context) => {
        const usersSnapshot = await db.ref('users').once('value');
        const users = usersSnapshot.val() || {};
        
        const userList = Object.entries(users).map(([id, data]) => ({
            id,
            name: data.name || 'Unknown',
            balance: (data.balance || 0) + (data.bank || 0)
        }));

        userList.sort((a, b) => b.balance - a.balance);
        
        const userRank = userList.findIndex(u => u.id === context.userId) + 1;
        const userData = userList.find(u => u.id === context.userId);

        if (!userData || userRank === 0) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ You are not ranked yet! Use .reg to register and start earning!'
            }, { quoted: msg });
        }

        const medal = userRank === 1 ? '🥇' : userRank === 2 ? '🥈' : userRank === 3 ? '🥉' : `#${userRank}`;
        
        // Get users above and below
        const above = userRank > 1 ? userList[userRank - 2] : null;
        const below = userRank < userList.length ? userList[userRank] : null;

        const text = `🏆 **Your Rank**

${medal} **${userData.name}**
💰 Total Worth: ${formatNumber(userData.balance)} coins
📊 Rank: ${userRank} / ${userList.length}

${above ? `⬆️ ${above.name}: ${formatNumber(above.balance)} coins` : '⬆️ Top of leaderboard!'}
${below ? `⬇️ ${below.name}: ${formatNumber(below.balance)} coins` : '⬇️ Bottom of leaderboard!'}

Keep grinding! 💪`;

        await sock.sendMessage(context.from, { text }, { quoted: msg });
    }
};
