import { db } from '../../index.js';
import axios from 'axios';

const activeTrivia = new Map();

export default {
    name: 'trivia',
    description: 'Play trivia quiz and win coins',
    execute: async (sock, msg, args, context) => {
        if (activeTrivia.has(context.from)) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ There\'s already an active trivia in this chat! Answer it first.'
            }, { quoted: msg });
        }

        try {
            // Get trivia question from API
            const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
            const question = response.data.results[0];
            
            // Decode HTML entities
            const decodeHTML = (html) => {
                return html.replace(/&quot;/g, '"')
                          .replace(/&#039;/g, "'")
                          .replace(/&amp;/g, '&')
                          .replace(/&lt;/g, '<')
                          .replace(/&gt;/g, '>');
            };
            
            const questionText = decodeHTML(question.question);
            const correctAnswer = decodeHTML(question.correct_answer);
            const incorrectAnswers = question.incorrect_answers.map(a => decodeHTML(a));
            
            // Shuffle answers
            const allAnswers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
            
            // Store trivia
            activeTrivia.set(context.from, {
                correctAnswer: correctAnswer.toLowerCase(),
                reward: Math.floor(Math.random() * 500) + 300, // 300-800 coins
                startTime: Date.now()
            });
            
            const text = `🎯 **TRIVIA TIME!**

❓ ${questionText}

**Options:**
1️⃣ ${allAnswers[0]}
2️⃣ ${allAnswers[1]}
3️⃣ ${allAnswers[2]}
4️⃣ ${allAnswers[3]}

Reply with the number (1-4) to answer!
⏰ You have 30 seconds!`;

            await sock.sendMessage(context.from, { text }, { quoted: msg });
            
            // Remove trivia after 30 seconds
            setTimeout(() => {
                if (activeTrivia.has(context.from)) {
                    activeTrivia.delete(context.from);
                    sock.sendMessage(context.from, {
                        text: '⏰ Time\'s up! The correct answer was: ' + correctAnswer
                    });
                }
            }, 30000);
            
        } catch (error) {
            console.error('Trivia error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to fetch trivia question. Try again!'
            }, { quoted: msg });
        }
    }
};

// Export handler for answering
export const handleTriviaAnswer = async (sock, msg, answer, context) => {
    const trivia = activeTrivia.get(context.from);
    if (!trivia) return false;
    
    const userAnswer = answer.trim().toLowerCase();
    const isCorrect = userAnswer === trivia.correctAnswer || 
                      ['1', '2', '3', '4', 'a', 'b', 'c', 'd'].includes(userAnswer);
    
    if (isCorrect) {
        await db.ref(`users/${context.userId}/balance`).set((context.userData.balance || 0) + trivia.reward);
        await sock.sendMessage(context.from, {
            text: `🎉 **CORRECT!**\n\n💰 You won ${trivia.reward} coins!\n\n✅ Answer: ${trivia.correctAnswer}`
        }, { quoted: msg });
        
        activeTrivia.delete(context.from);
        return true;
    }
    
    return false;
};
