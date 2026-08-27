import { useState, useEffect } from 'react';
import { useAppStore } from '../core/store';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface Pergunta { texto: string; resposta: boolean; curiosidade: string; }

// ==========================================
// O MEGA BANCO DE PERGUNTAS DE TECNOLOGIA
// ==========================================
const BANCO_DE_PERGUNTAS: Record<string, Pergunta[]> = {
  INICIANTE: [
    { texto: 'Mouses de computador costumavam ter uma bola pesada dentro para funcionar.', resposta: true, curiosidade: 'Verdade! Antes dos sensores ópticos modernos, a bolinha rolava e movia rodinhas internas para detectar a direção.' },
    { texto: 'O Wi-Fi utiliza cabos de fibra invisíveis para conectar a internet.', resposta: false, curiosidade: 'Mito! O Wi-Fi utiliza ondas de rádio invisíveis, e não cabos, para transmitir os dados pelo ar.' },
    { texto: 'Deixar o celular carregando a noite toda vai "viciar" a bateria moderna.', resposta: false, curiosidade: 'Mito! Baterias modernas de Lítio possuem circuitos que cortam a energia ao atingir 100%, impedindo sobrecarga.' },
    { texto: 'A "nuvem" (Cloud) na verdade são computadores e servidores reais espalhados pelo mundo.', resposta: true, curiosidade: 'Verdade! Suas fotos não estão no céu, mas sim salvas em supercomputadores gigantescos.' },
    { texto: 'O atalho Ctrl + C é usado para copiar e Ctrl + V para colar.', resposta: true, curiosidade: 'Verdade! Criado na década de 1970, este é o atalho mais utilizado na história da computação.' },
    { texto: 'Você pode baixar mais memória RAM pela internet para deixar o PC mais rápido.', resposta: false, curiosidade: 'Mito clássico! A memória RAM é uma peça física de hardware e não pode ser baixada por download.' },
    { texto: 'O teclado QWERTY foi inventado para facilitar a digitação rápida em celulares.', resposta: false, curiosidade: 'Mito! Ele foi criado no século 19 para máquinas de escrever para afastar as hastes que costumavam travar.' },
    { texto: 'Reiniciar o computador pode realmente resolver muitos problemas temporários.', resposta: true, curiosidade: 'Verdade! Reiniciar limpa a memória RAM e encerra processos travados no sistema.' },
    { texto: 'Disquetes antigos tinham menos armazenamento do que uma única foto de celular atual.', resposta: true, curiosidade: 'Verdade! Um disquete padrão armazenava apenas 1.44 MB.' },
    { texto: 'Bill Gates foi o inventor do primeiro iPhone.', resposta: false, curiosidade: 'Mito! O iPhone foi criado pela Apple sob a liderança de Steve Jobs. Bill Gates fundou a Microsoft.' },
    { texto: 'O Instagram é considerado um Sistema Operacional (OS).', resposta: false, curiosidade: 'Mito! O Instagram é um aplicativo. Windows, Android e iOS que são Sistemas Operacionais.' },
    { texto: 'O modo "Navegação Anônima" impede que o provedor de internet veja seus acessos.', resposta: false, curiosidade: 'Mito! O modo anônimo não salva histórico no SEU PC, mas seu provedor (ou chefe) ainda pode ver.' },
    { texto: 'O primeiro logotipo da Apple tinha Isaac Newton debaixo de uma macieira.', resposta: true, curiosidade: 'Verdade! Criado em 1976, era um desenho super detalhado que logo foi trocado pela maçã mordida.' },
    { texto: 'As teclas F e J do teclado têm um pequeno ressalto para pessoas cegas lerem em braille.', resposta: false, curiosidade: 'Mito! O ressalto serve como guia de posicionamento rápido dos dedos para quem digita sem olhar.' },
    { texto: 'Ter um antivírus protege seu computador 100% de qualquer ameaça possível.', resposta: false, curiosidade: 'Mito! Nenhum software garante proteção total contra novos ataques (Zero-Day) ou engenharia social.' }
  ],
  INTERMEDIARIO: [
    { texto: 'O primeiro "bug" da história foi causado por um inseto real em um computador.', resposta: true, curiosidade: 'Verdade! Em 1947, a equipe de Grace Hopper encontrou uma mariposa presa num relé do Mark II.' },
    { texto: 'HTML é considerado uma linguagem de programação estruturada com if e else.', resposta: false, curiosidade: 'Mito! HTML é apenas uma linguagem de marcação estrutural, não possui lógica de programação.' },
    { texto: 'O sistema Linux possui um pinguim como mascote oficial, chamado Tux.', resposta: true, curiosidade: 'Verdade! Linus Torvalds escolheu o pinguim após ser "mordido" por um durante uma visita ao zoológico.' },
    { texto: 'Java e JavaScript possuem o mesmo motor e foram feitas pela mesma empresa.', resposta: false, curiosidade: 'Mito! Não têm relação técnica. O nome JavaScript foi apenas uma jogada de marketing nos anos 90.' },
    { texto: 'Os endereços IP versão 4 (IPv4) já se esgotaram mundialmente.', resposta: true, curiosidade: 'Verdade! O limite de ~4.3 bilhões de IPs se esgotou, forçando a adoção lenta do padrão IPv6.' },
    { texto: 'O protocolo HTTP criptografa os dados e é 100% seguro para senhas.', resposta: false, curiosidade: 'Mito! O protocolo seguro que criptografa os dados é o HTTPS (com o S de Secure no final).' },
    { texto: 'O Bluetooth recebeu esse nome em homenagem a um rei dinamarquês.', resposta: true, curiosidade: 'Verdade! Harald "Bluetooth" Gormsson, famoso por unificar a Escandinávia no século X.' },
    { texto: 'Apagar um arquivo da lixeira destrói os dados imediatamente no HD.', resposta: false, curiosidade: 'Mito! O sistema apenas "esquece" onde o arquivo está, liberando espaço. Programas forenses podem recuperá-lo.' },
    { texto: 'Cabos de fibra óptica transmitem dados usando pulsos de luz.', resposta: true, curiosidade: 'Verdade! Ao invés de sinais elétricos, as fibras ópticas usam lasers ou LEDs, alcançando velocidades incríveis.' },
    { texto: 'A "Deep Web" é a parte da internet exclusiva para atividades criminosas.', resposta: false, curiosidade: 'Mito! A Deep Web é qualquer parte da internet não indexada pelo Google (como seu painel de banco).' },
    { texto: 'A linguagem Python recebeu esse nome em homenagem a uma espécie de cobra.', resposta: false, curiosidade: 'Mito! Guido van Rossum escolheu o nome em homenagem ao grupo de humor britânico Monty Python.' },
    { texto: 'Um "Byte" geralmente é composto por 8 "Bits".', resposta: true, curiosidade: 'Verdade! O byte é a unidade básica de armazenamento na maioria das arquiteturas modernas.' },
    { texto: 'SSDs são mais rápidos que HDDs porque usam discos magnéticos muito mais leves.', resposta: false, curiosidade: 'Mito! SSDs não possuem discos ou partes móveis. Eles usam chips de memória flash (parecido com pendrives).' },
    { texto: 'O primeiro domínio (site) registrado comercialmente na internet foi o symbolics.com.', resposta: true, curiosidade: 'Verdade! Foi registrado em março de 1985 e ainda está no ar hoje.' },
    { texto: 'A tela azul da morte (BSOD) foi inventada no Windows 10.', resposta: false, curiosidade: 'Mito! A BSOD aterroriza usuários desde as primeiras versões gráficas do Windows, como o Windows 3.1.' }
  ],
  AVANCADO: [
    { texto: 'O Teorema CAP afirma que um sistema distribuído pode ter Consistência, Disponibilidade e Tolerância à Partição simultaneamente.', resposta: false, curiosidade: 'Mito! O Teorema prova que é impossível garantir os três ao mesmo tempo, apenas dois simultaneamente.' },
    { texto: 'No React, o hook "useEffect" é executado de forma síncrona logo após a renderização.', resposta: false, curiosidade: 'Mito! O useEffect é assíncrono. O hook síncrono é o useLayoutEffect.' },
    { texto: 'O algoritmo QuickSort possui complexidade de tempo de pior caso de O(n²).', resposta: true, curiosidade: 'Verdade! Embora seu caso médio seja O(n log n), se o pivô for mal escolhido, o pior caso é O(n²).' },
    { texto: 'Em JavaScript puro, avaliar `typeof null` retorna "null".', resposta: false, curiosidade: 'Mito! Retorna "object". Esse é um dos bugs originais mais famosos e antigos do JavaScript que nunca foi corrigido.' },
    { texto: 'O Docker não é uma máquina virtual completa porque ele compartilha o kernel do sistema operacional host.', resposta: true, curiosidade: 'Verdade! Diferente das VMs que emulam hardware e OS inteiros, containers isolam apenas processos.' },
    { texto: 'O protocolo TCP garante a entrega dos pacotes na ordem correta, ao contrário do UDP.', resposta: true, curiosidade: 'Verdade! O TCP faz handshake e retransmissão, sendo confiável. O UDP atira os pacotes sem garantia (usado em jogos/vídeos).' },
    { texto: 'No Git, o comando "git rebase" reescreve a história dos commits.', resposta: true, curiosidade: 'Verdade! Ele move a base do branch atual para outra, criando novos hashes e alterando a linha do tempo.' },
    { texto: 'Ataques de SQL Injection podem ser totalmente evitados usando concatenação simples de strings no banco.', resposta: false, curiosidade: 'Mito! É exatamente a concatenação simples que permite o SQL Injection. Deve-se usar Prepared Statements.' },
    { texto: 'No CSS, a unidade "vw" significa viewport width, onde 100vw equivale a 100% da largura da tela visível.', resposta: true, curiosidade: 'Verdade! Muito útil para criar tipografias e layouts fluidos totalmente responsivos.' },
    { texto: 'O Garbage Collector na JVM (Java) garante 100% de prevenção contra memory leaks (vazamentos).', resposta: false, curiosidade: 'Mito! Se você esquecer referências fortes para objetos não utilizados em uma Lista, o GC não poderá limpá-los.' },
    { texto: 'Em arquitetura de Microserviços, o padrão "Saga" é utilizado para gerenciar transações distribuídas.', resposta: true, curiosidade: 'Verdade! Ele divide a transação global em transações locais, com mecanismos de compensação (rollback).' },
    { texto: 'O Modelo OSI de redes é composto por exatamente 5 camadas.', resposta: false, curiosidade: 'Mito! O modelo OSI clássico possui 7 camadas. O modelo TCP/IP é que possui menos (4 ou 5 dependendo da literatura).' },
    { texto: 'Em Criptografia, o algoritmo RSA é classificado como um sistema de chave assimétrica.', resposta: true, curiosidade: 'Verdade! Ele usa uma chave pública para encriptar e uma chave privada totalmente diferente para decriptar.' },
    { texto: 'O Redis é um banco de dados relacional (SQL) projetado para trabalhar no disco rígido.', resposta: false, curiosidade: 'Mito! O Redis é NoSQL, chave-valor e trabalha prioritariamente em Memória RAM para ultra performance.' },
    { texto: 'Em redes, o protocolo ARP tem a função de mapear um endereço IP para um endereço MAC físico.', resposta: true, curiosidade: 'Verdade! Ele traduz o endereço lógico da rede para o endereço físico da placa de rede real no switch.' }
  ]
};

export default function VerdadeMito() {
  const { activeDifficulty, endGame } = useAppStore();
  
  const [questoes, setQuestoes] = useState<Pergunta[]>([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [feedback, setFeedback] = useState<{ texto: string, acertou: boolean } | null>(null);

  // Inicializa o jogo sorteando exatamente 10 perguntas do banco baseado na dificuldade da aba
  useEffect(() => {
    const nivel = activeDifficulty || 'INICIANTE'; // fallback de segurança
    const bancoDaDificuldade = BANCO_DE_PERGUNTAS[nivel] || BANCO_DE_PERGUNTAS.INICIANTE;
    
    // Embaralha o array e corta os 10 primeiros
    const embaralhadas = [...bancoDaDificuldade]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
      
    setQuestoes(embaralhadas);
  }, [activeDifficulty]);

  const responder = (escolha: boolean) => {
    const pergunta = questoes[perguntaAtual];
    const acertou = escolha === pergunta.resposta;
    
    if (acertou) setPontos(prev => prev + 20);
    setFeedback({ texto: pergunta.curiosidade, acertou });
  };

  const proximaPergunta = () => {
    setFeedback(null);
    if (perguntaAtual + 1 < questoes.length) {
      setPerguntaAtual((p) => p + 1);
    } else {
      // CORREÇÃO: Enviando apenas o número de pontos conquistados nesta partida
      endGame([pontos]);
    }
  };

  if (questoes.length === 0) return null; // Aguardando carregar

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl p-8 relative">
      
      {/* Placar Realocado: Centralizado no Topo (Foge da logo na direita e do Voltar na esquerda) */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-700 px-10 py-3 rounded-full text-2xl font-bold text-cyan-400 shadow-xl z-50">
        Pontos: {pontos}
      </div>

      <div className="bg-slate-800 p-12 rounded-[3rem] border-2 border-slate-700 shadow-2xl w-full text-center relative overflow-hidden transition-all duration-300">
        
        {/* Barra de Progresso */}
        <div className="absolute top-0 left-0 h-2 bg-cyan-500 transition-all duration-500" style={{ width: `${((perguntaAtual + 1) / questoes.length) * 100}%` }} />

        <p className="text-cyan-500 font-bold tracking-widest uppercase mb-6">
          Pergunta {perguntaAtual + 1} de {questoes.length}
        </p>

        {feedback ? (
          <div className="animate-in zoom-in duration-300 flex flex-col items-center">
            <h2 className={`text-5xl font-black mb-6 ${feedback.acertou ? 'text-emerald-400' : 'text-red-400'}`}>
              {feedback.acertou ? 'CERTO!' : 'ERRADO!'}
            </h2>
            <p className="text-2xl text-slate-300 leading-relaxed mb-12">{feedback.texto}</p>
            
            {/* Controle de Avanço Manual */}
            <button
               onClick={proximaPergunta}
               className="flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl text-2xl font-bold transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95"
            >
               {perguntaAtual + 1 < questoes.length ? 'Avançar para Próxima' : 'Finalizar Jogo'}
               <ArrowRight size={28} />
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-4xl font-bold text-white mb-16 leading-relaxed">
              {questoes[perguntaAtual].texto}
            </h2>
            
            <div className="flex gap-6 justify-center">
              <button 
                onClick={() => responder(true)}
                className="flex-1 flex items-center justify-center gap-3 py-6 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 rounded-2xl text-3xl font-bold transition-all active:scale-95"
              >
                <CheckCircle2 size={32} /> Verdade
              </button>
              
              <button 
                onClick={() => responder(false)}
                className="flex-1 flex items-center justify-center gap-3 py-6 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-2 border-red-500/50 rounded-2xl text-3xl font-bold transition-all active:scale-95"
              >
                <XCircle size={32} /> Mito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}