export type DifficultyLevel = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'ARCADE';

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  categories: DifficultyLevel[];
  minPlayers: number;
  maxPlayers: number;
  icon: string;
}

export const GAME_REGISTRY: GameDefinition[] = [
  // ==========================================
  // JOGOS MULTI-DIFICULDADE
  // ==========================================
  { id: 'verdade-mito', title: 'Verdade ou Mito', description: 'Mitos e verdades sobre o mundo da tecnologia.', categories: ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO'], minPlayers: 1, maxPlayers: 1, icon: '🤔' },
  { id: 'quiz-tech', title: 'Quiz de Tecnologia', description: 'Teste seus conhecimentos gerais e específicos em TI.', categories: ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO'], minPlayers: 1, maxPlayers: 1, icon: '💡' },
  { id: 'forca', title: 'Forca Tech', description: 'Descubra a palavra antes de ser enforcado.', categories: ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO'], minPlayers: 1, maxPlayers: 1, icon: '🎯' },

  // ==========================================
  // EXCLUSIVOS: INICIANTE
  // ==========================================
  { id: 'clique-na-cor', title: 'Toque na Cor', description: 'Toque na cor da fonte, não na palavra que está escrita!', categories: ['INICIANTE'], minPlayers: 1, maxPlayers: 1, icon: '🎨' },
  { id: 'memoria', title: 'Jogo da Memória', description: 'Encontre os pares de tecnologias e frameworks.', categories: ['INICIANTE'], minPlayers: 1, maxPlayers: 2, icon: '🧠' },

  // ==========================================
  // EXCLUSIVOS: INTERMEDIÁRIO
  // ==========================================
  { id: 'decodificador', title: 'Decodificador', description: 'Decifre a sequência criptografada oculta.', categories: ['INTERMEDIARIO'], minPlayers: 1, maxPlayers: 1, icon: '🔐' },
  { id: 'code-breaker', title: 'Code Breaker', description: 'Versão clássica do Mastermind. Quebre a senha.', categories: ['INTERMEDIARIO'], minPlayers: 1, maxPlayers: 1, icon: '🧩' },
  { id: 'tech-wordle', title: 'Tech Wordle', description: 'Descubra a palavra tech de 5 letras.', categories: ['INTERMEDIARIO'], minPlayers: 1, maxPlayers: 1, icon: '⌨️' },

  // ==========================================
  // EXCLUSIVOS: AVANÇADO
  // ==========================================
  { id: 'desafio-60-segundos', title: 'Desafio 60 Segundos', description: 'Quantas questões matemáticas e lógicas você resolve em 1 minuto?', categories: ['AVANCADO'], minPlayers: 1, maxPlayers: 1, icon: '⏱️' },
  { id: 'identifique-linguagem', title: 'Qual a Linguagem?', description: 'Analise o snippet e acerte a linguagem de programação.', categories: ['AVANCADO'], minPlayers: 1, maxPlayers: 1, icon: '💻' },
  { id: 'corrija-codigo', title: 'Corrija o Código', description: 'Encontre e corrija o bug proposital no script.', categories: ['AVANCADO'], minPlayers: 1, maxPlayers: 1, icon: '🐛' },
  { id: 'code-breaker-adv', title: 'Code Breaker Pro', description: 'Mastermind com nível de dificuldade extremo.', categories: ['AVANCADO'], minPlayers: 1, maxPlayers: 1, icon: '🤯' },

  // ==========================================
  // ARCADE (Jogos rápidos, casuais e multiplayer)
  // ==========================================
  { id: 'pixel-guess', title: 'Adivinhe a Imagem', description: 'Identifique o hardware ou logo antes que fique nítido.', categories: ['ARCADE'], minPlayers: 1, maxPlayers: 1, icon: '🔍' },
  { id: 'batalha-naval', title: 'Batalha Naval', description: 'Para 2 Jogadores. Afunde os servidores inimigos na rede.', categories: ['ARCADE'], minPlayers: 2, maxPlayers: 2, icon: '🚢' },
  { id: 'velha', title: 'Jogo da Velha', description: 'Para até 2 Jogadores. O clássico jogo da velha com temática tech.', categories: ['ARCADE'], minPlayers: 1, maxPlayers: 2, icon: '✖️' },
  { id: 'adivinhe-musica', title: 'Qual é a Música?', description: 'Adivinhe a música ouvindo apenas alguns segundos.', categories: ['ARCADE'], minPlayers: 1, maxPlayers: 1, icon: '🎵' },
  { id: 'flappy-bug', title: 'Flappy Bug', description: 'Desvie dos obstáculos de código.', categories: ['ARCADE'], minPlayers: 1, maxPlayers: 1, icon: '👾' },
  { id: 'quebra-tijolos', title: 'Quebra-Tijolos', description: 'Destrua os blocos na versão Fast.', categories: ['ARCADE'], minPlayers: 1, maxPlayers: 1, icon: '🧱' },
  { id: 'tech-surfers', title: 'Tech Surfers', description: 'Corra e desvie dos firewalls.', categories: ['ARCADE'], minPlayers: 1, maxPlayers: 1, icon: '🏃' },
  { id: 'leilao-futebol', title: 'Leilão: O Draft', description: 'Monte seu time dos sonhos disputando jogador a jogador no leilão!', categories: ['ARCADE'], minPlayers: 2, maxPlayers: 2, icon: '⚽' },
];

export const MAX_SCORES: Record<string, any> = {
  // ==========================================
  // JOGOS MULTI-DIFICULDADE
  // ==========================================
  'verdade-mito': { INICIANTE: 100, INTERMEDIARIO: 200, AVANCADO: 300 },
  'quiz-tech': { INICIANTE: 100, INTERMEDIARIO: 200, AVANCADO: 300 },
  'forca': { INICIANTE: 100, INTERMEDIARIO: 200, AVANCADO: 300 },

  // ==========================================
  // EXCLUSIVOS: INICIANTE
  // ==========================================
  'clique-na-cor': { INICIANTE: 100 },
  'memoria': { INICIANTE: 100 },

  // ==========================================
  // EXCLUSIVOS: INTERMEDIÁRIO
  // ==========================================
  'decodificador': { INTERMEDIARIO: 200 },
  'code-breaker': { INTERMEDIARIO: 200 },
  'tech-wordle': { INTERMEDIARIO: 200 },

  // ==========================================
  // EXCLUSIVOS: AVANÇADO
  // ==========================================
  'desafio-60-segundos': { AVANCADO: 300 },
  'identifique-linguagem': { AVANCADO: 300 },
  'corrija-codigo': { AVANCADO: 300 },
  'code-breaker-adv': { AVANCADO: 300 },

  // ==========================================
  // ARCADE
  // ==========================================
  'pixel-guess': { ARCADE: 80 },
  'batalha-naval': { ARCADE: 80 },
  'velha': { ARCADE: 80 },
  'adivinhe-musica': { ARCADE: 150 },
  'flappy-bug': { ARCADE: 80 },
  'quebra-tijolos': { ARCADE: 80 },
  'tech-surfers': { ARCADE: 80 },
  'leilao-futebol': { ARCADE: 80 },
};