import { db } from '../../index.js';
import { generateRandomCard } from '../../utils/cardSystem.js';

export default {
    name: 'spawncard',
    description: 'Manually spawn a card in a group',
    ownerOnly: true,
    execute: async (sock, msg, args, context) => {
        if (!args[0]) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a group invite link or use the command in a group!\nUsage: .spawncard <group_link>\nOr use .spawncard in a group chat'
            }, { quoted: msg });
        }

        let targetGroupId;

        // Check if command is used in a group
        if (context.from.endsWith('@g.us')) {
            targetGroupId = context.from;
        } else {
            // Extract group ID from invite link
            const url = args[0];
            try {
                const code = url.split('/').pop();
                const groupInfo = await sock.groupGetInviteInfo(code);
                targetGroupId = groupInfo.id;
            } catch (error) {
                return await sock.sendMessage(context.from, {
                    text: '❌ Invalid group link or unable to access group!'
                }, { quoted: msg });
            }
        }

        // Generate card
        const card = generateRandomCard();

        // Store spawn
        await db.ref(`cardSpawns/${targetGroupId}`).set({
            card: card,
            timestamp: Date.now()
        });

        const rarityEmoji = {
            common: '⬜',
            rare: '🟦',
            epic: '🟪',
            legendary: '🟨'
        };

        const text = `🎴 A wild card appeared!

${rarityEmoji[card.tier]} **${card.name}**
📚 Series: ${card.series}
⭐ Rarity: ${card.rarity}
💎 Value: ${card.value} coins

Use .claim to catch it!`;

        try {
            await sock.sendMessage(targetGroupId, { text });
            
            // Confirm to owner
            if (!context.from.endsWith('@g.us')) {
                await sock.sendMessage(context.from, {
                    text: `✅ Card spawned successfully in the target group!\n\n${rarityEmoji[card.tier]} ${card.name} (${card.rarity})`
                }, { quoted: msg });
            }
        } catch (error) {
            await sock.sendMessage(context.from, {
                text: `❌ Failed to spawn card: ${error.message}`
            }, { quoted: msg });
        }
    }
};
