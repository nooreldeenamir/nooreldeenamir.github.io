import { parseFeedback } from './feedback.mjs';
const question = { questionId: 'demo-q1', maximum: 5 };
const accepted = parseFeedback(JSON.stringify({
  questionId: 'demo-q1', awarded: 3, feedback: 'Synthetic feedback for a demonstration.',
}), question);
console.log(accepted);
try {
  parseFeedback(JSON.stringify({ questionId: 'demo-q1', awarded: 11, feedback: 'Looks fine.' }), question);
} catch (error) { console.log(error.message); }
console.log('Synthetic proposals only. Accepted structure still requires human review.');
