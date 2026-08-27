import { useState, useMemo } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playSuccess, playError } from '../core/audio';
import { CheckCircle2, XCircle, Brain } from 'lucide-react';

const BANCO_QUIZ = {
  INICIANTE: [
    { p: 'O que significa a sigla HTML?', opcoes: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Module'], resp: 0 },
    { p: 'Qual o atalho padrão para "Desfazer" no Windows?', opcoes: ['Ctrl + C', 'Ctrl + Z', 'Ctrl + V', 'Ctrl + Y'], resp: 1 },
    { p: 'Qual hardware é considerado o "cérebro" do computador?', opcoes: ['Disco Rígido (HD)', 'Placa Mãe', 'Processador (CPU)', 'Memória RAM'], resp: 2 },
    { p: 'O que é um "Browser"?', opcoes: ['Um vírus', 'Navegador de internet', 'Linguagem de código', 'Peça do computador'], resp: 1 },
    { p: 'Para que serve a tecla "F5" na maioria dos navegadores?', opcoes: ['Fechar a janela', 'Atualizar a página', 'Salvar o arquivo', 'Abrir as configurações'], resp: 1 },
    { p: 'Qual empresa criou o sistema operacional Windows?', opcoes: ['Apple', 'IBM', 'Microsoft', 'Google'], resp: 2 },
    { p: 'Qual atalho de teclado copia um texto selecionado?', opcoes: ['Ctrl + X', 'Ctrl + V', 'Ctrl + Z', 'Ctrl + C'], resp: 3 },
    { p: 'O que a sigla "WWW" representa na internet?', opcoes: ['World Wide Web', 'World Web Wide', 'Web World Wide', 'Windows Web World'], resp: 0 },
    { p: 'Qual é a principal função de um antivírus?', opcoes: ['Aumentar a memória', 'Deixar a internet rápida', 'Proteger contra softwares maliciosos', 'Formatar o disco'], resp: 2 },
    { p: 'Qual destas opções é um sistema operacional móvel?', opcoes: ['Linux', 'Android', 'macOS', 'Windows 10'], resp: 1 },
    { p: 'Qual atalho salva o documento atual na maioria dos programas?', opcoes: ['Ctrl + P', 'Ctrl + O', 'Ctrl + S', 'Ctrl + A'], resp: 2 },
    { p: 'O que faz a tecla "Caps Lock"?', opcoes: ['Desliga o computador', 'Trava as letras em maiúsculas', 'Apaga tudo', 'Tira um print da tela'], resp: 1 },
    { p: 'Qual destes dispositivos é de ENTRADA de dados?', opcoes: ['Monitor', 'Impressora', 'Teclado', 'Caixa de Som'], resp: 2 },
    { p: 'Onde ficam armazenados os arquivos excluídos no Windows?', opcoes: ['Painel de Controle', 'Lixeira', 'Meus Documentos', 'Disco Local C:'], resp: 1 },
    { p: 'O que significa a sigla "PDF"?', opcoes: ['Portable Document Format', 'Print Data File', 'Personal Document Folder', 'Program Data Format'], resp: 0 },
    { p: 'Para que serve um "Pendrive"?', opcoes: ['Para ligar o Wi-Fi', 'Para armazenar e transportar dados', 'Para resfriar o PC', 'Para melhorar o gráfico'], resp: 1 },
    { p: 'Qual programa é nativo do Windows para edição básica de texto?', opcoes: ['Word', 'Excel', 'Bloco de Notas', 'Photoshop'], resp: 2 },
    { p: 'O que significa "Download"?', opcoes: ['Enviar arquivo para a internet', 'Baixar arquivo da internet', 'Apagar arquivo', 'Compartilhar a tela'], resp: 1 },
    { p: 'Qual o principal serviço de busca na internet hoje?', opcoes: ['Bing', 'Yahoo', 'Google', 'DuckDuckGo'], resp: 2 },
    { p: 'Qual tecla apaga o caractere à esquerda do cursor?', opcoes: ['Delete', 'Backspace', 'Enter', 'Space'], resp: 1 },
    { p: 'Qual a extensão comum de um arquivo de música?', opcoes: ['.mp4', '.jpg', '.mp3', '.pdf'], resp: 2 },
    { p: 'O que a sigla "USB" significa?', opcoes: ['Universal Serial Bus', 'United System Board', 'Under System Base', 'User Serial Board'], resp: 0 },
    { p: 'Qual é a medida básica de armazenamento de dados?', opcoes: ['Hertz', 'Byte', 'Pixel', 'Polegada'], resp: 1 },
    { p: 'Para que serve a tecla "Print Screen"?', opcoes: ['Imprimir em papel', 'Desligar a tela', 'Tirar uma "foto" da tela', 'Mudar o brilho'], resp: 2 },
    { p: 'Qual o nome do serviço de armazenamento em nuvem do Google?', opcoes: ['OneDrive', 'iCloud', 'Dropbox', 'Google Drive'], resp: 3 },
    { p: 'O que é um "Email"?', opcoes: ['Correio eletrônico', 'Site de notícias', 'Programa de edição', 'Placa de vídeo'], resp: 0 },
    { p: 'O que significa a sigla "Wi-Fi"?', opcoes: ['Wireless Fidelity', 'Wide Firewall', 'Window Finder', 'Web Fidelity'], resp: 0 },
    { p: 'Qual atalho cola um texto copiado?', opcoes: ['Ctrl + C', 'Ctrl + V', 'Ctrl + B', 'Ctrl + P'], resp: 1 },
    { p: 'Qual destes programas é usado para criar planilhas?', opcoes: ['Word', 'PowerPoint', 'Excel', 'Access'], resp: 2 },
    { p: 'O que significa a extensão ".jpg" ou ".png"?', opcoes: ['Documento de texto', 'Arquivo de imagem', 'Vídeo', 'Música'], resp: 1 },
    { p: 'Qual componente é responsável pela conexão à internet sem fio?', opcoes: ['Placa de Vídeo', 'Processador', 'Placa Wi-Fi', 'Fonte'], resp: 2 },
    { p: 'O que o botão "Minimizar" faz com uma janela?', opcoes: ['Fecha o programa', 'Reduz a janela para a barra de tarefas', 'Apaga o arquivo', 'Deixa a tela cheia'], resp: 1 },
    { p: 'O que é um "Site"?', opcoes: ['Página na internet', 'Peça do PC', 'Vírus', 'Antivírus'], resp: 0 },
    { p: 'Qual a utilidade do botão direito do mouse na maioria dos sistemas?', opcoes: ['Selecionar o texto', 'Abrir o menu de contexto (opções)', 'Desligar o PC', 'Abrir a internet'], resp: 1 },
    { p: 'Para que serve um "Roteador"?', opcoes: ['Criar imagens', 'Transmitir sinal de internet', 'Ler CDs', 'Salvar fotos'], resp: 1 },
    { p: 'O que significa "Upload"?', opcoes: ['Baixar arquivo', 'Enviar arquivo para a internet', 'Desligar', 'Atualizar a tela'], resp: 1 },
    { p: 'No WhatsApp, o que significa um visto (check) azul duplo?', opcoes: ['Mensagem enviada', 'Mensagem entregue', 'Mensagem lida', 'Mensagem apagada'], resp: 2 },
    { p: 'O que um "Monitor" de computador faz?', opcoes: ['Armazena dados', 'Processa dados', 'Exibe a imagem', 'Toca música'], resp: 2 },
    { p: 'O que é "Hardware"?', opcoes: ['Os programas do PC', 'A parte física do PC (peças)', 'Um vírus', 'O navegador web'], resp: 1 },
    { p: 'O que é "Software"?', opcoes: ['O teclado e mouse', 'A placa mãe', 'A parte lógica do PC', 'A tela do monitor'], resp: 2 }
  ],
  INTERMEDIARIO: [
    { p: 'Em banco de dados, o que significa SQL?', opcoes: ['System Query Logic', 'Structured Query Language', 'Simple Question Logic', 'Server Quality Language'], resp: 1 },
    { p: 'Qual dessas NÃO é uma linguagem de programação?', opcoes: ['Python', 'Java', 'HTML', 'C++'], resp: 2 },
    { p: 'O que é um IP (Internet Protocol)?', opcoes: ['Antivírus de rede', 'Velocidade da internet', 'Endereço único de um dispositivo na rede', 'Cabo do roteador'], resp: 2 },
    { p: 'Qual protocolo é usado para enviar e-mails?', opcoes: ['FTP', 'HTTP', 'SMTP', 'POP3'], resp: 2 },
    { p: 'Qual o comando Git para verificar o estado dos arquivos?', opcoes: ['git log', 'git status', 'git push', 'git branch'], resp: 1 },
    { p: 'No Linux, qual comando mostra o diretório atual em que você está?', opcoes: ['ls', 'cd', 'pwd', 'mkdir'], resp: 2 },
    { p: 'O que significa a sigla CSS?', opcoes: ['Cascading Style Sheets', 'Computer Style System', 'Creative Style Script', 'Control System Sheet'], resp: 0 },
    { p: 'Qual porta padrão do protocolo HTTP (não criptografado)?', opcoes: ['21', '22', '80', '443'], resp: 2 },
    { p: 'O que o comando "ping" avalia principalmente?', opcoes: ['Velocidade de download', 'Qualidade de vídeo', 'Latência e conectividade', 'Uso de CPU'], resp: 2 },
    { p: 'O que é uma chave primária (Primary Key) em um banco de dados?', opcoes: ['Senha de administrador', 'Identificador único de um registro', 'Chave de criptografia', 'Índice de busca'], resp: 1 },
    { p: 'No Git, como baixar as últimas atualizações do repositório remoto?', opcoes: ['git push', 'git pull', 'git commit', 'git add'], resp: 1 },
    { p: 'Qual protocolo traduz nomes (como google.com) para endereços IP?', opcoes: ['DHCP', 'FTP', 'DNS', 'HTTP'], resp: 2 },
    { p: 'Qual estrutura de dados funciona no princípio LIFO (Last In, First Out)?', opcoes: ['Fila', 'Pilha', 'Lista', 'Árvore'], resp: 1 },
    { p: 'O que o "localhost" ou IP 127.0.0.1 representa?', opcoes: ['O servidor do Google', 'O roteador', 'A própria máquina local', 'A nuvem'], resp: 2 },
    { p: 'Para que serve a tag <a> em HTML?', opcoes: ['Criar um artigo', 'Inserir uma âncora (link)', 'Tocar áudio', 'Deixar o texto azul'], resp: 1 },
    { p: 'Qual formato de dados é amplamente utilizado em respostas de APIs REST?', opcoes: ['XML', 'HTML', 'JSON', 'YAML'], resp: 2 },
    { p: 'Em redes, qual a função de um Firewall?', opcoes: ['Aumentar o sinal', 'Remover vírus', 'Filtrar tráfego baseado em segurança', 'Fazer backup'], resp: 2 },
    { p: 'Qual linguagem de programação usa indentação como sintaxe?', opcoes: ['Java', 'C++', 'Python', 'PHP'], resp: 2 },
    { p: 'O que é "Phishing"?', opcoes: ['Jogo online', 'Ataque focado em roubar credenciais via engano', 'Linguagem antiga', 'Modelo de roteador'], resp: 1 },
    { p: 'Qual comando Linux cria uma nova pasta?', opcoes: ['touch', 'rmdir', 'mkdir', 'cd'], resp: 2 },
    { p: 'Qual destes é um SGBD (Gerenciador de Banco de Dados)?', opcoes: ['Apache', 'Nginx', 'PostgreSQL', 'Node.js'], resp: 2 },
    { p: 'Para que serve a memória RAM do computador?', opcoes: ['Salvar dados permanentemente', 'Armazenar dados voláteis em uso ativo', 'Processar gráficos 3D', 'Resfriar a placa'], resp: 1 },
    { p: 'O que significa a sigla API?', opcoes: ['Application Programming Interface', 'Active Program Integration', 'Automated Process Interface', 'Apple Programming Interface'], resp: 0 },
    { p: 'Qual atalho salva as alterações e fecha o editor VIM?', opcoes: [':q', ':wq', ':x', ':save'], resp: 1 },
    { p: 'O que a sigla VPN significa?', opcoes: ['Visual Processing Network', 'Virtual Private Network', 'Very Private Node', 'Virtual Public Network'], resp: 1 },
    { p: 'Em JavaScript, como declarar uma variável que não pode ser reatribuída?', opcoes: ['let', 'var', 'const', 'static'], resp: 2 },
    { p: 'Qual a extensão de arquivo da linguagem TypeScript?', opcoes: ['.js', '.jsx', '.ts', '.tsx'], resp: 2 },
    { p: 'Qual tipo de banco de dados o MongoDB representa?', opcoes: ['Relacional (SQL)', 'Orientado a Documentos (NoSQL)', 'Orientado a Grafos', 'Chave-Valor'], resp: 1 },
    { p: 'O que significa o status HTTP 404?', opcoes: ['OK', 'Not Found (Não Encontrado)', 'Internal Server Error', 'Forbidden'], resp: 1 },
    { p: 'Qual empresa desenvolveu a linguagem Java?', opcoes: ['Microsoft', 'Apple', 'Sun Microsystems', 'Google'], resp: 2 },
    { p: 'No modelo OSI, em qual camada opera o Endereço MAC?', opcoes: ['Física', 'Enlace', 'Rede', 'Transporte'], resp: 1 },
    { p: 'O que é um arquivo ZIP?', opcoes: ['Formato de vídeo', 'Texto criptografado', 'Arquivo compactado', 'Executável'], resp: 2 },
    { p: 'Qual a função do protocolo DHCP?', opcoes: ['Traduzir domínios', 'Enviar emails', 'Atribuir endereços IP dinâmicos na rede', 'Criptografar senhas'], resp: 2 },
    { p: 'O que o comando "sudo" faz no Linux?', opcoes: ['Reinicia o PC', 'Roda comandos com privilégios de superusuário', 'Procura arquivos', 'Abre o terminal'], resp: 1 },
    { p: 'Qual destas portas é a padrão para conexão SSH?', opcoes: ['80', '443', '21', '22'], resp: 3 },
    { p: 'O que é o Bootstrap em desenvolvimento web?', opcoes: ['Banco de dados', 'Framework CSS', 'Linguagem back-end', 'Compilador'], resp: 1 },
    { p: 'O que significa a sigla "URL"?', opcoes: ['Uniform Resource Locator', 'Universal Routing Link', 'Unified Resource Logic', 'User Request Loop'], resp: 0 },
    { p: 'Qual linguagem é a principal base do desenvolvimento Android nativo?', opcoes: ['Swift', 'Objective-C', 'Kotlin', 'C#'], resp: 2 },
    { p: 'O que o conceito de "Open Source" garante?', opcoes: ['Que é de graça', 'Que qualquer um pode visualizar e modificar o código-fonte', 'Que não tem vírus', 'Que roda em Linux'], resp: 1 }
  ],
  AVANCADO: [
    { p: 'Em arquitetura de redes, em qual camada do Modelo OSI opera o roteador?', opcoes: ['Camada 2 (Enlace)', 'Camada 3 (Rede)', 'Camada 4 (Transporte)', 'Camada 7 (Aplicação)'], resp: 1 },
    { p: 'No Git, qual comando junta as alterações de uma branch na branch atual?', opcoes: ['git push', 'git merge', 'git commit', 'git pull'], resp: 1 },
    { p: 'O que caracteriza um ataque de "DDoS"?', opcoes: ['Roubo de senhas', 'Injeção SQL', 'Sobrecarga do servidor com múltiplos acessos', 'Vírus de resgate'], resp: 2 },
    { p: 'Qual a complexidade de tempo do caso médio no algoritmo QuickSort?', opcoes: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], resp: 1 },
    { p: 'Qual design pattern assegura que uma classe tenha apenas uma instância?', opcoes: ['Factory', 'Observer', 'Singleton', 'Decorator'], resp: 2 },
    { p: 'Qual protocolo de roteamento exterior é a base do roteamento na internet?', opcoes: ['OSPF', 'BGP', 'EIGRP', 'RIP'], resp: 1 },
    { p: 'No Linux, o que significa a permissão chmod 755?', opcoes: ['Total ao dono, leitura/execução aos demais', 'Total a todos', 'Apenas leitura para o dono', 'Execução para o grupo apenas'], resp: 0 },
    { p: 'O que é a propriedade "Atomicidade" nas transações ACID?', opcoes: ['Transação inteira ou não ocorre', 'Dados persistem após falha', 'Banco consistente', 'Isolamento de concorrência'], resp: 0 },
    { p: 'Qual o tamanho em bits de um endereço IPv6?', opcoes: ['32 bits', '64 bits', '128 bits', '256 bits'], resp: 2 },
    { p: 'O que é CORS em aplicações Web?', opcoes: ['Cross-Origin Resource Sharing', 'Cascading Origin Style', 'Centralized Object Repository', 'Control Of Remote Systems'], resp: 0 },
    { p: 'Qual componente do Kubernetes gerencia a escalabilidade dos Pods?', opcoes: ['Ingress', 'Service', 'ReplicaSet / Deployment', 'ConfigMap'], resp: 2 },
    { p: 'O que é Man-in-the-Middle (MitM)?', opcoes: ['Injetar SQL no banco', 'Derrubar o servidor', 'Interceptar comunicação entre duas partes sem que saibam', 'Adivinhar senhas'], resp: 2 },
    { p: 'O que significa Deadlock?', opcoes: ['Duas threads esperando uma pela outra infinitamente', 'Falta de memória', 'CPU travada', 'Banco de dados desligado'], resp: 0 },
    { p: 'Qual a porta padrão do RDP (Remote Desktop Protocol)?', opcoes: ['3389', '22', '443', '1433'], resp: 0 },
    { p: 'Em microsserviços, o que é um API Gateway?', opcoes: ['Um banco compartilhado', 'Um firewall', 'Ponto único que roteia requisições para os serviços', 'Load balancer L4'], resp: 2 },
    { p: 'O que é o estado "Zombie" em um processo Linux?', opcoes: ['Consumiu toda a RAM', 'Terminou a execução mas ainda tem entrada na tabela de processos', 'Vírus', 'Em background'], resp: 1 },
    { p: 'Qual a diferença entre Hash e Encriptação?', opcoes: ['Hash é lento', 'Encriptação é só texto', 'Hash é irreversível, Encriptação é reversível com a chave', 'Hash usa chaves públicas'], resp: 2 },
    { p: 'O que a cláusula UNION ALL faz no SQL?', opcoes: ['Junta resultados de dois SELECTs removendo duplicatas', 'Junta os resultados mantendo as duplicatas', 'Faz JOIN nas tabelas', 'Cria tabela nova'], resp: 1 },
    { p: 'O que é Buffer Overflow?', opcoes: ['Muitos pacotes ping', 'Escrever dados em um bloco além de sua capacidade, corrompendo áreas vizinhas', 'Pop-ups', 'Desbordamento de cache'], resp: 1 },
    { p: 'Diferença entre TCP e UDP?', opcoes: ['UDP texto, TCP vídeo', 'TCP é orientado a conexão e garante entrega; UDP envia datagramas sem garantia', 'TCP é mais rápido', 'UDP só em rede local'], resp: 1 },
    { p: 'Status HTTP 403 significa:', opcoes: ['Not Found', 'Internal Error', 'Forbidden (Acesso negado)', 'Unauthorized'], resp: 2 },
    { p: 'Qual o papel do Garbage Collector?', opcoes: ['Apagar arquivos temporários', 'Formatar código', 'Liberar memória de objetos sem referências ativas', 'Otimizar banco'], resp: 2 },
    { p: 'Inversão de Dependência (SOLID) prega que:', opcoes: ['Módulos de alto nível não dependam dos de baixo nível, ambos dependem de abstrações', 'Inverter ifs', 'Baixar libs', 'Classe depende de si'], resp: 0 },
    { p: 'O que é ataque XSS (Cross-Site Scripting)?', opcoes: ['DDoS pesado', 'Injetar scripts maliciosos em páginas vistas por outros usuários', 'Quebrar senhas', 'Ocultar IPs'], resp: 1 },
    { p: 'Comando Docker para listar todos os containers (rodando e parados)?', opcoes: ['docker ls', 'docker ps -a', 'docker containers --all', 'docker show'], resp: 1 },
    { p: 'Idempotência numa API REST garante que:', opcoes: ['Nunca falha', 'Exige autenticação', 'Repetir a requisição várias vezes tem o mesmo efeito no servidor', 'Só aceita JSON'], resp: 2 },
    { p: 'O que é "Pipeline hazard" num processador?', opcoes: ['Superaquecimento', 'Conflito na execução simultânea que atrasa o pipeline (stall)', 'Tela azul', 'Sem pasta térmica'], resp: 1 },
    { p: 'Qual a vantagem do GraphQL sobre REST?', opcoes: ['Menos CPU', 'O cliente pede os dados exatos, evitando under/over fetching', 'Mais fácil', 'Não usa HTTP'], resp: 1 },
    { p: 'O que é JWT?', opcoes: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Tool', 'Just Web Text'], resp: 1 },
    { p: 'O que caracteriza o gRPC?', opcoes: ['Baseado em XML', 'Lento', 'Usa HTTP/2 e Protobuf para alta performance', 'Só em Node'], resp: 2 },
    { p: 'Para que serve OAuth2?', opcoes: ['Criptografar', 'Delegação de autorização (ex: Logar com Google)', 'Comprimir', 'Roteamento'], resp: 1 },
    { p: 'O problema "N+1" em banco de dados ocorre quando:', opcoes: ['Faltam índices', 'O servidor cai', 'Fazemos 1 query principal e N queries adicionais em vez de um JOIN adequado', 'Tem mais conexões que o limite'], resp: 2 },
    { p: 'Qual o principal uso do Redis?', opcoes: ['Hospedar sites', 'Banco de dados em disco', 'Armazenamento em memória (Cache rápido)', 'Servidor DNS'], resp: 2 },
    { p: 'O que é um "Race Condition"?', opcoes: ['Um erro de compilação', 'Duas threads alterando o mesmo dado de forma não sincronizada', 'Problema na placa de rede', 'Ataque de negação'], resp: 1 },
    { p: 'Qual o tempo de complexidade (Big O) pior caso para uma Tabela Hash?', opcoes: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], resp: 1 },
    { p: 'Em criptografia, qual o propósito de um "Salt" ao aplicar hash de senhas?', opcoes: ['Acelerar o algoritmo', 'Defender contra ataques de dicionário e Rainbow Tables', 'Comprimir a senha', 'Validar com JWT'], resp: 1 },
    { p: 'O que é "Event Loop" no Node.js?', opcoes: ['Laço que trava o servidor', 'O mecanismo que permite operações I/O não bloqueantes', 'Loop for infinito', 'Módulo visual'], resp: 1 },
    { p: 'Qual a função de um Ingress Controller no Kubernetes?', opcoes: ['Criar Pods', 'Escalar nós físicos', 'Gerenciar o acesso externo aos serviços', 'Guardar credenciais'], resp: 2 },
    { p: 'O que é a vulnerabilidade CSRF?', opcoes: ['Falsificação de solicitação do servidor', 'Injeção SQL', 'Falsificação de solicitação entre sites (força ação indesejada)', 'Cross-Site Scripting'], resp: 2 },
    { p: 'Em redes IPv4, qual o propósito da Máscara de Sub-rede?', opcoes: ['Ocultar o IP', 'Dividir o endereço determinando a parte da rede e a parte do host', 'Filtrar vírus', 'Fazer NAT'], resp: 1 }
  ]
};

export default function QuizTech() {
  const { loggedUsers, endGame, activeDifficulty } = useAppStore();
  
  const questions = useMemo(() => {
    const nivel = activeDifficulty || 'INICIANTE';
    const safeNivel = (nivel === 'ARCADE' ? 'INTERMEDIARIO' : nivel) as keyof typeof BANCO_QUIZ;
return [...BANCO_QUIZ[safeNivel]].sort(() => Math.random() - 0.5).slice(0, 7);
  }, [activeDifficulty]);

  const [currentQ, setCurrentQ] = useState(0);
  const [turn, setTurn] = useState(0); 
  const [scores, setScores] = useState<number[]>(Array(loggedUsers.length).fill(0));
  
  const [feedback, setFeedback] = useState<{ acertou: boolean; respCorreta: string } | null>(null);

  const currentPlayer = loggedUsers[turn];

  const handleAnswer = (selectedIndex: number) => {
    if (feedback) return; 

    const isCorrect = selectedIndex === questions[currentQ].resp;
    if (isCorrect) playSuccess();
    else playError();

    const correctAnswerText = questions[currentQ].opcoes[questions[currentQ].resp];
    setFeedback({ acertou: isCorrect, respCorreta: correctAnswerText });

    if (isCorrect) {
      const newScores = [...scores];
      newScores[turn] += 1;
      setScores(newScores);
    }

    setTimeout(() => {
      setFeedback(null);
      const nextTurn = (turn + 1) % loggedUsers.length;
      
      if (nextTurn === 0) {
        if (currentQ + 1 < questions.length) {
          setCurrentQ(q => q + 1);
        } else {
          finishGame(scores, isCorrect ? scores[turn] + 1 : scores[turn], turn);
          return;
        }
      }
      setTurn(nextTurn);
    }, 2000);
  };

  const finishGame = (finalScores: number[], lastPlayerScore: number, lastTurn: number) => {
    const calcScores = [...finalScores];
    calcScores[lastTurn] = lastPlayerScore;

    const maxPts = MAX_SCORES['quiz-tech'][activeDifficulty || 'INICIANTE'];
    
    const pontosDistribuiveis = calcScores.map(score => Math.round((score / questions.length) * maxPts));
    endGame(pontosDistribuiveis);
  };

  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl p-8 relative">
      
      <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-700 px-8 py-3 rounded-full text-xl font-bold shadow-xl z-50 flex items-center gap-6">
        {loggedUsers.map((user, idx) => (
          <div key={user.id} className={`flex items-center gap-2 transition-all ${turn === idx ? 'text-cyan-400 scale-110 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'text-slate-500'}`}>
            <span>{user.name.split(' ')[0]}</span>
            <span className="bg-slate-700 text-white text-sm px-3 py-1 rounded-full">{scores[idx]}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 p-10 md:p-14 rounded-[3rem] border-2 border-slate-700 shadow-2xl w-full text-center relative overflow-hidden transition-all duration-300">
        
        <div className="absolute top-0 left-0 h-2 bg-cyan-500 transition-all duration-500" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />

        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-700/50 p-4 rounded-full mb-4">
            <Brain size={48} className="text-cyan-400" />
          </div>
          <p className="text-cyan-400 font-bold tracking-widest uppercase mb-2">
            Pergunta {currentQ + 1} de {questions.length}
          </p>
          <h2 className="text-3xl font-black text-white px-8">
            <span className="text-slate-400 text-2xl mr-2">Sua vez, {currentPlayer.name}:</span>
          </h2>
        </div>

        {feedback ? (
          <div className="animate-in zoom-in duration-300 flex flex-col items-center py-10">
            {feedback.acertou ? (
              <CheckCircle2 size={100} className="text-emerald-400 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
            ) : (
              <XCircle size={100} className="text-rose-500 mb-6 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]" />
            )}
            <h2 className={`text-5xl font-black mb-4 ${feedback.acertou ? 'text-emerald-400' : 'text-rose-400'}`}>
              {feedback.acertou ? 'RESPOSTA CERTA!' : 'RESPOSTA ERRADA!'}
            </h2>
            {!feedback.acertou && (
              <p className="text-2xl text-slate-300 bg-slate-700 px-6 py-3 rounded-2xl border border-slate-600 mt-4">
                A resposta era: <strong className="text-white">{feedback.respCorreta}</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-4xl font-bold text-white mb-12 leading-relaxed min-h-[100px] flex items-center justify-center">
              {questions[currentQ].p}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentQ].opcoes.map((opcao, index) => (
                <button 
                  key={index}
                  onClick={() => { playClick(); handleAnswer(index); }}
                  className="flex items-center justify-center p-6 bg-slate-700/50 hover:bg-slate-700 text-slate-200 border-2 border-slate-600 hover:border-cyan-500 rounded-2xl text-2xl font-bold transition-all active:scale-95 text-center min-h-[100px]"
                >
                  {opcao}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}