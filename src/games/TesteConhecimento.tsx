import { useState, useRef } from 'react';
import { useAppStore } from '../core/store';
import { playClick, playSuccess, playError } from '../core/audio';
import { BookOpen, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const QUESTIONS = {
  INTERMEDIARIO: [
    { q: 'Qual protocolo traduz nomes de domínio em endereços IP?', options: ['FTP', 'HTTP', 'DNS', 'DHCP'], a: 2 },
    { q: 'Qual linguagem de marcação é estruturalmente padrão na web?', options: ['CSS', 'Python', 'HTML', 'JavaScript'], a: 2 },
    { q: 'No modelo relacional de Banco de Dados, o que garante a unicidade de um registro?', options: ['Foreign Key', 'Primary Key', 'Index', 'Trigger'], a: 1 },
    { q: 'Qual destas portas é padrão para o protocolo HTTPS?', options: ['80', '443', '21', '22'], a: 1 },
    { q: 'O que o termo "Ping" testa em uma rede?', options: ['A velocidade de download', 'A segurança da conexão', 'A latência e conectividade entre dois hosts', 'A potência do sinal Wi-Fi'], a: 2 },
    { q: 'Qual protocolo é utilizado para envio de e-mails?', options: ['POP3', 'IMAP', 'SMTP', 'SNMP'], a: 2 },
    { q: 'Qual comando Linux lista os arquivos de um diretório?', options: ['cd', 'pwd', 'ls', 'dir'], a: 2 },
    { q: 'O que significa a sigla SSD?', options: ['Solid State Drive', 'Super Speed Disk', 'Solid Speed Drive', 'System State Disk'], a: 0 },
    { q: 'Qual o formato de dados mais popular usado em APIs REST atualmente?', options: ['XML', 'YAML', 'CSV', 'JSON'], a: 3 },
    { q: 'Qual a principal função de um Firewall?', options: ['Acelerar a internet', 'Filtrar tráfego de rede', 'Aumentar sinal Wi-Fi', 'Remover vírus'], a: 1 },
    { q: 'No Git, qual comando baixa as últimas alterações do repositório remoto?', options: ['git push', 'git commit', 'git pull', 'git status'], a: 2 },
    { q: 'Em redes, o que é o "localhost"?', options: ['O roteador principal', 'A máquina local (127.0.0.1)', 'O servidor DNS', 'Um provedor de internet'], a: 1 },
    { q: 'O que o CSS faz em uma página web?', options: ['Define a estrutura', 'Cria interatividade', 'Estiliza e formata visualmente', 'Consulta o banco de dados'], a: 2 },
    { q: 'Qual destas NÃO é uma linguagem orientada a objetos?', options: ['Java', 'C++', 'C', 'C#'], a: 2 },
    { q: 'O que a sigla RAM significa?', options: ['Read Access Memory', 'Random Access Memory', 'Run Active Machine', 'Ready Action Memory'], a: 1 },
    { q: 'Para que serve uma VPN?', options: ['Criar uma rede privada virtual', 'Acelerar o processador', 'Formatar o disco rígido', 'Criar sites'], a: 0 },
    { q: 'O que é um arquivo com extensão .exe no Windows?', options: ['Arquivo de texto', 'Planilha', 'Arquivo Executável', 'Imagem'], a: 2 },
    { q: 'Qual o sistema operacional base dos smartphones Android?', options: ['Windows', 'iOS', 'Symbian', 'Linux'], a: 3 },
    { q: 'Em bancos de dados SQL, qual comando recupera dados?', options: ['UPDATE', 'INSERT', 'SELECT', 'DELETE'], a: 2 },
    { q: 'Qual destas é uma topologia de rede física clássica?', options: ['Estrela', 'Quadrado', 'Triângulo', 'Pirâmide'], a: 0 },
    { q: 'O que é Open Source?', options: ['Software com código-fonte aberto', 'Software pago', 'Software com vírus', 'Um sistema da Microsoft'], a: 0 },
    { q: 'O endereço MAC é...', options: ['O IP da máquina', 'O endereço físico da placa de rede', 'A senha do Wi-Fi', 'O número do roteador'], a: 1 },
    { q: 'Qual linguagem é conhecida por usar indentação como sintaxe obrigatória?', options: ['Java', 'C++', 'JavaScript', 'Python'], a: 3 },
    { q: 'O que a tag <a> faz em HTML?', options: ['Cria um parágrafo', 'Cria um link (âncora)', 'Insere uma imagem', 'Deixa o texto negrito'], a: 1 },
    { q: 'Para que serve o comando "sudo" no Linux?', options: ['Sair do sistema', 'Desligar o PC', 'Executar como superusuário (root)', 'Procurar arquivos'], a: 2 },
    { q: 'Qual destes é um banco de dados NoSQL?', options: ['PostgreSQL', 'MySQL', 'MongoDB', 'Oracle'], a: 2 },
    { q: 'Qual protocolo é responsável por atribuir IP dinamicamente na rede?', options: ['DNS', 'DHCP', 'HTTP', 'FTP'], a: 1 },
    { q: 'Qual atalho no teclado geralmente copia um item?', options: ['Ctrl + X', 'Ctrl + V', 'Ctrl + Z', 'Ctrl + C'], a: 3 },
    { q: 'O que o comando "ping 8.8.8.8" faz?', options: ['Limpa o cache', 'Acessa o site do Google', 'Testa a conexão com o DNS do Google', 'Desliga a placa de rede'], a: 2 },
    { q: 'Qual empresa mantém a linguagem TypeScript?', options: ['Google', 'Meta', 'Microsoft', 'Apple'], a: 2 }
  ],
  AVANCADO: [
    { q: 'Qual design pattern assegura que uma classe tenha apenas uma instância?', options: ['Factory', 'Observer', 'Singleton', 'Decorator'], a: 2 },
    { q: 'Qual é o tempo de complexidade (Big O) da busca binária?', options: ['O(1)', 'O(n)', 'O(n log n)', 'O(log n)'], a: 3 },
    { q: 'Qual protocolo de roteamento exterior é a base do roteamento na internet?', options: ['OSPF', 'BGP', 'EIGRP', 'RIP'], a: 1 },
    { q: 'No Linux, qual permissão numérica (chmod) concede acesso total ao dono, e leitura/execução aos demais?', options: ['755', '777', '644', '400'], a: 0 },
    { q: 'O que caracteriza a propriedade "Atomicidade" nas transações ACID?', options: ['Garantir que a transação ocorra por inteiro ou não ocorra.', 'Os dados devem persistir após uma falha.', 'O banco deve permanecer consistente antes e depois.', 'Transações concorrentes não interferem.'], a: 0 },
    { q: 'Em redes, a camada de Transporte do Modelo OSI utiliza quais protocolos principais?', options: ['IP e ICMP', 'TCP e UDP', 'HTTP e FTP', 'MAC e ARP'], a: 1 },
    { q: 'O que é CORS em desenvolvimento web?', options: ['Cross-Origin Resource Sharing', 'Cascading Origin Style', 'Centralized Object Repository', 'Control Of Remote Systems'], a: 0 },
    { q: 'No Git, qual a diferença entre rebase e merge?', options: ['Merge apaga commits antigos, rebase não.', 'Rebase reescreve o histórico para ficar linear, merge cria um commit de junção.', 'Merge só funciona localmente, rebase só remotamente.', 'Não há diferença prática.'], a: 1 },
    { q: 'Qual o tamanho em bits de um endereço IPv6?', options: ['32 bits', '64 bits', '128 bits', '256 bits'], a: 2 },
    { q: 'Em C++, o que é uma função virtual pura?', options: ['Uma função que não retorna nada (void).', 'Uma função que deve ser implementada por classes derivadas.', 'Uma função protegida por mutex.', 'Uma função declarada no arquivo .h, mas sem .cpp.'], a: 1 },
    { q: 'No Kubernetes, qual componente é responsável por garantir que o número correto de Pods esteja rodando?', options: ['Ingress', 'Service', 'ReplicaSet', 'ConfigMap'], a: 2 },
    { q: 'O que caracteriza um ataque "Man-in-the-Middle" (MitM)?', options: ['Injetar SQL no banco', 'Derrubar o servidor com flood', 'Interceptar a comunicação entre duas partes sem que saibam', 'Adivinhar senhas por força bruta'], a: 2 },
    { q: 'Qual algoritmo de ordenação tem pior caso O(n²) mas caso médio O(n log n)?', options: ['Merge Sort', 'Quick Sort', 'Heap Sort', 'Bubble Sort'], a: 1 },
    { q: 'O que é "Deadlock" em programação concorrente?', options: ['Quando duas threads ficam esperando uma pela outra infinitamente.', 'Quando uma thread morre por falta de memória.', 'Quando a CPU trava por superaquecimento.', 'Quando um banco de dados é desligado inesperadamente.'], a: 0 },
    { q: 'Qual a porta padrão do RDP (Remote Desktop Protocol)?', options: ['3389', '22', '443', '1433'], a: 0 },
    { q: 'Em arquitetura de microsserviços, o que é um API Gateway?', options: ['Um banco de dados compartilhado.', 'Um firewall de borda.', 'Um ponto de entrada único que roteia requisições para os microsserviços.', 'Um balanceador de carga L4.'], a: 2 },
    { q: 'O que é o estado "Zombie" em um processo Linux?', options: ['Um processo que consumiu toda a RAM.', 'Um processo que terminou a execução mas ainda tem entrada na tabela de processos.', 'Um vírus residente na memória.', 'Um processo rodando em background sem interface.'], a: 1 },
    { q: 'Para que serve um índice B-Tree num banco de dados?', options: ['Comprimir os dados.', 'Criptografar as senhas.', 'Acelerar a recuperação (busca) de registros em grande escala.', 'Fazer backup automático.'], a: 2 },
    { q: 'Em criptografia, qual a diferença entre Hash e Encriptação?', options: ['Hash é muito mais lento.', 'Encriptação só funciona com textos curtos.', 'Hash é uma função de via única (irreversível), Encriptação é reversível (se tiver a chave).', 'Hash usa chaves públicas, Encriptação privadas.'], a: 2 },
    { q: 'O que a cláusula "UNION ALL" faz no SQL?', options: ['Junta os resultados de dois SELECTs removendo duplicatas.', 'Junta os resultados de dois SELECTs mantendo duplicatas.', 'Faz um JOIN entre todas as tabelas do banco.', 'Cria uma nova tabela com a união dos dados.'], a: 1 },
    { q: 'Em TypeScript, o que o tipo "Omit<T, K>" faz?', options: ['Cria um tipo omitindo as propriedades especificadas K de T.', 'Omite os erros do compilador.', 'Força que K seja igual a T.', 'Cria um array vazio do tipo T.'], a: 0 },
    { q: 'O que é um ataque "Buffer Overflow"?', options: ['Quando o servidor recebe muitos pacotes ping.', 'Escrever mais dados num bloco de memória do que ele pode armazenar, corrompendo áreas vizinhas.', 'Quando a tela do usuário enche de pop-ups.', 'Desbordamento do cache do navegador web.'], a: 1 },
    { q: 'Qual a diferença entre UDP e TCP?', options: ['UDP é focado em texto, TCP em vídeo.', 'TCP é orientado a conexão e garante entrega; UDP envia datagramas sem garantia.', 'TCP é mais rápido que UDP em todos os casos.', 'UDP é usado apenas em redes locais.'], a: 1 },
    { q: 'No contexto do protocolo HTTP, o que o status code 403 significa?', options: ['Not Found', 'Internal Server Error', 'Forbidden (Acesso negado)', 'Unauthorized (Não autenticado)'], a: 2 },
    { q: 'Qual o papel do "Garbage Collector" em linguagens gerenciadas?', options: ['Apagar arquivos temporários do SO.', 'Formatar o código fonte.', 'Liberar automaticamente memória de objetos que não são mais referenciados.', 'Otimizar o banco de dados.'], a: 2 },
    { q: 'O que é "Inversão de Dependência" (o "D" do SOLID)?', options: ['Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.', 'Inverter if/else para else/if.', 'Baixar bibliotecas invertidas pelo npm.', 'Garantir que a classe dependa de si mesma.'], a: 0 },
    { q: 'Para que serve um ataque XSS (Cross-Site Scripting)?', options: ['Derrubar um site com tráfego pesado.', 'Injetar scripts maliciosos (ex: JS) em páginas web vistas por outros usuários.', 'Quebrar senhas do banco de dados.', 'Descobrir IPs ocultos.'], a: 1 },
    { q: 'Qual o comando Docker para listar todos os containers (inclusive parados)?', options: ['docker ls', 'docker ps -a', 'docker containers --all', 'docker show'], a: 1 },
    { q: 'O que significa "Idempotência" em uma API REST?', options: ['A requisição nunca falha.', 'A requisição exige autenticação.', 'Fazer a mesma requisição várias vezes produz o mesmo resultado no servidor.', 'A API só aceita formato JSON.'], a: 2 },
    { q: 'Na arquitetura de processadores, o que é um "Pipeline hazard"?', options: ['Quando o processador superaquece.', 'Um conflito na execução de instruções simultâneas que faz o pipeline atrasar (stall).', 'Um erro de tela azul do Windows.', 'Quando falta pasta térmica.'], a: 1 }
  ]
};

const QUESTIONS_PER_GAME = 7;

export default function TesteConhecimento() {
  const { endGame, activeGameId } = useAppStore();
  
  // VERIFICAÇÃO ATUALIZADA: Lê do ID do jogo no roteador
  const level = activeGameId === 'teste-conhecimento-adv' ? 'AVANCADO' : 'INTERMEDIARIO';

  const [questions] = useState(() => {
    return [...QUESTIONS[level]].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME);
  });
  
  const [currentQ, setCurrentQ] = useState(0);
  const score = useRef(0);
  
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = (optionIndex: number) => {
    if (feedback !== null) return;
    
    const isCorrect = optionIndex === questions[currentQ].a;
    
    if (isCorrect) {
      playSuccess();
      score.current += 1;
      setFeedback('correct');
    } else {
      playError();
      setFeedback('wrong');
    }
  };

  const nextQuestion = () => {
    playClick();
    setFeedback(null);
    
    if (currentQ + 1 < questions.length) {
      setCurrentQ(q => q + 1);
    } else {
      const maxPts = level === 'AVANCADO' ? 300 : 180;
      const pontos = Math.round((score.current / QUESTIONS_PER_GAME) * maxPts);
      endGame([pontos]);
    }
  };

  if (currentQ >= questions.length) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative">
      <div className="text-center mb-6 flex flex-col items-center">
        <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-4">
          <BookOpen size={40} className="text-cyan-400" /> Teste de Conhecimento
        </h1>
        <p className="text-xl text-slate-400">Nível: <strong className="text-white">{level === 'AVANCADO' ? 'Avançado (Expert)' : 'Intermediário'}</strong>.</p>
      </div>

      <div className="w-full max-w-4xl bg-slate-800 border-2 border-slate-700 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-900 p-6 flex justify-between items-center border-b-2 border-slate-700">
          <span className="text-cyan-400 font-bold uppercase tracking-widest">Questão {currentQ + 1} de {QUESTIONS_PER_GAME}</span>
        </div>

        <div className="p-12 flex flex-col gap-10 items-center w-full relative min-h-[400px]">
          {feedback ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in zoom-in p-8 text-center">
              {feedback === 'correct' && <CheckCircle2 size={100} className="text-emerald-400 mb-4" />}
              {feedback === 'wrong' && <XCircle size={100} className="text-rose-500 mb-4" />}
              
              <h2 className={`text-5xl font-black mb-4 ${feedback === 'correct' ? 'text-emerald-400' : 'text-rose-500'}`}>
                {feedback === 'correct' ? 'EXCELENTE!' : 'RESPOSTA INCORRETA!'}
              </h2>
              
              {feedback === 'wrong' && (
                <p className="text-2xl text-white mt-2 mb-8">
                  A resposta correta era: <br/>
                  <strong className="text-cyan-400 block mt-2">{questions[currentQ].options[questions[currentQ].a]}</strong>
                </p>
              )}

              <button 
                onClick={nextQuestion}
                className="mt-4 flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                {currentQ + 1 < questions.length ? 'Próxima Questão' : 'Ver Resultado'} <ArrowRight size={28} />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center leading-relaxed">
                {questions[currentQ].q}
              </h2>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {questions[currentQ].options.map((opcao, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="py-6 px-6 bg-slate-900 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 text-2xl font-bold rounded-2xl border-2 border-slate-700 hover:border-cyan-500 transition-all active:scale-95 text-left flex items-center"
                  >
                    <span className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center mr-4 text-sm shrink-0 border border-slate-600">
                      {['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opcao}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}