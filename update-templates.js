const fs = require('fs');

const constantsPath = 'constants.tsx';
let constants = fs.readFileSync(constantsPath, 'utf8');

const newTemplates = `
  {
    id: 'genre-fantasy',
    name: "templates.fantasy.name",
    description: "templates.fantasy.description",
    type: 'Genre',
    tags: ['tags.fantasy', 'tags.worldbuilding', 'tags.magic'],
    arcDescription: 'templates.fantasy.arc',
    sections: [
      { titleKey: 'templates.fantasy.sections.1' }, { titleKey: 'templates.fantasy.sections.2' },
      { titleKey: 'templates.fantasy.sections.3' }, { titleKey: 'templates.fantasy.sections.4' },
      { titleKey: 'templates.fantasy.sections.5' }, { titleKey: 'templates.fantasy.sections.6' },
      { titleKey: 'templates.fantasy.sections.7' }, { titleKey: 'templates.fantasy.sections.8' },
      { titleKey: 'templates.fantasy.sections.9' }, { titleKey: 'templates.fantasy.sections.10' }
    ]
  },
  {
    id: 'genre-thriller',
    name: "templates.thriller.name",
    description: "templates.thriller.description",
    type: 'Genre',
    tags: ['tags.thriller', 'tags.suspense', 'tags.fastPaced'],
    arcDescription: 'templates.thriller.arc',
    sections: [
      { titleKey: 'templates.thriller.sections.1' }, { titleKey: 'templates.thriller.sections.2' },
      { titleKey: 'templates.thriller.sections.3' }, { titleKey: 'templates.thriller.sections.4' },
      { titleKey: 'templates.thriller.sections.5' }, { titleKey: 'templates.thriller.sections.6' },
      { titleKey: 'templates.thriller.sections.7' }, { titleKey: 'templates.thriller.sections.8' },
      { titleKey: 'templates.thriller.sections.9' }, { titleKey: 'templates.thriller.sections.10' }
    ]
  },
  {
    id: 'genre-romance',
    name: "templates.romance.name",
    description: "templates.romance.description",
    type: 'Genre',
    tags: ['tags.romance', 'tags.characterDriven', 'tags.emotional'],
    arcDescription: 'templates.romance.arc',
    sections: [
      { titleKey: 'templates.romance.sections.1' }, { titleKey: 'templates.romance.sections.2' },
      { titleKey: 'templates.romance.sections.3' }, { titleKey: 'templates.romance.sections.4' },
      { titleKey: 'templates.romance.sections.5' }, { titleKey: 'templates.romance.sections.6' },
      { titleKey: 'templates.romance.sections.7' }, { titleKey: 'templates.romance.sections.8' },
      { titleKey: 'templates.romance.sections.9' }, { titleKey: 'templates.romance.sections.10' }
    ]
  },
  {
    id: 'genre-mystery',
    name: "templates.mystery.name",
    description: "templates.mystery.description",
    type: 'Genre',
    tags: ['tags.mystery', 'tags.crime', 'tags.puzzle'],
    arcDescription: 'templates.mystery.arc',
    sections: [
      { titleKey: 'templates.mystery.sections.1' }, { titleKey: 'templates.mystery.sections.2' },
      { titleKey: 'templates.mystery.sections.3' }, { titleKey: 'templates.mystery.sections.4' },
      { titleKey: 'templates.mystery.sections.5' }, { titleKey: 'templates.mystery.sections.6' },
      { titleKey: 'templates.mystery.sections.7' }, { titleKey: 'templates.mystery.sections.8' },
      { titleKey: 'templates.mystery.sections.9' }, { titleKey: 'templates.mystery.sections.10' }
    ]
  },
  {
    id: 'genre-scifi',
    name: "templates.scifi.name",
    description: "templates.scifi.description",
    type: 'Genre',
    tags: ['tags.scifi', 'tags.technology', 'tags.future'],
    arcDescription: 'templates.scifi.arc',
    sections: [
      { titleKey: 'templates.scifi.sections.1' }, { titleKey: 'templates.scifi.sections.2' },
      { titleKey: 'templates.scifi.sections.3' }, { titleKey: 'templates.scifi.sections.4' },
      { titleKey: 'templates.scifi.sections.5' }, { titleKey: 'templates.scifi.sections.6' },
      { titleKey: 'templates.scifi.sections.7' }, { titleKey: 'templates.scifi.sections.8' },
      { titleKey: 'templates.scifi.sections.9' }, { titleKey: 'templates.scifi.sections.10' }
    ]
  }
];`;

constants = constants.replace("];", newTemplates);
fs.writeFileSync(constantsPath, constants);
console.log("Updated constants.tsx");
