import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../core/store';
import { Play, Pause, SkipBack, SkipForward, Music, Copy, Check, AlertCircle, LogOut } from 'lucide-react';

// ==========================================
// COLE AQUI O SEU BANCO DE DADOS COMPLETO PARA TESTAR
// ==========================================
const TEST_DATABASE = [
{ id: '1', title: '50 Reais', artist: 'Naiara Azevedo', genre: 'Sertanejo', file: '50 Reais.mp3', startTime: 0 },
{ id: '2', title: 'A Maior Saudade', artist: 'Henrique & Juliano', genre: 'Sertanejo', file: 'A Maior Saudade.mp3', startTime: 0 },
{ id: '3', title: 'A Mala É Falsa', artist: 'Felipe Araújo', genre: 'Sertanejo', file: 'A Mala Falsa.mp3', startTime: 0 },
{ id: '4', title: 'All of Me', artist: 'John Legend', genre: 'Pop Internacional', file: 'All of Me.mp3', startTime: 0 },
{ id: '5', title: 'All Star', artist: 'Smash Mouth', genre: 'Pop Internacional', file: 'All Star.mp3', startTime: 0 },
{ id: '6', title: 'Alors On Danse', artist: 'Stromae', genre: 'Eletrônica', file: 'Alors On Danse - Radio Edit.mp3', startTime: 0 },
{ id: '7', title: 'Amiga da Minha Mulher', artist: 'Seu Jorge', genre: 'MPB', file: 'Amiga Da Minha Mulher.mp3', startTime: 0 },
{ id: '8', title: 'S de Saudade', artist: 'Zé Neto & Cristiano', genre: 'Sertanejo', file: 'Amigo Taxista.mp3', startTime: 0 },
{ id: '9', title: 'Anjos (Pra Quem Tem Fé)', artist: 'O Rappa', genre: 'MPB', file: 'Anjos.mp3', startTime: 0 },
{ id: '10', title: 'Another Love', artist: 'Tom Odell', genre: 'Pop Internacional', file: 'Another Love.mp3', startTime: 14 },
{ id: '11', title: 'Anunciação', artist: 'Alceu Valença', genre: 'MPB', file: 'Anunciacao.mp3', startTime: 13 },
{ id: '12', title: 'Anxiety', artist: 'Doechii', genre: 'Pop Internacional', file: 'Anxiety.mp3', startTime: 0 },
{ id: '13', title: 'Apelido Carinhoso', artist: 'Gusttavo Lima', genre: 'Sertanejo', file: 'Apelido Carinhoso.mp3', startTime: 0 },
{ id: '14', title: 'Última Saudade', artist: 'Henrique & Juliano', genre: 'Sertanejo', file: 'Aquela Pessoa.mp3', startTime: 0 },
{ id: '15', title: 'Ar Condicionado no 15', artist: 'Wesley Safadão', genre: 'Sertanejo', file: 'Ar Condicionado no 15 - Ao Vivo.mp3', startTime: 0 },
{ id: '16', title: 'Auto-Reverse', artist: 'O Rappa', genre: 'MPB', file: 'Auto-reverse.mp3', startTime: 0 },
{ id: '17', title: 'Azul da Cor do Mar', artist: 'Tim Maia', genre: 'MPB', file: 'Azul Da Cor Do Mar.mp3', startTime: 0 },
{ id: '18', title: 'Beautiful Girls', artist: 'Sean Kingston', genre: 'Pop Internacional', file: 'Beautiful Girls.mp3', startTime: 0 },
{ id: '19', title: 'Bem Pior Que Eu', artist: 'Marília Mendonça', genre: 'Sertanejo', file: 'Bem Pior Que Eu - Ao Vivo.mp3', startTime: 4 },
{ id: '20', title: 'Blame', artist: 'Calvin Harris', genre: 'Eletrônica', file: 'Blame (feat. John Newman).mp3', startTime: 0 },
{ id: '21', title: 'Bloqueado', artist: 'Gusttavo Lima', genre: 'Sertanejo', file: 'Bloqueado - Ao Vivo.mp3', startTime: 4 },
{ id: '22', title: 'Caso Indefinido', artist: 'Cristiano Araújo', genre: 'Sertanejo', file: 'Caso Indefinido.mp3', startTime: 80 },
{ id: '23', title: 'Chandelier', artist: 'Sia', genre: 'Pop Internacional', file: 'Chandelier.mp3', startTime: 0 },
{ id: '24', title: 'Cheerleader', artist: 'OMI', genre: 'Pop Internacional', file: 'Cheerleader.mp3', startTime: 0 },
{ id: '25', title: 'Chão de Giz', artist: 'Zé Ramalho', genre: 'MPB', file: 'Chao de Giz.mp3', startTime: 0 },
{ id: '26', title: 'Closer', artist: 'The Chainsmokers', genre: 'Pop Internacional', file: 'Closer.mp3', startTime: 0 },
{ id: '27', title: 'Como É Que A Gente Fica', artist: 'Henrique & Juliano', genre: 'Sertanejo', file: 'ComoeQueAGenteFica.mp3', startTime: 0 },
{ id: '28', title: 'Céu Azul', artist: 'Charlie Brown Jr.', genre: 'Rock', file: 'Ceu Azul.mp3', startTime: 0 },
{ id: '30', title: 'Don’t Let Me Down', artist: 'The Chainsmokers', genre: 'Eletrônica', file: "Don't Let Me Down.mp3", startTime: 0 },
{ id: '31', title: 'Dona Maria', artist: 'Thiago Brava', genre: 'Sertanejo', file: 'Dona Maria.mp3', startTime: 13 },
{ id: '32', title: 'Gostava Tanto de Você', artist: 'Tim Maia', genre: 'MPB', file: 'Gostava Tanto De Voce.mp3', startTime: 0 },
{ id: '33', title: 'Heroes (We Could Be)', artist: 'Alesso', genre: 'Eletrônica', file: 'Heroes (we could be).mp3', startTime: 30 },
{ id: '34', title: 'Hey Brother', artist: 'Avicii', genre: 'Eletrônica', file: 'Hey Brother.mp3', startTime: 50 },
{ id: '35', title: 'Hotline Bling', artist: 'Drake', genre: 'Pop Internacional', file: 'Hotline Bling.mp3', startTime: 0 },
{ id: '36', title: 'I Gotta Feeling', artist: 'Black Eyed Peas', genre: 'Pop Internacional', file: 'I Gotta Feeling.mp3', startTime: 13 },
{ id: '37', title: 'In My Mind', artist: 'Dynoro', genre: 'Eletrônica', file: 'In My Mind.mp3', startTime: 1 },
{ id: '38', title: 'Infinity', artist: 'Guru Josh Project', genre: 'Eletrônica', file: 'Infinity.mp3', startTime: 0 },
{ id: '39', title: 'Largado às Traças', artist: 'Zé Neto & Cristiano', genre: 'Sertanejo', file: 'Largado as Tracas.mp3', startTime: 0 },
{ id: '40', title: 'Levels', artist: 'Avicii', genre: 'Eletrônica', file: 'Levels - Radio Edit.mp3', startTime: 34 },
{ id: '41', title: 'Leão', artist: 'Marília Mendonça', genre: 'Sertanejo', file: 'Leao.mp3', startTime: 12 },
{ id: '42', title: 'Lose Control', artist: 'MEDUZA', genre: 'Eletrônica', file: 'Lose Control.mp3', startTime: 0 },
{ id: '43', title: 'Love Tonight', artist: 'David Guetta', genre: 'Eletrônica', file: 'Love Tonight - David Guetta Remix Edit.mp3', startTime: 10 },
{ id: '44', title: 'Love Yourself', artist: 'Justin Bieber', genre: 'Pop Internacional', file: 'Love Yourself.mp3', startTime: 0 },
{ id: '45', title: 'Low', artist: 'Flo Rida', genre: 'Pop Internacional', file: 'Low (feat. T-Pain).mp3', startTime: 0 },
{ id: '46', title: 'Matadinha de Saudade', artist: 'Grupo Menos É Mais', genre: 'Pagode/Samba', file: 'Matadinha De Saudade.mp3', startTime: 22 },
{ id: '47', title: 'Menina Veneno', artist: 'Ritchie', genre: 'MPB', file: 'Menina Veneno.mp3', startTime: 0 },
{ id: '48', title: 'Mina do Condomínio', artist: 'Seu Jorge', genre: 'MPB', file: 'Mina do Condominio.mp3', startTime: 14 },
{ id: '49', title: 'Mirrors', artist: 'Justin Timberlake', genre: 'Pop Internacional', file: 'Mirrors.mp3', startTime: 21 },
{ id: '50', title: 'Naquela Mesa', artist: 'Nelson Gonçalves', genre: 'MPB', file: 'Naquela Mesa.mp3', startTime: 0 },
{ id: '51', title: 'No Dia em Que Eu Saí de Casa', artist: 'Zezé Di Camargo & Luciano', genre: 'Sertanejo', file: 'No Dia em Que Eu Sai.mp3', startTime: 5 },
{ id: '52', title: 'One Dance', artist: 'Drake', genre: 'Pop Internacional', file: 'One Dance.mp3', startTime: 2 },
{ id: '53', title: 'One More Time', artist: 'Daft Punk', genre: 'Eletrônica', file: 'One More Time.mp3', startTime: 24 },
{ id: '54', title: 'Panela Velha', artist: 'Sérgio Reis', genre: 'Sertanejo', file: 'Panela Velha.mp3', startTime: 10 },
{ id: '55', title: 'Pompeii', artist: 'Bastille', genre: 'Pop Internacional', file: 'Pompeii.mp3', startTime: 0 },
{ id: '56', title: 'Preciso Me Encontrar', artist: 'Cartola', genre: 'MPB', file: 'Preciso Me Encontrar.mp3', startTime: 50 },
{ id: '57', title: 'Primeiros Erros', artist: 'Capital Inicial', genre: 'Rock', file: 'Primeiros Erros.mp3', startTime: 20 },
{ id: '58', title: 'Pump It', artist: 'Black Eyed Peas', genre: 'Pop Internacional', file: 'Pump It.mp3', startTime: 0 },
{ id: '60', title: 'Radioactive', artist: 'Imagine Dragons', genre: 'Pop Internacional', file: 'Radioactive.mp3', startTime: 25 },
{ id: '61', title: 'Roar', artist: 'Katy Perry', genre: 'Pop Internacional', file: 'Roar.mp3', startTime: 0 },
{ id: '62', title: 'Rude', artist: 'MAGIC!', genre: 'Pop Internacional', file: 'Rude.mp3', startTime: 0 },
{ id: '63', title: 'Sandstorm', artist: 'Darude', genre: 'Eletrônica', file: 'Sandstorm.mp3', startTime: 4 },
{ id: '64', title: 'See You Again', artist: 'Wiz Khalifa', genre: 'Pop Internacional', file: 'See You Again.mp3', startTime: 25 },
{ id: '66', title: 'Shake It Off', artist: 'Taylor Swift', genre: 'Pop Internacional', file: 'Shake It Off.mp3', startTime: 0 },
{ id: '67', title: 'Shape of You', artist: 'Ed Sheeran', genre: 'Pop Internacional', file: 'Shape of You.mp3', startTime: 0 },
{ id: '68', title: 'Página de Amigos', artist: 'Chitãozinho & Xororó', genre: 'Sertanejo', file: 'Sinonimos.mp3', startTime: 0 },
{ id: '69', title: 'Smack That', artist: 'Akon', genre: 'Pop Internacional', file: 'Smack That.mp3', startTime: 0 },
{ id: '70', title: 'Sorry', artist: 'Justin Bieber', genre: 'Pop Internacional', file: 'Sorry.mp3', startTime: 0 },
{ id: '71', title: 'Stressed Out', artist: 'Twenty One Pilots', genre: 'Pop Internacional', file: 'Stressed Out.mp3', startTime: 0 },
{ id: '72', title: 'Sugar', artist: 'Maroon 5', genre: 'Pop Internacional', file: 'Sugar.mp3', startTime: 8 },
{ id: '73', title: 'Summer', artist: 'Calvin Harris', genre: 'Eletrônica', file: 'Summer.mp3', startTime: 37 },
{ id: '74', title: 'Só os Loucos Sabem', artist: 'Charlie Brown Jr.', genre: 'Rock', file: 'So Os Loucos Sabem.mp3', startTime: 0 },
{ id: '75', title: 'Take Me to Church', artist: 'Hozier', genre: 'Pop Internacional', file: 'Take Me To Church.mp3', startTime: 30 },
{ id: '76', title: 'Telegrama', artist: 'Zeca Baleiro', genre: 'MPB', file: 'Telegrama.mp3', startTime: 0 },
{ id: '77', title: 'Tempo Perdido', artist: 'Legião Urbana', genre: 'Rock', file: 'Tempo Perdido.mp3', startTime: 7 },
{ id: '78', title: 'The Business', artist: 'Tiësto', genre: 'Eletrônica', file: 'The Business.mp3', startTime: 0 },
{ id: '79', title: 'The Scientist', artist: 'Coldplay', genre: 'Pop Internacional', file: 'The Scientist.mp3', startTime: 0 },
{ id: '80', title: 'Thunder', artist: 'Imagine Dragons', genre: 'Pop Internacional', file: 'Thunder.mp3', startTime: 0 },
{ id: '81', title: 'Timber', artist: 'Pitbull', genre: 'Pop Internacional', file: 'Timber.mp3', startTime: 0 },
{ id: '82', title: 'Titanium', artist: 'David Guetta', genre: 'Eletrônica', file: 'Titanium.mp3', startTime: 0 },
{ id: '83', title: 'Trem das Onze', artist: 'Adoniran Barbosa', genre: 'MPB', file: 'Trem Das Onze.mp3', startTime: 10 },
{ id: '84', title: 'Under Control', artist: 'Calvin Harris', genre: 'Eletrônica', file: 'Under Control.mp3', startTime: 0 },
{ id: '85', title: 'Vamos Fugir', artist: 'Skank', genre: 'Rock', file: 'Vamos Fugir.mp3', startTime: 0 },
{ id: '86', title: 'Waiting For Love', artist: 'Avicii', genre: 'Eletrônica', file: 'Waiting For Love.mp3', startTime: 0 },
{ id: '87', title: 'Whistle', artist: 'Flo Rida', genre: 'Pop Internacional', file: 'Whistle.mp3', startTime: 0 },
{ id: '88', title: 'Yellow', artist: 'Coldplay', genre: 'Pop Internacional', file: 'Yellow.mp3', startTime: 10 },
{ id: '89', title: 'Deixe-Me Ir', artist: '1Kilo', genre: 'Rap/Trap', file: '1Kilo Deixeme Ir.mp3', startTime: 0 },
{ id: '90', title: '5 da Manhã', artist: 'Rai Saia Rodada', genre: 'Forró/Piseiro', file: '5 da Manha Rai Saia Rodada.mp3', startTime: 0 },
{ id: '91', title: 'A Morte do Autotune', artist: 'Matuê', genre: 'Rap/Trap', file: 'A Morte do Autotune matue.mp3', startTime: 11 },
{ id: '92', title: 'Someone Like You', artist: 'Adele', genre: 'Pop Internacional', file: 'Adele Someone Like You.mp3', startTime: 0 },
{ id: '93', title: 'Take on Me', artist: 'a-ha', genre: 'Rock', file: 'aha Take On Me.mp3', startTime: 3 },
{ id: '94', title: 'Amor e Fé', artist: 'Hungria', genre: 'Rap/Trap', file: 'Amor e Fe Hungria.mp3', startTime: 0 },
{ id: '95', title: 'The Nights', artist: 'Avicii', genre: 'Eletrônica', file: 'Avicii The Nights.mp3', startTime: 1 },
{ id: '96', title: 'Wake Me Up', artist: 'Avicii', genre: 'Eletrônica', file: 'Avicii Wake Me Up.mp3', startTime: 0 },
{ id: '97', title: 'Baby Me Atende', artist: 'Matheus Fernandes', genre: 'Forró/Piseiro', file: 'Baby Me Atende.mp3', startTime: 2 },
{ id: '98', title: 'Barcelona', artist: 'L7NNON', genre: 'Rap/Trap', file: 'Barcelona L7.mp3', startTime: 0 },
{ id: '99', title: 'Basta Você Me Ligar', artist: 'Os Barões da Pisadinha', genre: 'Forró/Piseiro', file: 'Basta Você Me Ligar.mp3', startTime: 3 },
{ id: '100', title: 'bad guy', artist: 'Billie Eilish', genre: 'Pop Internacional', file: 'Billie Eilish bad guy.mp3', startTime: 35 },
{ id: '101', title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', file: 'Bohemian Rhapsody.mp3', startTime: 1 },
{ id: '102', title: 'It’s My Life', artist: 'Bon Jovi', genre: 'Rock', file: 'Bon Jovi Its My Life.mp3', startTime: 0 },
{ id: '103', title: 'Livin’ on a Prayer', artist: 'Bon Jovi', genre: 'Rock', file: 'Bon Jovi Livin On A Prayer.mp3', startTime: 3 },
{ id: '104', title: 'Boate Azul', artist: 'Bruno & Marrone', genre: 'Sertanejo', file: 'Bruno Marrone Boate Azul.mp3', startTime: 0 },
{ id: '105', title: 'Californication', artist: 'Red Hot Chili Peppers', genre: 'Rock', file: 'Californication.mp3', startTime: 2 },
{ id: '106', title: 'Malandragem', artist: 'Cássia Eller', genre: 'Rock', file: 'Cassia Eller Malandragem.mp3', startTime: 0 },
{ id: '107', title: 'Exagerado', artist: 'Cazuza', genre: 'Rock', file: 'Cazuza Exagerado.mp3', startTime: 0 },
{ id: '108', title: 'Cheia de Manias', artist: 'Raça Negra', genre: 'Pagode/Samba', file: 'Cheia de Mania.mp3', startTime: 0 },
{ id: '109', title: 'Viva La Vida', artist: 'Coldplay', genre: 'Pop Internacional', file: 'Coldplay Viva La Vida.mp3', startTime: 0 },
{ id: '110', title: 'Come As You Are', artist: 'Nirvana', genre: 'Rock', file: 'Come As You Are.mp3', startTime: 0 },
{ id: '111', title: 'Memories', artist: 'David Guetta', genre: 'Eletrônica', file: 'David Guetta Memories.mp3', startTime: 0 },
{ id: '112', title: 'Deixa Acontecer', artist: 'Grupo Revelação', genre: 'Pagode/Samba', file: 'Deixa Acontecer.mp3', startTime: 12 },
{ id: '113', title: 'Manda Áudio', artist: 'Di Propósito', genre: 'Pagode/Samba', file: 'Di Proposito Manda audio.mp3', startTime: 0 },
{ id: '114', title: 'Duro Igual Concreto', artist: '1Kilo', genre: 'Rap/Trap', file: 'Duro Igual Concreto 1Kilo.mp3', startTime: 3 },
{ id: '115', title: 'Eu Tenho a Senha', artist: 'João Gomes', genre: 'Forró/Piseiro', file: 'EU TENHO A SENHA.mp3', startTime: 3 },
{ id: '116', title: 'The Final Countdown', artist: 'Europe', genre: 'Rock', file: 'Europe The Final Countdown.mp3', startTime: 12 },
{ id: '117', title: 'Filho do Mato', artist: 'Raí Saia Rodada', genre: 'Forró/Piseiro', file: 'Filho do Mato.mp3', startTime: 0 },
{ id: '118', title: 'Freio da Blaze', artist: 'L7NNON', genre: 'Rap/Trap', file: 'Freio da Blaze L7NNON.mp3', startTime: 0 },
{ id: '119', title: 'Girassóis de Van Gogh', artist: 'Baco Exu do Blues', genre: 'Rap/Trap', file: 'Girassoois de Van Gogh baco.mp3', startTime: 0 },
{ id: '120', title: 'Don’t Cry', artist: 'Guns N’ Roses', genre: 'Rock', file: 'Guns N Roses Dont Cry.mp3', startTime: 10 },
{ id: '121', title: 'November Rain', artist: 'Guns N’ Roses', genre: 'Rock', file: 'Guns N Roses November Rain.mp3', startTime: 15 },
{ id: '122', title: 'Welcome to the Jungle', artist: 'Guns N’ Roses', genre: 'Rock', file: 'Guns N Roses Welcome To The Jungle.mp3', startTime: 5 },
{ id: '123', title: 'Hotel California', artist: 'Eagles', genre: 'Rock', file: 'Hotel California.mp3', startTime: 1 },
{ id: '124', title: 'Um Pedido', artist: 'Hungria', genre: 'Rap/Trap', file: 'Hungria Um Pedido.mp3', startTime: 20 },
{ id: '125', title: 'Imprevisível', artist: 'Tribo da Periferia', genre: 'Rap/Trap', file: 'Imprevisivel Tribo da Periferia.mp3', startTime: 1 },
{ id: '126', title: 'In the End', artist: 'Linkin Park', genre: 'Rock', file: 'In The End Linkin Park.mp3', startTime: 0 },
{ id: '127', title: 'Já Que Me Ensinou a Beber', artist: 'Barões da Pisadinha', genre: 'Forró/Piseiro', file: 'Ja Que Me Ensinou a Beber.mp3', startTime: 0 },
{ id: '128', title: 'Dengo', artist: 'João Gomes', genre: 'Forró/Piseiro', file: 'Joao Gomes DENGO.mp3', startTime: 2 },
{ id: '129', title: 'Piloto', artist: 'João Gomes', genre: 'Forró/Piseiro', file: 'Joao Gomes PILOTO.mp3', startTime: 0 },
{ id: '130', title: 'Propaganda', artist: 'Jorge & Mateus', genre: 'Sertanejo', file: 'Jorge Mateus Propaganda.mp3', startTime: 0 },
{ id: '131', title: 'O Sol', artist: 'Jota Quest', genre: 'Rock', file: 'Jota Quest O Sol.mp3', startTime: 0 },
{ id: '132', title: 'Baby', artist: 'Justin Bieber', genre: 'Pop Internacional', file: 'Justin Bieber Baby.mp3', startTime: 0 },
{ id: '133', title: 'Use Somebody', artist: 'Kings of Leon', genre: 'Rock', file: 'Kings Of Leon Use Somebody.mp3', startTime: 2 },
{ id: '134', title: 'Poker Face', artist: 'Lady Gaga', genre: 'Pop Internacional', file: 'Lady Gaga Poker Face.mp3', startTime: 0 },
{ id: '135', title: 'Lapada Dela', artist: 'Grupo Menos É Mais', genre: 'Pagode/Samba', file: 'Lapada Dela.mp3', startTime: 0 },
{ id: '136', title: 'Pense em Mim', artist: 'Leandro & Leonardo', genre: 'Sertanejo', file: 'Leandro e Leonardo Pense em mim.mp3', startTime: 5 },
{ id: '137', title: 'Lembranças', artist: 'Hungria', genre: 'Rap/Trap', file: 'Lembrancas Hungria.mp3', startTime: 8 },
{ id: '138', title: 'Máquina do Tempo', artist: 'Matuê', genre: 'Rap/Trap', file: 'maquina do Tempo matue.mp3', startTime: 0 },
{ id: '139', title: 'Uptown Funk', artist: 'Bruno Mars', genre: 'Pop Internacional', file: 'Mark Ronson Uptown Funk.mp3', startTime: 0 },
{ id: '140', title: 'Animals', artist: 'Martin Garrix', genre: 'Eletrônica', file: 'Martin Garrix Animals.mp3', startTime: 41 },
{ id: '141', title: 'Me Desculpa Jay Z', artist: 'Baco Exu do Blues', genre: 'Rap/Trap', file: 'Me Desculpa Jay Z baco.mp3', startTime: 0 },
{ id: '142', title: 'Coração Partido', artist: 'Grupo Menos É Mais', genre: 'Pagode/Samba', file: 'Menos e Mais Coracao Partido.mp3', startTime: 0 },
{ id: '143', title: 'P do Pecado', artist: 'Grupo Menos É Mais', genre: 'Pagode/Samba', file: 'Menos e Mais P do Pecado.mp3', startTime: 0 },
{ id: '144', title: 'Pela Última Vez', artist: 'Grupo Menos É Mais', genre: 'Pagode/Samba', file: 'Menos e Mais Pela ultima Vez.mp3', startTime: 0 },
{ id: '145', title: 'Mentira Estampada', artist: 'Wesley Safadão e Natanzinho', genre: 'Forró/Piseiro', file: 'Mentira Estampada.mp3', startTime: 0 },
{ id: '146', title: 'Meu Mel', artist: 'Zé Vaqueiro', genre: 'Forró/Piseiro', file: 'Meu Mel ze vaqueiro.mp3', startTime: 0 },
{ id: '147', title: 'Meu Pedaço de Pecado', artist: 'João Gomes', genre: 'Forró/Piseiro', file: 'meu pedaco de pecado.mp3', startTime: 0 },
{ id: '148', title: 'Minha Alma', artist: 'O Rappa', genre: 'MPB', file: 'Minha Alma O Rappa.mp3', startTime: 50 },
{ id: '149', title: 'Cilada', artist: 'Molejo', genre: 'Pagode/Samba', file: 'Molejo Cilada.mp3', startTime: 0 },
{ id: '150', title: 'Nada É Pra Sempre', artist: 'L7NNON', genre: 'Rap/Trap', file: 'Nada e Pra Sempre L7NNON.mp3', startTime: 11 },
{ id: '151', title: 'Nosso Plano', artist: 'Tribo da Periferia', genre: 'Rap/Trap', file: 'Nosso Plano Tribo da Periferia.mp3', startTime: 19 },
{ id: '152', title: 'Numb', artist: 'Linkin Park', genre: 'Rock', file: 'Numb Linkin Park.mp3', startTime: 2 },
{ id: '153', title: 'O Show Tem Que Continuar', artist: 'Grupo Revelação', genre: 'Pagode/Samba', file: 'O Show Tem Que Continuar.mp3', startTime: 0 },
{ id: '154', title: 'Counting Stars', artist: 'OneRepublic', genre: 'Pop Internacional', file: 'OneRepublic Counting Stars.mp3', startTime: 0 },
{ id: '155', title: 'Even Flow', artist: 'Pearl Jam', genre: 'Rock', file: 'Pearl Jam Even Flow.mp3', startTime: 0 },
{ id: '156', title: 'Another Brick in the Wall', artist: 'Pink Floyd', genre: 'Rock', file: 'Pink Floyd Another Brick In The Wall.mp3', startTime: 21 },
{ id: '157', title: 'Money', artist: 'Pink Floyd', genre: 'Rock', file: 'Pink Floyd Money.mp3', startTime: 5 },
{ id: '158', title: 'Recairei', artist: 'Os Barões da Pisadinha', genre: 'Forró/Piseiro', file: 'Recairei baroes pisadinha.mp3', startTime: 0 },
{ id: '159', title: 'Losing My Religion', artist: 'R.E.M.', genre: 'Rock', file: 'REM Losing My Religion.mp3', startTime: 17 },
{ id: '160', title: 'Resiliência', artist: 'Tribo da Periferia', genre: 'Rap/Trap', file: 'RESILIENCIA Tribo da Periferia.mp3', startTime: 0 },
{ id: '161', title: 'Ressaca de Saudade', artist: 'Wesley Safadão', genre: 'Forró/Piseiro', file: 'Ressaca de Saudade.mp3', startTime: 0 },
{ id: '162', title: 'Reload', artist: 'Sebastian Ingrosso', genre: 'Eletrônica', file: 'Sebastian Ingrosso Reload.mp3', startTime: 23 },
{ id: '163', title: 'Seven Nation Army', artist: 'The White Stripes', genre: 'Rock', file: 'Seven Nation Army The White Stripes.mp3', startTime: 7 },
{ id: '164', title: 'Acima do Sol', artist: 'Skank', genre: 'Rock', file: 'Skank Acima do Sol.mp3', startTime: 11 },
{ id: '165', title: 'Ainda Gosto Dela', artist: 'Skank', genre: 'Rock', file: 'Skank Ainda gosto dela.mp3', startTime: 7 },
{ id: '166', title: 'Smells Like Teen Spirit', artist: 'Nirvana', genre: 'Rock', file: 'Smells Like Teen Spirit.mp3', startTime: 0 },
{ id: '167', title: 'Só Pra Castigar', artist: 'Wesley Safadão', genre: 'Forró/Piseiro', file: 'So Pra Castigar.mp3', startTime: 0 },
{ id: '168', title: 'Essa Tal Liberdade', artist: 'Só Pra Contrariar', genre: 'Pagode/Samba', file: 'So Pra Contrariar Essa Tal Liberdade.mp3', startTime: 11 },
{ id: '169', title: 'Stereo Love', artist: 'Edward Maya', genre: 'Eletrônica', file: 'Stereo love.mp3', startTime: 0 },
{ id: '170', title: 'Don’t You Worry Child', artist: 'Swedish House Mafia', genre: 'Eletrônica', file: 'Swedish House Mafia Dont You Worry Child.mp3', startTime: 6 },
{ id: '171', title: 'Sweet Child O’ Mine', artist: 'Guns N’ Roses', genre: 'Rock', file: 'Sweet Child O Mine.mp3', startTime: 0 },
{ id: '172', title: 'Tá Rocheda', artist: 'Os Barões da Pisadinha', genre: 'Forró/Piseiro', file: 'ta Rocheda.mp3', startTime: 0 },
{ id: '173', title: 'Tá Vendo Aquela Lua', artist: 'Grupo Revelação', genre: 'Pagode/Samba', file: 'Ta Vendo Aquela Lua.mp3', startTime: 5 },
{ id: '174', title: 'Buquê de Flores', artist: 'Thiaguinho', genre: 'Pagode/Samba', file: 'Thiaguinho  Buque de Flores.mp3', startTime: 4 },
{ id: '176', title: 'Doce da Alma', artist: 'Tribo da Periferia', genre: 'Rap/Trap', file: 'Tribo da Periferia Doce da Alma.mp3', startTime: 3 },
{ id: '177', title: 'Camisa 10', artist: 'Turma do Pagode', genre: 'Pagode/Samba', file: 'Turma do Pagode Camisa 10.mp3', startTime: 15 },
{ id: '178', title: 'Deixa em Off', artist: 'Turma do Pagode', genre: 'Pagode/Samba', file: 'Turma do Pagode Deixa em Off.mp3', startTime: 0 },
{ id: '179', title: 'Lancinho', artist: 'Turma do Pagode', genre: 'Pagode/Samba', file: 'Turma do Pagode Lancinho.mp3', startTime: 0 },
{ id: '180', title: 'Sua Mãe Vai Me Amar', artist: 'Turma do Pagode', genre: 'Pagode/Samba', file: 'Turma do Pagode Sua Mae Vai Me Amar.mp3', startTime: 0 },
{ id: '181', title: 'Valores', artist: 'Tribo da Periferia', genre: 'Rap/Trap', file: 'Valores Tribo da Periferia.mp3', startTime: 0 },
{ id: '182', title: 'Volta Comigo BB', artist: 'Zé Vaqueiro', genre: 'Forró/Piseiro', file: 'Volta comigo bb ze vaqueiro.mp3', startTime: 0 },
{ id: '183', title: 'We Will Rock You', artist: 'Queen', genre: 'Rock', file: 'We Will Rock You.mp3', startTime: 6 },
{ id: '184', title: 'Tenho Medo', artist: 'Zé Vaqueiro', genre: 'Forró/Piseiro', file: 'Ze Vaqueiro Tenho Medo.mp3', startTime: 0 },
{ id: '185', title: 'É o Amor', artist: 'Zezé Di Camargo & Luciano', genre: 'Sertanejo', file: 'Zeze Di Camargo Luciano e o Amor.mp3', startTime: 13 },

];

const SORTED_DB = [...TEST_DATABASE].sort((a, b) => a.title.localeCompare(b.title));

export default function SongTester() {
  const { setScreen } = useAppStore();
  
  const [songs, setSongs] = useState(SORTED_DB);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSong = songs[currentIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentSong.startTime;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentIndex, currentSong.startTime]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => { if (currentIndex < songs.length - 1) setCurrentIndex(prev => prev + 1); };
  const playPrev = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };

  const updateStartTime = (newTime: number) => {
    if (newTime < 0) newTime = 0;
    const updatedSongs = [...songs];
    updatedSongs[currentIndex] = { ...updatedSongs[currentIndex], startTime: newTime };
    setSongs(updatedSongs);
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const generateCode = () => {
    const code = "const SONG_DATABASE = [\n" + songs.map(s => 
      `  { id: '${s.id}', title: '${s.title.replace(/'/g, "\\'")}', artist: '${s.artist.replace(/'/g, "\\'")}', genre: '${s.genre}', file: '${s.file}', startTime: ${s.startTime} }`
    ).join(',\n') + "\n];";

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Sair da ferramenta voltando para o Menu
  const handleExit = () => {
    if (audioRef.current) audioRef.current.pause();
    setScreen('menu');
  };

  return (
    <div className="fixed inset-0 z-50 flex w-full h-full bg-slate-900 text-white font-sans overflow-hidden">
      
      <audio ref={audioRef} src={`/music/${currentSong.file}`} onEnded={playNext} />

      {/* COLUNA ESQUERDA: LISTA */}
      <div className="w-1/3 bg-slate-800 border-r-2 border-slate-700 flex flex-col">
        <div className="p-6 bg-slate-900 border-b-2 border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-black flex items-center gap-3"><Music className="text-purple-400" /> Catálogo ({songs.length})</h2>
          <button onClick={handleExit} className="flex items-center gap-2 bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg font-bold hover:bg-rose-500 hover:text-white transition-all">
            <LogOut size={20} /> Sair
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
          {songs.map((song, index) => (
            <button
              key={song.id}
              onClick={() => { setCurrentIndex(index); setIsPlaying(true); }}
              className={`text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                index === currentIndex ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex flex-col overflow-hidden pr-2">
                <span className={`font-bold truncate text-xl ${index === currentIndex ? 'text-purple-400' : 'text-slate-200'}`}>
                  {song.title}
                </span>
                <span className="text-sm text-slate-500 truncate">{song.artist}</span>
              </div>
              <div className="text-sm font-black font-mono bg-slate-800 border border-slate-600 px-3 py-1 rounded text-slate-400 shrink-0">
                Início: {song.startTime}s
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* COLUNA DIREITA: EDIÇÃO */}
      <div className="w-2/3 p-12 flex flex-col items-center justify-center relative bg-gradient-to-br from-slate-900 to-slate-800">
        
        <div className="w-full max-w-3xl bg-slate-800 border-2 border-slate-700 rounded-[3rem] p-12 flex flex-col items-center shadow-2xl relative">
          
          <div className="absolute -top-6 bg-amber-500 text-slate-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg tracking-widest text-sm">
            <AlertCircle size={20} /> MODO DE TESTE E AJUSTE
          </div>

          <div className="text-center mb-10 w-full">
            <h1 className="text-5xl font-black text-white mb-4 drop-shadow-md">{currentSong.title}</h1>
            <p className="text-3xl text-purple-400 font-medium mb-4">{currentSong.artist}</p>
            <span className="bg-slate-700 text-slate-300 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">{currentSong.genre}</span>
          </div>

          <div className="flex items-center gap-8 mb-12">
            <button onClick={playPrev} disabled={currentIndex === 0} className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 disabled:opacity-30 transition-all">
              <SkipBack size={32} fill="currentColor" />
            </button>
            <button onClick={togglePlay} className="w-28 h-28 bg-purple-600 rounded-full flex items-center justify-center hover:scale-105 shadow-[0_0_40px_rgba(147,51,234,0.4)] transition-all">
              {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} className="ml-2" fill="currentColor" />}
            </button>
            <button onClick={playNext} disabled={currentIndex === songs.length - 1} className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 disabled:opacity-30 transition-all">
              <SkipForward size={32} fill="currentColor" />
            </button>
          </div>

          {/* AJUSTE DE TEMPO */}
          <div className="w-full bg-slate-900 border-2 border-slate-700 p-8 rounded-3xl flex items-center justify-between">
            <div>
              <p className="text-purple-400 font-black uppercase tracking-widest text-lg mb-2">Segundo de Início (startTime)</p>
              <p className="text-slate-500 text-md">A música começará a tocar exatamente neste segundo.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                min="0"
                value={currentSong.startTime}
                onChange={(e) => updateStartTime(Number(e.target.value))}
                className="w-28 bg-slate-800 border-4 border-purple-500 text-white text-4xl font-black text-center p-3 rounded-xl outline-none"
              />
              <span className="text-2xl text-slate-400 font-bold">s</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center w-full max-w-3xl">
          <p className="text-slate-400 mb-6 font-medium text-lg">
            Ao terminar de ajustar, clique no botão abaixo. Depois, abra o arquivo <code className="bg-slate-800 px-2 py-1 rounded text-purple-300">AdivinheMusica.tsx</code> e substitua a constante <code className="bg-slate-800 px-2 py-1 rounded text-purple-300">SONG_DATABASE</code>.
          </p>
          <button 
            onClick={generateCode}
            className={`w-full py-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 transition-all shadow-lg ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
          >
            {copied ? <><Check size={32} /> Código Copiado!</> : <><Copy size={32} /> Copiar Novo Código das Músicas</>}
          </button>
        </div>

      </div>
    </div>
  );
}