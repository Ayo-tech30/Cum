import { db } from '../../index.js';
import { formatNumber, random } from '../../utils/formatter.js';

const jobs = [
    { name: 'Programmer', pay: [800, 2000], emoji: '💻' },
    { name: 'Doctor', pay: [1000, 2500], emoji: '👨‍⚕️' },
    { name: 'Teacher', pay: [500, 1200], emoji: '👨‍🏫' },
    { name: 'Chef', pay: [600, 1500], emoji: '👨‍🍳' },
    { name: 'Artist', pay: [400, 1800], emoji: '🎨' },
    { name: 'Musician', pay: [700, 2200], emoji: '🎵' },
    { name: 'Gamer', pay: [300, 1000], emoji: '🎮' },
    { name: 'YouTuber', pay: [500, 3000], emoji: '📹' },
    { name: 'Trader', pay: [100, 5000], emoji: '📈' },
    { name: 'Farmer', pay: [400, 1000], emoji: '🌾' }
];

export default {
    name: 'work',
    description: 'Work to earn money',
    execute: async (sock, msg, args, context) => {
        const now = Date.now();
        const lastWork = context.userData.lastWork || 0;
        const cooldown = 3600000; // 1 hour

        if (now - lastWork < cooldown) {
            const remaining = cooldown - (now - lastWork);
            const minutes = Math.floor(remaining / 60000);
            
            return await sock.sendMessage(context.from, {
                text: `⏰ You're tired! Rest for ${minutes} more minutes before working again.`
            }, { quoted: msg });
        }

        const job = random(jobs);
        const earnings = Math.floor(Math.random() * (job.pay[1] - job.pay[0])) + job.pay[0];

        await db.ref(`users/${context.userId}/balance`).set((context.userData.balance || 0) + earnings);
        await db.ref(`users/${context.userId}/lastWork`).set(now);

        const text = `${job.emoji} **Work Report**

You worked as a ${job.name}!
💰 Earned: ${formatNumber(earnings)} coins

💵 New balance: ${formatNumber((context.userData.balance || 0) + earnings)} coins

Come back in 1 hour to work again! ⏰`;

        await sock.sendMessage(context.from, { text }, { quoted: msg });
    }
};
