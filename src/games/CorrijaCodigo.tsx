import { useState, useRef } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { Bug, CheckCircle2, XCircle, ArrowRight, Info } from 'lucide-react';

const CHALLENGES = [
  {
    title: "Atualização de Setor em Massa",
    code: `UPDATE servidores SET setor = 'STI'\n\n-- Comando executado com sucesso em 14.500 linhas.`,
    options: [
      'Faltou a cláusula `WHERE`. Todo mundo foi transferido para a STI.',
      'O comando correto seria `MODIFY servidores`.',
      'Faltou colocar ponto e vírgula `;` no começo.',
      'O banco de dados está fora do ar.'
    ],
    answer: 0
  },
  {
    title: "Imprimir o primeiro item da lista",
    code: `const dias = ["Segunda", "Terça", "Quarta"];\n\nconsole.log("Hoje é " + dias[1]);`,
    options: [
      'Trocar `dias[1]` por `dias[0]`, pois arrays começam no índice zero.',
      'Trocar `console.log` por `print`.',
      'Arrays devem usar chaves `{}` em vez de colchetes `[]`.',
      'Faltou adicionar o `return` antes do console.'
    ],
    answer: 0
  },
  {
    title: "Criando um link para a Intranet",
    code: `<a url="https://intranet.tcdf.df.gov.br">Acessar Intranet</a>`,
    options: [
      'Tags `<a>` não podem conter links externos.',
      'O atributo correto para links é `href` e não `url`.',
      'Faltou fechar a tag com `</link>`.',
      'O texto "Acessar Intranet" deveria estar fora da tag.'
    ],
    answer: 1
  },
  {
    title: "Concatenando strings no PHP",
    code: `<?php\n$nome = "Fernando"\necho "Bem-vindo, " . $nome;\n?>`,
    options: [
      'A concatenação no PHP é feita com `+` e não com `.`',
      'Faltou o `$` antes de chamar o `echo`.',
      'Faltou o ponto e vírgula `;` no final da linha do `$nome`.',
      'A variável deveria ser declarada com `let $nome`.'
    ],
    answer: 2
  },
  {
    title: "Escondendo a barra lateral com CSS",
    code: `.sidebar {\n  display: hidden;\n}`,
    options: [
      'O valor correto para esconder totalmente é `display: none;`.',
      'O ponto `.` antes de sidebar significa que é um ID, deveria ser `#`.',
      'Faltou colocar a cor de fundo transparente.',
      'O CSS precisa da tag `<style>` dentro da classe.'
    ],
    answer: 0
  },
  {
    title: "Buscando todos os chamados",
    code: `SELECT ALL FROM chamados;`,
    options: [
      'O comando correto é `GET * FROM chamados`.',
      'Trocar a palavra `ALL` pelo asterisco `*`.',
      'É obrigatório usar a cláusula `WHERE` em qualquer `SELECT`.',
      'Faltou especificar a ordem com `ORDER BY`.'
    ],
    answer: 1
  },
  {
    title: "Loop de Processamento",
    code: `let contador = 0;\nwhile (contador < 10) {\n  console.log("Processando...");\n}`,
    options: [
      'Trocar `while` por `if`.',
      'Faltou a condição `contador++` para evitar um loop infinito.',
      'A variável deve ser `const` ao invés de `let`.',
      'O JavaScript não suporta loops com a palavra `while`.'
    ],
    answer: 1
  },
  {
    title: "Script Python Simples",
    code: `def iniciar_sistema():\nprint("Sistema iniciado com sucesso!")\n\niniciar_sistema()`,
    options: [
      'O Python exige que o `print` tenha um espaço (indentação) antes.',
      'Faltou colocar chaves `{}` em volta da função.',
      'O comando de imprimir em Python é `echo`.',
      'A função deve ser chamada com `call iniciar_sistema()`.'
    ],
    answer: 0
  },
  {
    title: "Inserindo Equipamento Novo",
    code: `INSERT INTO equipamentos (patrimonio, tipo, status)\nVALUES (12345, "Notebook");`,
    options: [
      'Não se pode usar números no `VALUES`.',
      'A tabela precisa ser criada no mesmo comando.',
      'Faltou passar o valor do `status`. O número de colunas não bate.',
      'O comando para inserir dados é `ADD INTO`.'
    ],
    answer: 2
  },
  {
    title: "Verificando se a senha é fraca",
    code: `let senha = "123";\n\nif (senha = "000") {\n  console.log("Senha fraca!");\n}`,
    options: [
      'O código está atribuindo um valor com `=`, e não comparando com `===`.',
      'Faltou colocar a senha entre parênteses.',
      'O JavaScript não permite variáveis chamadas `senha`.',
      'O bloco `if` não aceita strings na condição.'
    ],
    answer: 0
  },
  {
    title: "Estrutura HTML Básica",
    code: `<div>\n  <h1>Sistema TechWeek</h1>\n  <p>Bem-vindo ao novo portal\n</div>`,
    options: [
      'A tag `<div>` não pode conter um `<h1>` dentro dela.',
      'Faltou fechar a tag `</p>` no final do texto.',
      'Tags no HTML5 usam colchetes `[div]` em vez de `<div >`.',
      'O texto precisa obrigatoriamente estar em maiúsculo.'
    ],
    answer: 1
  },
  {
    title: "Validação de Usuário (JS)",
    code: `let NomeDoUsuario = "Admin";\n\nif (nomedousuario === "Admin") {\n  liberarAcesso();\n}`,
    options: [
      'JavaScript é Case Sensitive. `NomeDoUsuario` é diferente de `nomedousuario`.',
      'Variáveis longas precisam ser divididas com underline `_`.',
      'O comando `liberarAcesso()` deve receber a variável como parâmetro.',
      'O tipo `let` não permite que o valor seja comparado depois.'
    ],
    answer: 0
  },
  {
    title: "Atribuição a uma Constante",
    code: `const limite = 100;\nlimite = 200;\nconsole.log(limite);`,
    options: [
      'A constante `limite` precisava ter aspas.',
      'Variáveis `const` não podem ter seu valor reatribuído.',
      'Faltou ponto e vírgula na primeira linha.',
      'O `console.log` não aceita números diretos.'
    ],
    answer: 1
  },
  {
    title: "React JSX: Adicionando Classe CSS",
    code: `export default function Botao() {\n  return <button class="btn-primario">Clique</button>;\n}`,
    options: [
      'A tag `<button>` não precisa ser fechada.',
      'No React (JSX), deve-se usar `className` ao invés de `class`.',
      'Funções no React não podem usar o `export default`.',
      'O `return` precisa estar entre aspas.'
    ],
    answer: 1
  },
  {
    title: "Deletando Registros (SQL)",
    code: `DELETE * FROM logs WHERE data < '2026-01-01';`,
    options: [
      'É impossível deletar logs por data.',
      'O asterisco `*` não é usado na sintaxe de `DELETE`. Use apenas `DELETE FROM`.',
      'A cláusula `WHERE` vem antes da tabela.',
      'Datas no SQL precisam estar no formato DD/MM/AAAA.'
    ],
    answer: 1
  },
  {
    title: "Requisição Assíncrona (JS)",
    code: `async function buscarDados() {\n  const res = fetch('https://api.tcdf.br/dados');\n  const json = await res.json();\n}`,
    options: [
      'O método `json()` não existe no JavaScript.',
      'Faltou colocar `await` antes da chamada do `fetch`.',
      'O link deveria estar entre chaves `{}`.',
      'Funções `async` precisam retornar um número.'
    ],
    answer: 1
  },
  {
    title: "Exibindo Imagem (HTML)",
    code: `<img href="logo-tcdf.png" alt="Logo">`,
    options: [
      'Imagens devem usar a tag `<pic>`.',
      'O atributo para definir a fonte da imagem é `src` e não `href`.',
      'Faltou fechar com `</img>`.',
      'O atributo `alt` é proibido na versão atual do HTML.'
    ],
    answer: 1
  },
  {
    title: "Tamanho de uma Array (JS)",
    code: `const lista = [1, 2, 3, 4];\nconsole.log(lista.length());`,
    options: [
      'A propriedade `length` não é uma função. Deve ser chamada sem os parênteses `()`.',
      'A palavra correta é `size` em vez de `length`.',
      'A lista tem números misturados, o `length` falhará.',
      'A lista só pode ter até 3 elementos.'
    ],
    answer: 0
  },
  {
    title: "Retornando um Objeto (Arrow Function)",
    code: `const criarUsuario = (nome) => { nome: nome, cargo: 'Analista' };`,
    options: [
      'Arrow functions não podem receber argumentos.',
      'Faltam parênteses `()` envolta do objeto para o retorno implícito funcionar.',
      'A chave do objeto `nome:` não pode ter o mesmo nome do parâmetro.',
      'Não se pode usar strings com aspas simples em objetos.'
    ],
    answer: 1
  },
  {
    title: "Commit no Git",
    code: `$ git commit -a "Atualizando o design da tela"`,
    options: [
      'O Git não aceita frases longas no commit.',
      'Faltou colocar a palavra `push` no meio.',
      'A flag correta para mensagens é `-m`, não `-a`.',
      'Faltou o ponto `.` no final da frase.'
    ],
    answer: 2
  },
  {
    title: "Adicionando na Lista (Python)",
    code: `servidores = ["Fred", "Regis"]\nservidores.add("Bruno")`,
    options: [
      'O método correto para adicionar em listas no Python é `append()`.',
      'A lista deve usar chaves `{}`.',
      'Faltou colocar ponto e vírgula `;` no final.',
      'O Python não suporta listas de texto.'
    ],
    answer: 0
  },
  {
    title: "Verificação de Variável Definida (PHP)",
    code: `if (isset(usuario)) {\n  echo "Existe";\n}`,
    options: [
      'O comando `echo` só imprime números.',
      'A variável deve começar com `$` no PHP (`$usuario`).',
      'A função `isset()` não requer parênteses.',
      'O comando `if` no PHP é escrito em maiúsculo.'
    ],
    answer: 1
  },
  {
    title: "Margem CSS",
    code: `.caixa {\n  margin-top: 20;\n}`,
    options: [
      'A classe `.caixa` precisa iniciar com `#`.',
      'Faltou definir a unidade de medida (como `px`, `rem`, `%`).',
      'Valores de margem não podem passar de 10.',
      'O CSS não permite hífens `-` nos nomes de propriedades.'
    ],
    answer: 1
  },
  {
    title: "Lógica de Tipos Primitivos (JS)",
    code: `console.log(typeof null);`,
    options: [
      'Retornará "null", pois o JavaScript trata null como tipo único.',
      'Retornará "undefined", pois null é a mesma coisa.',
      'Irá estourar um erro no console.',
      'Retornará "object". É um bug histórico conhecido do JavaScript.'
    ],
    answer: 3
  },
  {
    title: "Declaração de Array Curta (PHP)",
    code: `$cores = array("Azul", "Verde");\n// Qual é a sintaxe mais moderna e equivalente?`,
    options: [
      '`$cores = {"Azul", "Verde"};`',
      '`$cores = ["Azul", "Verde"];`',
      '`$cores = <"Azul", "Verde">;`',
      '`array $cores = ("Azul", "Verde");`'
    ],
    answer: 1
  },
  {
    title: "Importação no React/ES6",
    code: `import { useState } form 'react';`,
    options: [
      'A palavra-chave correta é `from`, houve um erro de digitação.',
      '`useState` não precisa das chaves `{}`.',
      'Módulos nativos devem usar `require()`.',
      'Faltou o `.js` no final de `react`.'
    ],
    answer: 0
  }
];

const QUESTIONS_PER_GAME = 5;

export default function CorrijaCodigo() {
  const { endGame, activeDifficulty } = useAppStore();
  
  const [questions] = useState(() => [...CHALLENGES].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME));
  const [currentQ, setCurrentQ] = useState(0);
  const score = useRef(0);
  
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleAnswer = (optionIndex: number) => {
    if (feedback !== null) return;
    
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === questions[currentQ].answer;
    
    if (isCorrect) {
      score.current += 1;
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    
    if (currentQ + 1 < questions.length) {
      setCurrentQ(q => q + 1);
    } else {
      const maxPts = MAX_SCORES['corrija-codigo'][activeDifficulty || 'AVANCADO'] || 350;
      const pontos = Math.round((score.current / QUESTIONS_PER_GAME) * maxPts);
      endGame([pontos]);
    }
  };

  const renderOptionText = (text: string) => {
    const parts = text.split(/`([^`]+)`/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="text-rose-400 font-mono bg-slate-900/50 px-1.5 py-0.5 rounded border border-rose-900/50 mx-1">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  if (currentQ >= questions.length) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl p-8 relative">
      
      <div className="text-center mb-6 flex flex-col items-center">
        <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-4">
          <Bug size={40} className="text-cyan-400" /> Corrija o Código
        </h1>
        <p className="text-xl text-slate-400">Encontre a correção exata para o bug no script.</p>
      </div>

      <div className="w-full bg-slate-800 border-2 border-slate-700 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
        
        <div className="bg-slate-900 p-6 flex justify-between items-center border-b-2 border-slate-700">
          <span className="text-cyan-400 font-bold uppercase tracking-widest">Desafio {currentQ + 1} de {QUESTIONS_PER_GAME}</span>
        </div>

        <div className="p-8 flex flex-col gap-6 items-center w-full relative">
          
          {feedback && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in zoom-in p-8 text-center rounded-b-[2.5rem]">
              {feedback === 'correct' && <CheckCircle2 size={100} className="text-emerald-400 mb-4" />}
              {feedback === 'wrong' && <XCircle size={100} className="text-rose-500 mb-4" />}
              
              <h2 className={`text-5xl font-black mb-4 ${feedback === 'correct' ? 'text-emerald-400' : 'text-rose-500'}`}>
                {feedback === 'correct' ? 'BUG CORRIGIDO!' : 'SISTEMA CRASHOU!'}
              </h2>
              
              {feedback === 'wrong' && (
                <p className="text-2xl text-white mt-2 mb-8 flex flex-col items-center gap-4">
                  A correção exata era: 
                  <span className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-slate-300">
                    {renderOptionText(questions[currentQ].options[questions[currentQ].answer])}
                  </span>
                </p>
              )}

              <button 
                onClick={nextQuestion}
                className="mt-4 flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                {currentQ + 1 < questions.length ? 'Próximo Desafio' : 'Ver Resultado'} <ArrowRight size={28} />
              </button>
            </div>
          )}

          {/* TÍTULO E CONTEXTO DO PROBLEMA */}
          {questions[currentQ].title && (
             <div className="w-full flex items-center gap-3 text-2xl font-bold text-slate-200 mb-2 pl-2">
                <Info size={28} className="text-cyan-500" /> {questions[currentQ].title}
             </div>
          )}

          {/* ÁREA DO CÓDIGO COM LINHAS NUMERADAS */}
          <pre className="w-full bg-slate-950 p-6 rounded-2xl border border-slate-700 shadow-inner overflow-x-auto min-h-[120px] flex flex-col justify-center">
            <code className="text-rose-400 text-xl font-mono leading-relaxed">
              {questions[currentQ].code.split('\n').map((line, index) => (
                <div key={index} className="flex">
                  <span className="w-8 text-slate-600 select-none text-right mr-4 border-r border-slate-800 pr-4">{index + 1}</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </code>
          </pre>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions[currentQ].options.map((opcao, i) => {
              let btnClass = "bg-slate-700 text-white border-slate-600";
              if (feedback !== null) {
                if (i === questions[currentQ].answer) btnClass = "bg-emerald-500 text-white border-emerald-400";
                else if (i === selectedOption) btnClass = "bg-rose-500 text-white border-rose-400";
                else btnClass = "bg-slate-800 text-slate-500 border-slate-700";
              }

              return (
                <button
                  key={i}
                  disabled={feedback !== null}
                  onClick={() => handleAnswer(i)}
                  className={`py-6 px-6 text-xl font-bold rounded-xl border-2 transition-all text-left ${feedback === null ? 'hover:bg-cyan-500 hover:border-cyan-400 active:scale-95' : ''} ${btnClass}`}
                >
                  {renderOptionText(opcao)}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}