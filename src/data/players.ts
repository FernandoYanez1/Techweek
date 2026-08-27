export interface PlayerDef {
  id: string;
  name: string;
  team: string;
  pos: 'GOL' | 'LD' | 'ZAG' | 'LE' | 'VOL' | 'MEI' | 'PE' | 'CA' | 'PD';
  ovr: number;
  photo?: string;
  isLegend?: boolean;
}

export const PLAYER_DATABASE: PlayerDef[] = [

  // ==========================================
  // GOLEIROS
  // ==========================================

  { id: 'G1', name: 'Courtois', team: 'Real Madrid', pos: 'GOL', ovr: 90 },
  { id: 'G2', name: 'Alisson', team: 'Liverpool', pos: 'GOL', ovr: 89 },
  { id: 'G3', name: 'Oblak', team: 'Atlético de Madrid', pos: 'GOL', ovr: 87 },
  { id: 'G4', name: 'Donnarumma', team: 'Manchester City', pos: 'GOL', ovr: 88 },
  { id: 'G5', name: 'Neuer', team: 'Bayern', pos: 'GOL', ovr: 88 },
  { id: 'G6', name: 'Ederson', team: 'Fenerbahçe', pos: 'GOL', ovr: 87 },
  { id: 'G7', name: 'Emiliano Martínez', team: 'Aston Villa', pos: 'GOL', ovr: 86 },
  { id: 'G8', name: 'Ter Stegen', team: 'Barcelona', pos: 'GOL', ovr: 86 },
  { id: 'G9', name: 'Maignan', team: 'Milan', pos: 'GOL', ovr: 86 },
  { id: 'G10', name: 'Diogo Costa', team: 'Porto', pos: 'GOL', ovr: 85 },
  { id: 'G11', name: 'Léo Jardim', team: 'Vasco da Gama', pos: 'GOL', ovr: 82 },
  { id: 'G12', name: 'Raya', team: 'Arsenal', pos: 'GOL', ovr: 83 },
  { id: 'G13', name: 'Sommer', team: 'Inter', pos: 'GOL', ovr: 84 },
  { id: 'G14', name: 'Onana', team: 'Manchester United', pos: 'GOL', ovr: 83 },
  { id: 'G15', name: 'Unai Simón', team: 'Athletic Bilbao', pos: 'GOL', ovr: 83 },
  { id: 'G16', name: 'Mamardashvili', team: 'Liverpool', pos: 'GOL', ovr: 83 },
  { id: 'G17', name: 'Kobel', team: 'Borussia Dortmund', pos: 'GOL', ovr: 83 },
  { id: 'G20', name: 'Rui Patrício', team: 'Atalanta', pos: 'GOL', ovr: 80 },
  { id: 'G21', name: 'Weverton', team: 'Palmeiras', pos: 'GOL', ovr: 81 },
  { id: 'G22', name: 'Bento', team: 'Al-Nassr', pos: 'GOL', ovr: 80 },
  { id: 'G23', name: 'Everson', team: 'Atlético-MG', pos: 'GOL', ovr: 79 },
  { id: 'G24', name: 'Hugo Souza', team: 'Corinthians', pos: 'GOL', ovr: 78 },
  { id: 'G25', name: 'Fábio', team: 'Fluminense', pos: 'GOL', ovr: 79 },


  // ==========================================
  // LATERAIS DIREITOS
  // ==========================================

  { id: 'LD1', name: 'Hakimi', team: 'PSG', pos: 'LD', ovr: 91 },
  { id: 'LD2', name: 'Alexander-Arnold', team: 'Real Madrid', pos: 'LD', ovr: 87 },
  { id: 'LD3', name: 'Carvajal', team: 'Real Madrid', pos: 'LD', ovr: 86 },
  { id: 'LD4', name: 'Kyle Walker', team: 'Burnley', pos: 'LD', ovr: 84 },
  { id: 'LD5', name: 'Dumfries', team: 'Real Madrid', pos: 'LD', ovr: 85 },
  { id: 'LD6', name: 'Frimpong', team: 'Liverpool', pos: 'LD', ovr: 84 },
  { id: 'LD7', name: 'Reece James', team: 'Chelsea', pos: 'LD', ovr: 83 },
  { id: 'LD8', name: 'Di Lorenzo', team: 'Napoli', pos: 'LD', ovr: 83 },
  { id: 'LD9', name: 'Pedro Porro', team: 'Tottenham', pos: 'LD', ovr: 85 },
  { id: 'LD10', name: 'Ben White', team: 'Arsenal', pos: 'LD', ovr: 82 },
  { id: 'LD11', name: 'Pavard', team: 'Inter', pos: 'LD', ovr: 82 },
  { id: 'LD12', name: 'Vanderson', team: 'Monaco', pos: 'LD', ovr: 81 },
  { id: 'LD13', name: 'Yan Couto', team: 'Borussia Dortmund', pos: 'LD', ovr: 81 },
  { id: 'LD14', name: 'Nahuel Molina', team: 'Atlético de Madrid', pos: 'LD', ovr: 82 },
  { id: 'LD15', name: 'João Cancelo', team: 'Al-Hilal', pos: 'LD', ovr: 81 },
  { id: 'LD17', name: 'Wesley', team: 'Roma', pos: 'LD', ovr: 82 },
  { id: 'LD18', name: 'Paulo Henrique', team: 'Vasco da Gama', pos: 'LD', ovr: 80 },
  { id: 'LD20', name: 'Mariano', team: 'Atlético-MG', pos: 'LD', ovr: 77 },
  { id: 'LD21', name: 'Samuel Xavier', team: 'Fluminense', pos: 'LD', ovr: 77 },
  { id: 'LD22', name: 'Fagner', team: 'Cruzeiro', pos: 'LD', ovr: 77 },
  { id: 'LD23', name: 'Mayke', team: 'Palmeiras', pos: 'LD', ovr: 77 },
  { id: 'LD24', name: 'Khellven', team: 'CSKA Moscou', pos: 'LD', ovr: 76 },
  { id: 'LD25', name: 'Gilberto', team: 'Bahia', pos: 'LD', ovr: 76 },


  // ==========================================
  // ZAGUEIROS
  // ==========================================

  { id: 'Z1', name: 'Van Dijk', team: 'Liverpool', pos: 'ZAG', ovr: 89 },
  { id: 'Z2', name: 'Saliba', team: 'Arsenal', pos: 'ZAG', ovr: 90 },
  { id: 'Z3', name: 'Rúben Dias', team: 'Manchester City', pos: 'ZAG', ovr: 87 },
  { id: 'Z4', name: 'Marquinhos', team: 'PSG', pos: 'ZAG', ovr: 87 },
  { id: 'Z5', name: 'Araújo', team: 'Barcelona', pos: 'ZAG', ovr: 85 },
  { id: 'Z6', name: 'Militão', team: 'Real Madrid', pos: 'ZAG', ovr: 86 },
  { id: 'Z8', name: 'Bastoni', team: 'Inter', pos: 'ZAG', ovr: 86 },
  { id: 'Z9', name: 'Gabriel Magalhães', team: 'Arsenal', pos: 'ZAG', ovr: 90 },
  { id: 'Z11', name: 'Konaté', team: 'Liverpool', pos: 'ZAG', ovr: 84 },
  { id: 'Z12', name: 'Gvardiol', team: 'Manchester City', pos: 'ZAG', ovr: 84 },
  { id: 'Z13', name: 'De Ligt', team: 'Manchester United', pos: 'ZAG', ovr: 84 },
  { id: 'Z14', name: 'Pau Torres', team: 'Aston Villa', pos: 'ZAG', ovr: 84 },
  { id: 'Z15', name: 'Romero', team: 'Tottenham', pos: 'ZAG', ovr: 83 },
  { id: 'Z16', name: 'Kim Min-jae', team: 'Bayern', pos: 'ZAG', ovr: 82 },
  { id: 'Z17', name: 'Bremer', team: 'Juventus', pos: 'ZAG', ovr: 83 },
  { id: 'Z18', name: 'Murillo', team: 'Nottingham Forest', pos: 'ZAG', ovr: 81 },
  { id: 'Z19', name: 'Beraldo', team: 'PSG', pos: 'ZAG', ovr: 80 },
  { id: 'Z21', name: 'Carlos Cuesta', team: 'Vasco da Gama', pos: 'ZAG', ovr: 80 },
  { id: 'Z24', name: 'Fabrício Bruno', team: 'Cruzeiro', pos: 'ZAG', ovr: 79 },
  { id: 'Z25', name: 'Murilo', team: 'Palmeiras', pos: 'ZAG', ovr: 79 },


  // ==========================================
  // LATERAIS ESQUERDOS
  // ==========================================

  { id: 'LE1', name: 'Alphonso Davies', team: 'Bayern', pos: 'LE', ovr: 88 },
  { id: 'LE2', name: 'Theo Hernández', team: 'Al-Hilal', pos: 'LE', ovr: 87 },
  { id: 'LE3', name: 'Nuno Mendes', team: 'PSG', pos: 'LE', ovr: 91 },
  { id: 'LE4', name: 'Robertson', team: 'Liverpool', pos: 'LE', ovr: 85 },
  { id: 'LE5', name: 'Dimarco', team: 'Inter', pos: 'LE', ovr: 87 },
  { id: 'LE6', name: 'Grimaldo', team: 'Bayer Leverkusen', pos: 'LE', ovr: 85 },
  { id: 'LE7', name: 'Balde', team: 'Barcelona', pos: 'LE', ovr: 85 },
  { id: 'LE8', name: 'Guerreiro', team: 'Bayern', pos: 'LE', ovr: 82 },
  { id: 'LE9', name: 'Estupiñán', team: 'Milan', pos: 'LE', ovr: 84 },
  { id: 'LE10', name: 'Cucurella', team: 'Real Madrid', pos: 'LE', ovr: 88 },
  { id: 'LE11', name: 'Ferland Mendy', team: 'Real Madrid', pos: 'LE', ovr: 81 },
  { id: 'LE12', name: 'Milos Kerkez', team: 'Liverpool', pos: 'LE', ovr: 81 },
  { id: 'LE14', name: 'Cuiabano', team: 'Vasco da Gama', pos: 'LE', ovr: 80 },
  { id: 'LE15', name: 'Ayrton Lucas', team: 'Flamengo', pos: 'LE', ovr: 79 },
  { id: 'LE16', name: 'Guilherme Arana', team: 'Atlético-MG', pos: 'LE', ovr: 80 },
  { id: 'LE17', name: 'Caio Henrique', team: 'Ajax', pos: 'LE', ovr: 81 },
  { id: 'LE18', name: 'Abner', team: 'Real Betis', pos: 'LE', ovr: 79 },
  { id: 'LE19', name: 'Alex Sandro', team: 'Flamengo', pos: 'LE', ovr: 79 },
  { id: 'LE20', name: 'Juninho Capixaba', team: 'Red Bull Bragantino', pos: 'LE', ovr: 77 },
  { id: 'LE21', name: 'Marlon', team: 'Cruzeiro', pos: 'LE', ovr: 77 },
  { id: 'LE22', name: 'Vanderlan', team: 'Palmeiras', pos: 'LE', ovr: 77 },
  { id: 'LE23', name: 'Avelar', team: 'América-MG', pos: 'LE', ovr: 76 },
  { id: 'LE24', name: 'Reinaldo', team: 'Mirassol', pos: 'LE', ovr: 76 },
  { id: 'LE25', name: 'Victor Luís', team: 'Mirassol', pos: 'LE', ovr: 75 },


  // ==========================================
  // VOLANTES
  // ==========================================

  { id: 'V1', name: 'Rodri', team: 'Manchester City', pos: 'VOL', ovr: 91 },
  { id: 'V2', name: 'Declan Rice', team: 'Arsenal', pos: 'VOL', ovr: 90 },
  { id: 'V3', name: 'Kimmich', team: 'Bayern', pos: 'VOL', ovr: 89 },
  { id: 'V4', name: 'Casemiro', team: 'Inter Miami', pos: 'VOL', ovr: 84 },
  { id: 'V5', name: 'Tchouaméni', team: 'Real Madrid', pos: 'VOL', ovr: 85 },
  { id: 'V6', name: 'Kanté', team: 'Al-Ittihad', pos: 'VOL', ovr: 84 },
  { id: 'V7', name: 'Bruno Guimarães', team: 'Arsenal', pos: 'VOL', ovr: 89 },
  { id: 'V8', name: 'Valverde', team: 'Real Madrid', pos: 'VOL', ovr: 87 },
  { id: 'V9', name: 'Barella', team: 'Inter', pos: 'VOL', ovr: 87 },
  { id: 'V10', name: 'Tonali', team: 'Tottenham', pos: 'VOL', ovr: 85 },
  { id: 'V11', name: 'Enzo Fernández', team: 'Chelsea', pos: 'VOL', ovr: 86 },
  { id: 'V12', name: 'Mac Allister', team: 'Liverpool', pos: 'VOL', ovr: 86 },
  { id: 'V13', name: 'Camavinga', team: 'Real Madrid', pos: 'VOL', ovr: 85 },
  { id: 'V14', name: 'Palhinha', team: 'Bayern', pos: 'VOL', ovr: 84 },
  { id: 'V15', name: 'Zubimendi', team: 'Arsenal', pos: 'VOL', ovr: 84 },
  { id: 'V16', name: 'Douglas Luiz', team: 'Juventus', pos: 'VOL', ovr: 82 },
  { id: 'V17', name: 'André', team: 'Wolverhampton', pos: 'VOL', ovr: 82 },
  { id: 'V18', name: 'João Gomes', team: 'Aston Villa', pos: 'VOL', ovr: 81 },
  { id: 'V19', name: 'Douglas Augusto', team: 'Nantes', pos: 'VOL', ovr: 79 },
  { id: 'V22', name: 'Thiago Mendes', team: 'Vasco da Gama', pos: 'VOL', ovr: 80 },
  { id: 'V23', name: 'Hugo Moura', team: 'Al-Fayha', pos: 'VOL', ovr: 77 },
  { id: 'V24', name: 'Hercules', team: 'Fluminense', pos: 'VOL', ovr: 76 },
  { id: 'V25', name: 'Erick', team: 'Athletico-PR', pos: 'VOL', ovr: 76 },


  // ==========================================
  // MEIAS
  // ==========================================

  { id: 'M1', name: 'De Bruyne', team: 'Napoli', pos: 'MEI', ovr: 89 },
  { id: 'M2', name: 'Bellingham', team: 'Real Madrid', pos: 'MEI', ovr: 90 },
  { id: 'M3', name: 'Bruno Fernandes', team: 'Manchester United', pos: 'MEI', ovr: 88 },
  { id: 'M4', name: 'Musiala', team: 'Bayern', pos: 'MEI', ovr: 89 },
  { id: 'M6', name: 'Pedri', team: 'Barcelona', pos: 'MEI', ovr: 90 },
  { id: 'M7', name: 'Odegaard', team: 'Arsenal', pos: 'MEI', ovr: 90 },
  { id: 'M8', name: 'Dani Olmo', team: 'Barcelona', pos: 'MEI', ovr: 86 },
  { id: 'M9', name: 'Florian Wirtz', team: 'Liverpool', pos: 'MEI', ovr: 88 },
  { id: 'M12', name: 'Gavi', team: 'Barcelona', pos: 'MEI', ovr: 84 },
  { id: 'M13', name: 'Fermín López', team: 'Barcelona', pos: 'MEI', ovr: 84 },
  { id: 'M14', name: 'Maddison', team: 'Tottenham', pos: 'MEI', ovr: 84 },
  { id: 'M15', name: 'Paquetá', team: 'Flamengo', pos: 'MEI', ovr: 83 },
  { id: 'M16', name: 'Dani Parejo', team: 'Villarreal', pos: 'MEI', ovr: 81 },
  { id: 'M17', name: 'James Rodríguez', team: 'Minnesota United', pos: 'MEI', ovr: 80 },
  { id: 'M20', name: 'Alan Patrick', team: 'Internacional', pos: 'MEI', ovr: 79 },
  { id: 'M21', name: 'Arrascaeta', team: 'Flamengo', pos: 'MEI', ovr: 83 },
  { id: 'M23', name: 'Gerson', team: 'Cruzeiro', pos: 'MEI', ovr: 80 },
  { id: 'M24', name: 'Oscar', team: 'São Paulo', pos: 'MEI', ovr: 79 },
  { id: 'M25', name: 'De La Cruz', team: 'Flamengo', pos: 'MEI', ovr: 79 },


  // ==========================================
  // PONTAS ESQUERDAS
  // ==========================================

  { id: 'PE1', name: 'Vinícius Jr.', team: 'Real Madrid', pos: 'PE', ovr: 91 },
  { id: 'PE2', name: 'Mbappé', team: 'Real Madrid', pos: 'PE', ovr: 92 },
  { id: 'PE3', name: 'Rafael Leão', team: 'Milan', pos: 'PE', ovr: 87 },
  { id: 'PE4', name: 'Neymar Jr.', team: 'Santos', pos: 'PE', ovr: 85 },
  { id: 'PE5', name: 'Son', team: 'Los Angeles FC', pos: 'PE', ovr: 84 },
  { id: 'PE6', name: 'Luis Díaz', team: 'Bayern', pos: 'PE', ovr: 88 },
  { id: 'PE7', name: 'Kvaratskhelia', team: 'PSG', pos: 'PE', ovr: 90 },
  { id: 'PE8', name: 'Sane', team: 'Galatasaray', pos: 'PE', ovr: 84 },
  { id: 'PE9', name: 'Martinelli', team: 'Arsenal', pos: 'PE', ovr: 85 },
  { id: 'PE10', name: 'Nico Williams', team: 'Athletic Bilbao', pos: 'PE', ovr: 84 },
  { id: 'PE11', name: 'Rashford', team: 'Barcelona', pos: 'PE', ovr: 84 },
  { id: 'PE12', name: 'Coman', team: 'Al-Hilal', pos: 'PE', ovr: 84 },
  { id: 'PE13', name: 'Doku', team: 'Manchester City', pos: 'PE', ovr: 85 },
  { id: 'PE14', name: 'Sterling', team: 'Chelsea', pos: 'PE', ovr: 81 },
  { id: 'PE15', name: 'Trossard', team: 'Arsenal', pos: 'PE', ovr: 82 },
  { id: 'PE16', name: 'Savinho', team: 'Manchester City', pos: 'PE', ovr: 83 },
  { id: 'PE17', name: 'Pepê', team: 'Porto', pos: 'PE', ovr: 80 },
  { id: 'PE18', name: 'Everton Cebolinha', team: 'Flamengo', pos: 'PE', ovr: 78 },
  { id: 'PE19', name: 'Bruno Henrique', team: 'Flamengo', pos: 'PE', ovr: 80 },
  { id: 'PE20', name: 'Paulinho', team: 'Palmeiras', pos: 'PE', ovr: 79 },
  { id: 'PE21', name: 'Wesley', team: 'Al-Nassr', pos: 'PE', ovr: 78 },
  { id: 'PE22', name: 'Ferreirinha', team: 'São Paulo', pos: 'PE', ovr: 77 },
  { id: 'PE23', name: 'Andrés Gómez', team: 'Vasco da Gama', pos: 'PE', ovr: 79 },


  // ==========================================
  // PONTAS DIREITAS
  // ==========================================

  { id: 'PD1', name: 'Salah', team: 'Trabzonspor', pos: 'PD', ovr: 87 },
  { id: 'PD2', name: 'Messi', team: 'Inter Miami', pos: 'PD', ovr: 92 },
  { id: 'PD3', name: 'Saka', team: 'Arsenal', pos: 'PD', ovr: 88 },
  { id: 'PD4', name: 'Rodrygo', team: 'Real Madrid', pos: 'PD', ovr: 85 },
  { id: 'PD5', name: 'Foden', team: 'Manchester City', pos: 'PD', ovr: 85 },
  { id: 'PD6', name: 'Lamine Yamal', team: 'Barcelona', pos: 'PD', ovr: 92 },
  { id: 'PD7', name: 'Olise', team: 'Bayern', pos: 'PD', ovr: 90 },
  { id: 'PD8', name: 'Palmer', team: 'Chelsea', pos: 'PD', ovr: 88 },
  { id: 'PD9', name: 'Dembélé', team: 'PSG', pos: 'PD', ovr: 90 },
  { id: 'PD10', name: 'Raphinha', team: 'Barcelona', pos: 'PD', ovr: 90 },
  { id: 'PD12', name: 'Kulusevski', team: 'Tottenham', pos: 'PD', ovr: 82 },
  { id: 'PD13', name: 'Antony', team: 'Real Betis', pos: 'PD', ovr: 84 },
  { id: 'PD15', name: 'Pedro Neto', team: 'Chelsea', pos: 'PD', ovr: 81 },
  { id: 'PD16', name: 'Bernardo Silva', team: 'Real Madrid', pos: 'PD', ovr: 84 },
  { id: 'PD17', name: 'Yeremy Pino', team: 'Villarreal', pos: 'PD', ovr: 80 },
  { id: 'PD18', name: 'Luiz Henrique', team: 'Zenit', pos: 'PD', ovr: 80 },
  { id: 'PD19', name: 'Artur', team: 'Botafogo', pos: 'PD', ovr: 79 },
  { id: 'PD20', name: 'Everton Ribeiro', team: 'Bahia', pos: 'PD', ovr: 79 },
  { id: 'PD21', name: 'Wanderson', team: 'Internacional', pos: 'PD', ovr: 78 },
  { id: 'PD22', name: 'Rayan', team: 'Bournemouth', pos: 'PD', ovr: 84 },


  // ==========================================
  // CENTROAVANTES
  // ==========================================

  { id: 'C1', name: 'Haaland', team: 'Manchester City', pos: 'CA', ovr: 92 },
  { id: 'C2', name: 'Harry Kane', team: 'Bayern', pos: 'CA', ovr: 91 },
  { id: 'C3', name: 'Lewandowski', team: 'Barcelona', pos: 'CA', ovr: 89 },
  { id: 'C4', name: 'Lautaro Martínez', team: 'Inter', pos: 'CA', ovr: 87 },
  { id: 'C5', name: 'Victor Osimhen', team: 'Galatasaray', pos: 'CA', ovr: 86 },
  { id: 'C6', name: 'Vlahovic', team: 'Juventus', pos: 'CA', ovr: 84 },
  { id: 'C7', name: 'Isak', team: 'Liverpool', pos: 'CA', ovr: 85 },
  { id: 'C8', name: 'Julián Álvarez', team: 'Atlético de Madrid', pos: 'CA', ovr: 88 },
  { id: 'C9', name: 'Victor Boniface', team: 'Al-Ittihad', pos: 'CA', ovr: 84 },
  { id: 'C10', name: 'Gyökeres', team: 'Arsenal', pos: 'CA', ovr: 87 },
  { id: 'C11', name: 'Darwin Núñez', team: 'Al-Hilal', pos: 'CA', ovr: 82 },
  { id: 'C12', name: 'Marcus Thuram', team: 'Inter', pos: 'CA', ovr: 83 },
  { id: 'C13', name: 'Jonathan David', team: 'Juventus', pos: 'CA', ovr: 82 },
  { id: 'C14', name: 'Rasmus Højlund', team: 'Napoli', pos: 'CA', ovr: 82 },
  { id: 'C15', name: 'Gonçalo Ramos', team: 'PSG', pos: 'CA', ovr: 81 },
  { id: 'C16', name: 'Retegui', team: 'Al-Qadsiah', pos: 'CA', ovr: 80 },
  { id: 'C18', name: 'Matheus Cunha', team: 'Manchester United', pos: 'CA', ovr: 85 },
  { id: 'C19', name: 'Richarlison', team: 'Tottenham', pos: 'CA', ovr: 82 },
  { id: 'C20', name: 'Gabriel Jesus', team: 'Arsenal', pos: 'CA', ovr: 80 },
  { id: 'C21', name: 'P. Vegetti', team: 'Cerro Porteño', pos: 'CA', ovr: 80 },
  { id: 'C22', name: 'Pedro', team: 'Flamengo', pos: 'CA', ovr: 80 },
  { id: 'C23', name: 'Gabigol', team: 'Santos', pos: 'CA', ovr: 79 },
  { id: 'C24', name: 'Calleri', team: 'São Paulo', pos: 'CA', ovr: 79 },
  { id: 'C25', name: 'Yuri Alberto', team: 'Corinthians', pos: 'CA', ovr: 79 },


  // ==========================================
  // LEGENDS / ÍDOLOS
  // ==========================================

  { id: 'L1', name: 'Pelé', team: 'Santos', pos: 'CA', ovr: 100, isLegend: true, photo: '/players/pele.png' },
  { id: 'L2', name: 'Ronaldo Fenômeno', team: 'Inter de Milão', pos: 'CA', ovr: 98, isLegend: true },
  { id: 'L3', name: 'Maradona', team: 'Napoli', pos: 'MEI', ovr: 98, isLegend: true },
  { id: 'L4', name: 'Messi', team: 'Barcelona', pos: 'PD', ovr: 99, isLegend: true },
  { id: 'L5', name: 'Cristiano Ronaldo', team: 'Real Madrid', pos: 'CA', ovr: 99, isLegend: true },
  { id: 'L6', name: 'Ronaldinho', team: 'Barcelona', pos: 'PE', ovr: 96, isLegend: true },
  { id: 'L7', name: 'Zidane', team: 'Real Madrid', pos: 'MEI', ovr: 97, isLegend: true },
  { id: 'L8', name: 'Rivaldo', team: 'Barcelona', pos: 'PE', ovr: 94, isLegend: true },
  { id: 'L9', name: 'Romário', team: 'Vasco da Gama', pos: 'CA', ovr: 98, isLegend: true },
  { id: 'L10', name: 'Garrincha', team: 'Botafogo', pos: 'PD', ovr: 97, isLegend: true },
  { id: 'L11', name: 'Roberto Carlos', team: 'Real Madrid', pos: 'LE', ovr: 95, isLegend: true },
  { id: 'L12', name: 'Cafu', team: 'Milan', pos: 'LD', ovr: 95, isLegend: true },
  { id: 'L13', name: 'Maldini', team: 'Milan', pos: 'ZAG', ovr: 97, isLegend: true },
  { id: 'L14', name: 'Beckenbauer', team: 'Bayern', pos: 'ZAG', ovr: 97, isLegend: true },
  { id: 'L15', name: 'Yashin', team: 'Dynamo Moscow', pos: 'GOL', ovr: 97, isLegend: true },
  { id: 'L16', name: 'Buffon', team: 'Juventus', pos: 'GOL', ovr: 96, isLegend: true },
  { id: 'L17', name: 'Xavi', team: 'Barcelona', pos: 'MEI', ovr: 95, isLegend: true },
  { id: 'L18', name: 'Iniesta', team: 'Barcelona', pos: 'MEI', ovr: 97, isLegend: true },
  { id: 'L19', name: 'Kaká', team: 'Milan', pos: 'MEI', ovr: 95, isLegend: true },
  { id: 'L21', name: 'Zico', team: 'Flamengo', pos: 'MEI', ovr: 95, isLegend: true },
  { id: 'L24', name: 'Thierry Henry', team: 'Arsenal', pos: 'PE', ovr: 96, isLegend: true },
  { id: 'L25', name: 'George Best', team: 'Manchester United', pos: 'PD', ovr: 95, isLegend: true },

];