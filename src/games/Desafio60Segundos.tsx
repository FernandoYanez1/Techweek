import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { Timer, CheckCircle2, XCircle } from 'lucide-react';

interface Question {
  text: string;
  subText?: string;
  options: (number | string)[];
  answer: number | string;
  type: 'math' | 'sequence' | 'logic';
}

export default function Desafio60Segundos() {
  const { endGame, activeDifficulty } = useAppStore();
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  // ===============================================
  // MOTORES DE GERAÇÃO DE PERGUNTAS
  // ===============================================

  const generateMathQuestion = (): Question => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;
    let answer = 0;

    if (op === '+') answer = a + b;
    if (op === '-') {
      if (b > a) [a, b] = [b, a]; 
      answer = a - b;
    }
    if (op === '*') {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
    }

    const fakeOptions = new Set<number>();
    while (fakeOptions.size < 3) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const fake = answer + offset;
      if (fake !== answer && fake >= 0) fakeOptions.add(fake);
    }

    const options = [answer, ...Array.from(fakeOptions)].sort(() => Math.random() - 0.5);
    return { text: `${a} ${op} ${b} = ?`, type: 'math', options, answer };
  };

  const generateSequenceQuestion = (): Question => {
    const types = ['PA', 'PG', 'FIBO'];
    const type = types[Math.floor(Math.random() * types.length)];
    let seq: number[] = [];
    let answer = 0;

    if (type === 'PA') {
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * 5) + 2;
      seq = [start, start + step, start + step * 2, start + step * 3];
      answer = start + step * 4;
    } else if (type === 'PG') {
      const start = Math.floor(Math.random() * 3) + 1;
      const step = Math.floor(Math.random() * 2) + 2;
      seq = [start, start * step, start * Math.pow(step, 2), start * Math.pow(step, 3)];
      answer = start * Math.pow(step, 4);
    } else if (type === 'FIBO') {
      const startIdx = Math.floor(Math.random() * 4) + 2; // Pula os primeiros 1, 1
      const fiboAll = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
      seq = fiboAll.slice(startIdx, startIdx + 4);
      answer = fiboAll[startIdx + 4];
    }

    const fakeOptions = new Set<number>();
    while (fakeOptions.size < 3) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const fake = answer + offset;
      if (fake !== answer && fake >= 0) fakeOptions.add(fake);
    }

    const options = [answer, ...Array.from(fakeOptions)].sort(() => Math.random() - 0.5);
    return { 
      text: "Qual o próximo?", 
      subText: `${seq.join(' → ')} → ?`,
      type: 'sequence', 
      options, 
      answer 
    };
  };

  const generateLogicQuestion = (): Question => {
    const logicDB = [
      { q: "Se ontem foi terça, que dia é depois de amanhã?", a: "Sexta", fakes: ["Quinta", "Sábado", "Domingo"] },
      { q: "Quantos meses têm 28 dias?", a: "12", fakes: ["1", "6", "Nenhum"] },
      { q: "O pai de Maria tem 5 filhas: Lalá, Lelé, Lili, Loló e...", a: "Maria", fakes: ["Lulú", "Leila", "Lucia"] },
      { q: "O que é que tem coroa, mas não é rei?", a: "Abacaxi", fakes: ["Moeda", "Príncipe", "Rainha"] },
      { q: "Divide 30 por meia e soma 10. Qual o resultado?", a: "70", fakes: ["25", "40", "15"] }
    ];

    const q = logicDB[Math.floor(Math.random() * logicDB.length)];
    const options = [q.a, ...q.fakes].sort(() => Math.random() - 0.5);

    return {
      text: "Lógica",
      subText: q.q,
      type: 'logic',
      options,
      answer: q.a
    };
  };

  const generateQuestion = useCallback((): Question => {
    const roll = Math.random();
    if (roll < 0.4) return generateMathQuestion();      // 40% de chance (Mais rápido)
    if (roll < 0.8) return generateSequenceQuestion();  // 40% de chance
    return generateLogicQuestion();                     // 20% de chance (Demora mais pra ler)
  }, []);

  // ===============================================
  // CICLO DE VIDA DO JOGO
  // ===============================================

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setCurrentQuestion(generateQuestion());
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      
      // Consideramos que fazer 250 pontos brutos é um desempenho de 100%.
      const maxPts = MAX_SCORES['desafio-60-segundos'][activeDifficulty || 'AVANCADO'] || 500;
      const pontosFinais = Math.min(maxPts, Math.max(0, Math.round((score / 250) * maxPts)));
      
      endGame([pontosFinais]);
    }
  }, [timeLeft, isPlaying, score, activeDifficulty, endGame]);

  const handleAnswer = (choice: number | string) => {
    if (feedback !== 'none' || timeLeft === 0) return;

    if (choice === currentQuestion?.answer) {
      setScore(s => s + 10);
      setFeedback('correct');
    } else {
      setScore(s => Math.max(0, s - 5)); 
      setFeedback('wrong');
    }

    setTimeout(() => {
      setCurrentQuestion(generateQuestion());
      setFeedback('none');
    }, 400);
  };

  // ===============================================
  // RENDERIZAÇÃO DE UI
  // ===============================================

  if (!isPlaying) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-800 rounded-[3rem] shadow-2xl text-center max-w-3xl w-full border-4 border-slate-700 animate-in zoom-in">
        <Timer size={100} className="text-emerald-400 mb-6" />
        <h2 className="text-5xl font-black text-white mb-4">60 Segundos!</h2>
        <p className="text-2xl text-slate-400 mb-8 leading-relaxed">
          Responda o máximo de desafios lógicos, sequências numéricas e matemática antes do tempo acabar. <br/><br/>
          <strong className="text-emerald-400">+10 pts</strong> por acerto.<br/>
          <strong className="text-red-400">-5 pts</strong> por erro.
        </p>
        <button 
          onClick={startGame} 
          className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-3xl font-bold active:scale-95 transition-all shadow-lg"
        >
          Iniciar Relógio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl select-none">
      <div className="w-full flex justify-between items-center mb-10 bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-700">
        <div className="text-4xl font-bold text-cyan-400">Pontos: {score}</div>
        
        <div className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-5xl transition-colors duration-300 
          ${timeLeft <= 10 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-900 text-white'}`}
        >
          <Timer size={44} /> 00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="text-center mb-12 relative w-full min-h-[16rem] flex flex-col items-center justify-center bg-slate-900 rounded-3xl border-2 border-slate-800 shadow-inner p-8">
        
        {/* TEXTO PRINCIPAL DA PERGUNTA */}
        <h2 className={`text-white font-black tracking-tighter drop-shadow-lg leading-tight transition-all
          ${currentQuestion?.type === 'logic' ? 'text-4xl text-amber-400 mb-4' : 'text-6xl text-slate-300 mb-2'}
        `}>
          {currentQuestion?.text}
        </h2>

        {/* TEXTO SECUNDÁRIO (SE HOUVER) */}
        {currentQuestion?.subText && (
          <h3 className={`text-white font-bold drop-shadow-md leading-snug
            ${currentQuestion?.type === 'logic' ? 'text-3xl' : 'text-5xl tracking-widest text-cyan-400'}
          `}>
            {currentQuestion.subText}
          </h3>
        )}
        
        {/* OVERLAYS DE ACERTO/ERRO */}
        {feedback === 'correct' && <CheckCircle2 size={150} className="absolute text-emerald-400 opacity-90 animate-in zoom-in" />}
        {feedback === 'wrong' && <XCircle size={150} className="absolute text-red-500 opacity-90 animate-in zoom-in" />}
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        {currentQuestion?.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={feedback !== 'none'}
            className="py-10 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl text-4xl font-black shadow-xl active:scale-95 transition-all border-b-8 border-slate-900 active:border-b-0 active:translate-y-2 flex items-center justify-center text-center break-words"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}