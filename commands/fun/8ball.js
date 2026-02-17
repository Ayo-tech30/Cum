import { random } from '../../utils/formatter.js';

const responses = [
    // Positive
    '✅ It is certain.',
    '✅ It is decidedly so.',
    '✅ Without a doubt.',
    '✅ Yes definitely.',
    '✅ You may rely on it.',
    '✅ As I see it, yes.',
    '✅ Most likely.',
    '✅ Outlook good.',
    '✅ Yes.',
    '✅ Signs point to yes.',
    
    // Neutral
    '🔮 Reply hazy, try again.',
    '🔮 Ask again later.',
    '🔮 Better not tell you now.',
    '🔮 Cannot predict now.',
    '🔮 Concentrate and ask again.',
    
    // Negative
    '❌ Don\'t count on it.',
    '❌ My reply is no.',
    '❌ My sources say no.',
    '❌ Outlook not so good.',
    '❌ Very doubtful.'
];

export default {
    name: '8ball',
    aliases: ['8b'],
    description: 'Ask the magic 8ball',
    execute: async (sock, msg, args, context) => {
        if (args.length === 0) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Ask a question!\nUsage: .8ball <question>\n\nExample: .8ball Will I be rich?'
            }, { quoted: msg });
        }

        const question = args.join(' ');
        const answer = random(responses);

        const text = `🎱 **Magic 8-Ball**

❓ ${question}

${answer}`;

        await sock.sendMessage(context.from, { text }, { quoted: msg });
    }
};
