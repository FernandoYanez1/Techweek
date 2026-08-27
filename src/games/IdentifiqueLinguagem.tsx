import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { Code2, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const SNIPPETS = [
  // LINGUAGENS MUITO POPULARES (Web, Backend, Dados)
  {
    code: `const filterUsers = (users) => {\n  return users.filter(u => u.active)\n              .map(u => u.id);\n};`,
    lang: 'JavaScript',
    options: ['Java', 'Python', 'JavaScript', 'C++']
  },
  {
    code: `import pandas as pd\n\ndf = pd.read_csv('dados.csv')\nprint(df.groupby('setor').mean())`,
    lang: 'Python',
    options: ['R', 'Python', 'Julia', 'Ruby']
  },
  {
    code: `SELECT a.nome, d.departamento\nFROM analistas a\nINNER JOIN departamentos d ON a.dep_id = d.id;`,
    lang: 'SQL',
    options: ['SQL', 'MongoDB', 'Python', 'Bash']
  },
  {
    code: `public interface UserRepository extends JpaRepository<User, Long> {\n    List<User> findByEmail(String email);\n}`,
    lang: 'Java',
    options: ['C#', 'Java', 'Kotlin', 'TypeScript']
  },
  {
    code: `[HttpPost]\npublic async Task<IActionResult> CriarUsuario(UsuarioDto dto) {\n    await _service.Salvar(dto);\n    return Ok();\n}`,
    lang: 'C#',
    options: ['Java', 'C#', 'C++', 'Swift']
  },
  {
    code: `public function index()\n{\n    $users = User::where('active', 1)->get();\n    return view('users.index', compact('users'));\n}`,
    lang: 'PHP',
    options: ['Ruby', 'PHP', 'Perl', 'Python']
  },
  {
    code: `<main class="container">\n  <article>\n    <h2>TechWeek 2026</h2>\n  </article>\n</main>`,
    lang: 'HTML',
    options: ['XML', 'Markdown', 'HTML', 'JSX']
  },
  {
    code: `.flex-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}`,
    lang: 'CSS',
    options: ['HTML', 'CSS', 'SCSS', 'JavaScript']
  },
  {
    code: `function Contador() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}`,
    lang: 'JavaScript',
    options: ['TypeScript', 'JavaScript', 'HTML', 'Swift']
  },
  {
    code: `app.get('/api/status', (req, res) => {\n  res.json({ online: true, server: 'TCDF' });\n});`,
    lang: 'JavaScript',
    options: ['Python', 'PHP', 'JavaScript', 'Ruby']
  },
  {
    code: `@app.route("/items/<int:item_id>")\ndef read_item(item_id):\n    return {"item_id": item_id}`,
    lang: 'Python',
    options: ['Ruby', 'Python', 'Go', 'PHP']
  },
  {
    code: `interface Funcionario {\n  matricula: number;\n  nome: string;\n  ativo?: boolean;\n}`,
    lang: 'TypeScript',
    options: ['JavaScript', 'TypeScript', 'Java', 'C#']
  },
  {
    code: `def analisar_dados(matriz):\n    return [linha[0] for linha in matriz if sum(linha) > 10]`,
    lang: 'Python',
    options: ['Ruby', 'Python', 'C#', 'PHP']
  },
  {
    code: `global $wpdb;\n$results = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}options" );`,
    lang: 'PHP',
    options: ['PHP', 'Ruby', 'Perl', 'C']
  },
  {
    code: `var results = from p in pessoas\n              where p.Idade > 18\n              select p.Nome;`,
    lang: 'C#',
    options: ['Java', 'C#', 'F#', 'Visual Basic']
  },
  {
    code: `List<String> filtrados = lista.stream()\n    .filter(s -> s.startsWith("A"))\n    .collect(Collectors.toList());`,
    lang: 'Java',
    options: ['C#', 'Java', 'Kotlin', 'TypeScript']
  },
  
  // MEDIANAS / MOBILE / SCRIPTS
  {
    code: `Widget build(BuildContext context) {\n  return Scaffold(\n    appBar: AppBar(title: Text('TechWeek')),\n  );\n}`,
    lang: 'Dart',
    options: ['Java', 'Dart', 'Swift', 'C#']
  },
  {
    code: `guard let document = file else {\n    print("Arquivo não encontrado")\n    return\n}`,
    lang: 'Swift',
    options: ['Kotlin', 'Swift', 'Objective-C', 'Dart']
  },
  {
    code: `GlobalScope.launch {\n    delay(1000L)\n    println("Mundo!")\n}`,
    lang: 'Kotlin',
    options: ['Java', 'Kotlin', 'Scala', 'Groovy']
  },
  {
    code: `awk -F':' '{ print $1 }' /etc/passwd | sort | uniq -c`,
    lang: 'Bash',
    options: ['Bash', 'PowerShell', 'Perl', 'Python']
  },
  {
    code: `[1, 2, 3].each do |n|\n  puts "Número: #{n}"\n  yield(n) if block_given?\nend`,
    lang: 'Ruby',
    options: ['Python', 'Ruby', 'Elixir', 'Perl']
  },
  
  // BAIXO NÍVEL E "EXÓTICAS" (Para dar dificuldade)
  {
    code: `template <typename T>\nT max(T a, T b) {\n    return (a > b) ? a : b;\n}`,
    lang: 'C++',
    options: ['C', 'C++', 'Java', 'C#']
  },
  {
    code: `int *ptr = (int *)malloc(5 * sizeof(int));\nif (ptr == NULL) {\n    exit(1);\n}`,
    lang: 'C',
    options: ['C++', 'C', 'Objective-C', 'Assembly']
  },
  {
    code: `fn process_data(input: &str) -> Result<String, ParseError> {\n    let parsed = input.parse::<i32>()?;\n    Ok(format!("Valor: {}", parsed))\n}`,
    lang: 'Rust',
    options: ['Rust', 'Go', 'C++', 'Haskell']
  },
  {
    code: `func worker(id int, jobs <-chan int, results chan<- int) {\n    for j := range jobs {\n        results <- j * 2\n    }\n}`,
    lang: 'Go',
    options: ['Go', 'Rust', 'Swift', 'Kotlin']
  },
  {
    code: `fib :: Int -> Int\nfib 0 = 0\nfib 1 = 1\nfib n = fib (n-1) + fib (n-2)`,
    lang: 'Haskell',
    options: ['Haskell', 'Lisp', 'Erlang', 'OCaml']
  },
  {
    code: `"Elixir" |> String.downcase() |> String.reverse()`,
    lang: 'Elixir',
    options: ['Erlang', 'Elixir', 'Ruby', 'Haskell']
  }
];

const QUESTIONS_PER_GAME = 10;
const TIME_LIMIT = 12;

export default function IdentifiqueLinguagem() {
  const { endGame, activeDifficulty } = useAppStore();
  
  const [questions] = useState(() => [...SNIPPETS].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME));
  const [currentQ, setCurrentQ] = useState(0);
  const score = useRef(0);
  
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);

  useEffect(() => {
    if (feedback !== null || currentQ >= questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setFeedback('timeout');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQ, feedback, questions.length]);

  const handleAnswer = (option: string) => {
    if (feedback !== null) return;
    
    const isCorrect = option === questions[currentQ].lang;
    
    if (isCorrect) {
      score.current += 1;
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setTimeLeft(TIME_LIMIT);
    
    if (currentQ + 1 < questions.length) {
      setCurrentQ(q => q + 1);
    } else {
      const maxPts = MAX_SCORES['identifique-linguagem'][activeDifficulty || 'AVANCADO'] || 300;
      const pontos = Math.round((score.current / QUESTIONS_PER_GAME) * maxPts);
      endGame([pontos]);
    }
  };

  if (currentQ >= questions.length) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl p-8 relative">
      
      <div className="text-center mb-6 flex flex-col items-center">
        <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-4">
          <Code2 size={40} className="text-cyan-400" /> Qual a Linguagem?
        </h1>
        <p className="text-xl text-slate-400">Analise o snippet e acerte a sintaxe rapidamente.</p>
      </div>

      <div className="w-full bg-slate-800 border-2 border-slate-700 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
        
        <div className="bg-slate-900 p-6 flex justify-between items-center border-b-2 border-slate-700">
          <span className="text-cyan-400 font-bold uppercase tracking-widest">Snippet {currentQ + 1} de {QUESTIONS_PER_GAME}</span>
          <div className={`flex items-center gap-2 font-black text-2xl ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
            <Clock size={28} /> 00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="p-10 flex flex-col gap-8 items-center w-full relative">
          
          {feedback && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in zoom-in p-8 text-center rounded-b-[2.5rem]">
              {feedback === 'correct' && <CheckCircle2 size={100} className="text-emerald-400 mb-4" />}
              {(feedback === 'wrong' || feedback === 'timeout') && <XCircle size={100} className="text-rose-500 mb-4" />}
              
              <h2 className={`text-5xl font-black mb-4 ${feedback === 'correct' ? 'text-emerald-400' : 'text-rose-500'}`}>
                {feedback === 'correct' ? 'ACERTOU!' : feedback === 'timeout' ? 'TEMPO ESGOTADO!' : 'ERRADO!'}
              </h2>
              
              {feedback !== 'correct' && (
                <p className="text-3xl text-white mt-2 mb-8">A linguagem era: <strong className="text-cyan-400">{questions[currentQ].lang}</strong></p>
              )}

              <button 
                onClick={nextQuestion}
                className="mt-4 flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                {currentQ + 1 < questions.length ? 'Próxima Pergunta' : 'Ver Resultado'} <ArrowRight size={28} />
              </button>
            </div>
          )}

          {/* O BLOCO DE CÓDIGO */}
          <pre className="w-full bg-slate-950 p-8 rounded-2xl border border-slate-700 shadow-inner overflow-x-auto min-h-[200px] flex items-center">
            <code className="text-emerald-400 text-2xl font-mono leading-relaxed">
              {questions[currentQ].code}
            </code>
          </pre>

          {/* OS BOTÕES EMBAIXO */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions[currentQ].options.sort().map((opcao, i) => (
              <button
                key={i}
                disabled={feedback !== null}
                onClick={() => handleAnswer(opcao)}
                className="py-6 px-6 bg-slate-700 hover:bg-cyan-500 text-white text-3xl font-bold rounded-xl border-2 border-slate-600 hover:border-cyan-400 transition-all active:scale-95 disabled:opacity-50"
              >
                {opcao}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}