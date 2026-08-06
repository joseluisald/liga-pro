import jsPDF from 'jspdf';
import { Championship, Match, MatchEvent, Player, StandingRow, Team } from '../types';

export function generateMatchSheetPdf(
  championship: Championship,
  match: Match,
  homeTeam: Team,
  awayTeam: Team,
  homePlayers: Player[],
  awayPlayers: Player[],
  events: MatchEvent[]
) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(30, 64, 175); // Royal Blue
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(championship.name.toUpperCase(), 105, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SÚMULA OFICIAL DE PARTIDA - LIGA DE FUTEBOL', 105, 20, { align: 'center' });

  // Match Metadata Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 34, 186, 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Data: ${match.date} às ${match.time}`, 18, 42);
  doc.text(`Local: ${match.location}`, 18, 49);
  doc.text(`Árbitro: ${match.referee || 'Não Informado'}`, 18, 56);

  doc.text(`Rodada: ${match.roundNumber || 1}`, 120, 42);
  doc.text(`Status: ${match.status}`, 120, 49);
  doc.text(`Placar Final: ${match.homeScore} x ${match.awayScore}`, 120, 56);

  // Teams Banner
  doc.setFillColor(241, 245, 249);
  doc.rect(12, 65, 186, 12, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(`${homeTeam.name.toUpperCase()}  ( MANDANTE )`, 20, 73);
  doc.setTextColor(220, 38, 38);
  doc.text(`${awayTeam.name.toUpperCase()}  ( VISITANTE )`, 115, 73);

  // Home Lineup Table
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Nº  NOME DO JOGADOR', 18, 84);
  doc.text('POS', 85, 84);

  let y = 90;
  doc.setFont('helvetica', 'normal');
  homePlayers.slice(0, 14).forEach((p, idx) => {
    doc.text(`${p.shirtNumber || idx + 1}`, 18, y);
    doc.text(`${p.fullName}`, 28, y);
    doc.text(`${p.position.substring(0, 3)}`, 85, y);
    doc.line(18, y + 1.5, 95, y + 1.5);
    y += 6;
  });

  // Away Lineup Table
  doc.setFont('helvetica', 'bold');
  doc.text('Nº  NOME DO JOGADOR', 115, 84);
  doc.text('POS', 182, 84);

  y = 90;
  doc.setFont('helvetica', 'normal');
  awayPlayers.slice(0, 14).forEach((p, idx) => {
    doc.text(`${p.shirtNumber || idx + 1}`, 115, y);
    doc.text(`${p.fullName}`, 125, y);
    doc.text(`${p.position.substring(0, 3)}`, 182, y);
    doc.line(115, y + 1.5, 192, y + 1.5);
    y += 6;
  });

  // Events Summary Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 180, 186, 65, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('REGISTRO DE EVENTOS DA PARTIDA (GOLS, CARTÕES E OCORRÊNCIAS)', 18, 188);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let evY = 196;
  events.slice(0, 10).forEach((ev) => {
    const p = [...homePlayers, ...awayPlayers].find((pl) => pl.id === ev.playerId);
    const t = ev.teamId === homeTeam.id ? homeTeam.shortName : awayTeam.shortName;
    doc.text(`${ev.minute}' - [${t}] ${ev.type}: ${p?.fullName || 'Jogador'} ${ev.reason ? `(${ev.reason})` : ''}`, 18, evY);
    evY += 5;
  });

  // Signatures
  doc.line(20, 275, 80, 275);
  doc.text('Assinatura do Árbitro', 30, 280);

  doc.line(130, 275, 190, 275);
  doc.text('Representante de Mesa', 140, 280);

  doc.save(`Sumula_${homeTeam.shortName}_x_${awayTeam.shortName}_${match.date}.pdf`);
}

export function generateStandingsPdf(championship: Championship, standings: StandingRow[]) {
  const doc = new jsPDF();

  doc.setFillColor(16, 185, 129); // Emerald
  doc.rect(0, 0, 210, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(championship.name.toUpperCase(), 105, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.text('TABELA OFICIAL DE CLASSIFICAÇÃO', 105, 19, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  // Header row
  doc.setFillColor(241, 245, 249);
  doc.rect(12, 35, 186, 8, 'F');
  doc.text('POS', 15, 40);
  doc.text('EQUIPE', 30, 40);
  doc.text('P', 110, 40);
  doc.text('J', 122, 40);
  doc.text('V', 134, 40);
  doc.text('E', 146, 40);
  doc.text('D', 158, 40);
  doc.text('GP', 170, 40);
  doc.text('GC', 182, 40);
  doc.text('SG', 194, 40);

  let y = 48;
  doc.setFont('helvetica', 'normal');
  standings.forEach((row) => {
    doc.text(`${row.position}º`, 15, y);
    doc.text(`${row.teamName}`, 30, y);
    doc.text(`${row.points}`, 110, y);
    doc.text(`${row.played}`, 122, y);
    doc.text(`${row.won}`, 134, y);
    doc.text(`${row.drawn}`, 146, y);
    doc.text(`${row.lost}`, 158, y);
    doc.text(`${row.goalsFor}`, 170, y);
    doc.text(`${row.goalsAgainst}`, 182, y);
    doc.text(`${row.goalDifference}`, 194, y);

    doc.line(12, y + 2, 198, y + 2);
    y += 7;
  });

  doc.save(`Classificacao_${championship.slug}.pdf`);
}
