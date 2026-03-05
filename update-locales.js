const fs = require('fs');
const path = require('path');

const newTemplatesEn = {
  "fantasy": {
    "name": "Epic Fantasy",
    "description": "A classic structure for high fantasy, focusing on world-building, magical discovery, and saving the realm.",
    "arc": "The protagonist discovers a magical world/power, faces a dark lord/ancient evil, and must rally allies for a final battle.",
    "sections": {
      "1": "The Ordinary World & The Call to Adventure",
      "2": "Refusal, Mentor & Departure",
      "3": "Crossing the Threshold & Entering the Magical Realm",
      "4": "Trials, Allies, and Enemies",
      "5": "Approach to the Inmost Cave",
      "6": "The Ordeal",
      "7": "Reward (Seizing the Sword)",
      "8": "The Road Back",
      "9": "Resurrection & Final Battle",
      "10": "Return with the Elixir & New Equilibrium"
    }
  },
  "thriller": {
    "name": "Suspense Thriller",
    "description": "Fast-paced outline designed for thrillers and action stories, maximizing tension and stakes.",
    "arc": "The protagonist is thrust into a dangerous situation, uncovers a conspiracy, and races against time to stop the antagonist.",
    "sections": {
      "1": "The Hook & Inciting Incident",
      "2": "The Threat is Revealed",
      "3": "Point of No Return",
      "4": "Rising Action & False Leads",
      "5": "Midpoint: The Stakes are Raised",
      "6": "The Enemy Closing In",
      "7": "All is Lost (The Low Point)",
      "8": "The Final Revelation",
      "9": "The Climax & Confrontation",
      "10": "The Aftermath & Resolution"
    }
  },
  "romance": {
    "name": "Classic Romance",
    "description": "A template focusing on relationship development, emotional stakes, and the classical happily-ever-after.",
    "arc": "Two characters meet, face obstacles keeping them apart, grow together, and finally commit to each other.",
    "sections": {
      "1": "The Meet Cute",
      "2": "The Reluctance or Refusal",
      "3": "Forced Together",
      "4": "Developing Connection",
      "5": "Midpoint: The Kiss/Confession",
      "6": "Rising Doubts & External Conflicts",
      "7": "The Black Moment (The Breakup)",
      "8": "The Epiphany",
      "9": "The Grand Gesture",
      "10": "Happily Ever After (Resolution)"
    }
  },
  "mystery": {
    "name": "Murder Mystery / Crime",
    "description": "A structured approach to writing mysteries with clues, red herrings, and a satisfying reveal.",
    "arc": "A crime is committed, an investigator follows the clues, faces dead ends, and finally uncovers the truth.",
    "sections": {
      "1": "The Crime is Discovered",
      "2": "The Investigator Enters",
      "3": "Initial Suspects & Clues",
      "4": "The Investigation Deepens",
      "5": "A Twist or Second Crime (Midpoint)",
      "6": "Red Herrings & False Leads",
      "7": "The Dead End (All is Lost)",
      "8": "The Missing Piece",
      "9": "The Big Reveal & Confrontation",
      "10": "Justice Served (Resolution)"
    }
  },
  "scifi": {
    "name": "Sci-Fi Adventure",
    "description": "Designed for science fiction stories, focusing on technological premises, exploration, and philosophical themes.",
    "arc": "A technological or scientific disruption occurs, forcing the protagonist to adapt, survive, and confront the consequences.",
    "sections": {
      "1": "The Status Quo & The Disruption",
      "2": "The Scientific Discovery/Anomaly",
      "3": "Leaving the Known Behind",
      "4": "Exploring the Unknown (Systems & Rules)",
      "5": "The Shift in Paradigm (Midpoint)",
      "6": "Unintended Consequences",
      "7": "The System Collapse (All is Lost)",
      "8": "The Ingenious Solution",
      "9": "The Final Test",
      "10": "A New Reality (Resolution)"
    }
  }
};

const newTagsEn = {
  "tags.fantasy": "Fantasy",
  "tags.worldbuilding": "Worldbuilding",
  "tags.magic": "Magic",
  "tags.thriller": "Thriller",
  "tags.suspense": "Suspense",
  "tags.fastPaced": "Fast Paced",
  "tags.romance": "Romance",
  "tags.characterDriven": "Character Driven",
  "tags.emotional": "Emotional",
  "tags.mystery": "Mystery",
  "tags.crime": "Crime",
  "tags.puzzle": "Puzzle",
  "tags.scifi": "Sci-Fi",
  "tags.technology": "Technology",
  "tags.future": "Future"
};

const newTemplatesDe = {
  "fantasy": {
    "name": "Epische Fantasy",
    "description": "Eine klassische Struktur für High Fantasy mit Fokus auf Weltenbau, Magie und die Rettung des Reiches.",
    "arc": "Der Protagonist entdeckt eine magische Welt/Kraft, stellt sich einem dunklen Lord und versammelt Verbündete für die finale Schlacht.",
    "sections": {
      "1": "Die gewohnte Welt & Der Ruf zum Abenteuer",
      "2": "Weigerung, Mentor & Aufbruch",
      "3": "Überschreiten der ersten Schwelle",
      "4": "Prüfungen, Verbündete und Feinde",
      "5": "Vordringen zur tiefsten Höhle",
      "6": "Die entscheidende Prüfung",
      "7": "Belohnung (Ergreifen des Schwertes)",
      "8": "Der Rückweg",
      "9": "Auferstehung & Finale Schlacht",
      "10": "Rückkehr mit dem Elixier"
    }
  },
  "thriller": {
    "name": "Spannungs-Thriller",
    "description": "Schnelle Outline für Thriller und Action. Maximiert die Spannung.",
    "arc": "Der Protagonist gerät in Gefahr, deckt eine Verschwörung auf und kämpft gegen die Zeit.",
    "sections": {
      "1": "Der Hook & Auslösendes Ereignis",
      "2": "Die Bedrohung wird offenbart",
      "3": "Point of No Return",
      "4": "Steigende Handlung & Falsche Fährten",
      "5": "Midpoint: Die Einsätze steigen",
      "6": "Der Feind rückt näher",
      "7": "Alles ist verloren",
      "8": "Die letzte Offenbarung",
      "9": "Climax & Konfrontation",
      "10": "Nachwirkungen & Auflösung"
    }
  },
  "romance": {
    "name": "Klassische Romanze",
    "description": "Eine Vorlage für Liebesromane, fokussiert auf emotionale Entwicklung.",
    "arc": "Zwei Charaktere treffen sich, überwinden Hindernisse und finden zueinander.",
    "sections": {
      "1": "Das erste Treffen (Meet Cute)",
      "2": "Widerwillen oder Ablehnung",
      "3": "Dazu gezwungen",
      "4": "Wachsende Verbindung",
      "5": "Midpoint: Der Kuss/Das Geständnis",
      "6": "Zweifel & Äußere Konflikte",
      "7": "Der dunkle Moment (Die Trennung)",
      "8": "Die Erleuchtung",
      "9": "Die große Geste",
      "10": "Happy End"
    }
  },
  "mystery": {
    "name": "Krimi / Mystery",
    "description": "Struktur für Kriminalromane mit Hinweisen und falschen Fährten.",
    "arc": "Ein Verbrechen geschieht, ein Ermittler sucht nach der Wahrheit.",
    "sections": {
      "1": "Das Verbrechen wird entdeckt",
      "2": "Der Ermittler übernimmt",
      "3": "Erste Verdächtige & Hinweise",
      "4": "Die Ermittlung vertieft sich",
      "5": "Ein Twist (Midpoint)",
      "6": "Falsche Fährten (Red Herrings)",
      "7": "Die Sackgasse (Alles scheint verloren)",
      "8": "Das fehlende Puzzleteil",
      "9": "Die große Enthüllung",
      "10": "Gerechtigkeit (Auflösung)"
    }
  },
  "scifi": {
    "name": "Sci-Fi Abenteuer",
    "description": "Für Science-Fiction mit Fokus auf technologische Prämissen und Entdeckungen.",
    "arc": "Eine technologische Störung zwingt den Protagonisten, sich anzupassen.",
    "sections": {
      "1": "Status Quo & Die Störung",
      "2": "Wissenschaftliche Entdeckung/Anomalie",
      "3": "Das Bekannte hinter sich lassen",
      "4": "Das Unbekannte erforschen",
      "5": "Paradigmenwechsel (Midpoint)",
      "6": "Unbeabsichtigte Konsequenzen",
      "7": "Zusammenbruch des Systems",
      "8": "Die geniale Lösung",
      "9": "Der finale Test",
      "10": "Eine neue Realität"
    }
  }
};

const newTagsDe = {
  "tags.fantasy": "Fantasy",
  "tags.worldbuilding": "Weltenbau",
  "tags.magic": "Magie",
  "tags.thriller": "Thriller",
  "tags.suspense": "Spannung",
  "tags.fastPaced": "Tempo",
  "tags.romance": "Romanze",
  "tags.characterDriven": "Charakterbasiert",
  "tags.emotional": "Emotional",
  "tags.mystery": "Krimi",
  "tags.crime": "Verbrechen",
  "tags.puzzle": "Rätsel",
  "tags.scifi": "Sci-Fi",
  "tags.technology": "Technologie",
  "tags.future": "Zukunft"
};

['en', 'de', 'fr', 'es', 'it'].forEach(lang => {
  const isDe = lang === 'de';
  const tmplData = isDe ? newTemplatesDe : newTemplatesEn;
  const tagsData = isDe ? newTagsDe : newTagsEn;

  // Update templates.json
  const tFile = \`locales/\${lang}/templates.json\`;
  if (fs.existsSync(tFile)) {
    const data = JSON.parse(fs.readFileSync(tFile, 'utf8'));
    data.templates = { ...data.templates, ...tmplData };
    fs.writeFileSync(tFile, JSON.stringify(data, null, 2));
  }

  // Update tags.json
  const tgFile = \`locales/\${lang}/tags.json\`;
  if (fs.existsSync(tgFile)) {
    const data = JSON.parse(fs.readFileSync(tgFile, 'utf8'));
    for(const [k, v] of Object.entries(tagsData)) {
      data[k.replace('tags.', '')] = v;
    }
    fs.writeFileSync(tgFile, JSON.stringify(data, null, 2));
  }
});
console.log("Updated locales.");
