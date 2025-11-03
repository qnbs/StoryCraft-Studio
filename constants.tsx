import { Template } from './types';

export const ICONS = {
  DASHBOARD: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 20.875v-7.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  TEMPLATES: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
  OUTLINE: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  CHARACTERS: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
  WORLD: <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.024.217 1.463l-.67.89a1.125 1.125 0 01-1.628.16l-1.068-.89a.453.453 0 00-.405-.082l-.67.448 1.125.864a1.125 1.125 0 010 1.848l-1.125.864-.67.448a.453.453 0 00-.405-.082l-1.068-.89a1.125 1.125 0 01-.16-1.628l.89-.67c.44-.32.536-1.024-.217-1.463l-.89-1.068a.453.453 0 00-.864-.405l-.568.254v.568c0 .334-.148.65-.405.864l-1.068.89c-.442.369-.535 1.024-.217 1.463l.67.89a1.125 1.125 0 011.628.16l1.068-.89a.453.453 0 00.405.082l.67-.448-1.125-.864a1.125 1.125 0 010-1.848l1.125-.864.67-.448a.453.453 0 00.405.082l1.068.89a1.125 1.125 0 01.16 1.628l-.89.67c-.44.32-.536-1.024-.217-1.463l.89 1.068a.453.453 0 00.864.405l.568-.254V12a1.125 1.125 0 011.125-1.125h2.252c.414 0 .75.336.75.75l.01 6a.75.75 0 01-.75.75h-2.252a1.125 1.125 0 01-1.125-1.125V3.03zM6.375 21v-3.03c0-.334.148-.65.405-.864l1.068-.89c.442-.369.535-1.024.217-1.463l-.67-.89a1.125 1.125 0 01-1.628-.16l-1.068.89a.453.453 0 00-.405.082l-.67.448 1.125.864a1.125 1.125 0 010 1.848l-1.125.864-.67.448a.453.453 0 00-.405.082l-1.068-.89a1.125 1.125 0 01-.16-1.628l.89-.67c.44-.32.536-1.024-.217-1.463l-.89-1.068a.453.453 0 00-.864-.405l-.568.254V18a1.125 1.125 0 01-1.125 1.125H.752a.75.75 0 01-.75-.75l-.01-6a.75.75 0 01.75-.75h2.252a1.125 1.125 0 011.125 1.125v12.97z" />,
  WRITER: <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
  EXPORT: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
  SPARKLES: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 13.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 18l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 18l1.036-.259a3.375 3.375 0 002.456-2.456L18 13.25z" />,
  ADD: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  TRASH: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />,
  SETTINGS: <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.002 1.11-1.226M10.343 3.94v2.404c0 .362-.234.69-.57.84-1.33.66-2.483 1.69-3.31 2.94-.37.49-.68.99-.95 1.51-.55 1.02-.9 2.15-.9 3.32 0 1.21.35 2.34.95 3.37.27.52.58 1.02.95 1.51.83 1.25 1.98 2.28 3.31 2.94.34.15.57.48.57.84v2.404M15.06 20.06c-.09.542-.56 1.002-1.11 1.226m1.11-1.226v-2.404c0-.362.234-.69.57-.84 1.33-.66 2.483-1.69 3.31-2.94.37-.49.68-.99.95-1.51.55-1.02.9-2.15.9-3.32 0-1.21-.35-2.34-.95-3.37a6.93 6.93 0 00-.95-1.51c-.83-1.25-1.98-2.28-3.31-2.94a1.12 1.12 0 00-.57-.84V3.94M15.06 20.06c.63.26 1.28.43 1.97.52M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />,
  HELP: <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />,
  MENU: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
};

export const STORY_TEMPLATES: Template[] = [
  {
    id: 'three-act',
    name: 'Three-Act Structure',
    description: 'A classic model for narrative fiction that divides a story into three parts: Setup, Confrontation, and Resolution.',
    type: 'Structure',
    sections: [
      { title: 'Act I: The Setup' },
      { title: 'Inciting Incident' },
      { title: 'Rising Action (Part 1)' },
      { title: 'Act II: The Confrontation' },
      { title: 'Midpoint' },
      { title: 'Rising Action (Part 2)' },
      { title: 'Climax' },
      { title: 'Act III: The Resolution' },
      { title: 'Falling Action' },
      { title: 'Final Resolution' },
    ]
  },
  {
    id: 'heros-journey',
    name: "The Hero's Journey",
    description: "A common template that involves a hero who goes on an adventure, wins a victory in a decisive crisis, and comes home changed.",
    type: 'Structure',
    sections: [
      { title: 'The Ordinary World' },
      { title: 'The Call to Adventure' },
      { title: 'Refusal of the Call' },
      { title: 'Meeting the Mentor' },
      { title: 'Crossing the Threshold' },
      { title: 'Tests, Allies, and Enemies' },
      { title: 'Approach to the Inmost Cave' },
      { title: 'The Ordeal' },
      { title: 'The Reward' },
      { title: 'The Road Back' },
      { title: 'The Resurrection' },
      { title: 'Return with the Elixir' },
    ]
  },
  {
    id: 'murder-mystery',
    name: 'Murder Mystery',
    description: "A plot centered around a murder that a protagonist must solve. Includes clues, red herrings, and suspects.",
    type: 'Genre',
    sections: [
      { title: 'The Discovery of the Body' },
      { title: 'The Lead Detective Arrives' },
      { title: 'First Round of Suspects' },
      { title: 'The First Major Clue' },
      { title: 'A Red Herring' },
      { title: 'A Second Victim?' },
      { title: 'The Detective\'s "Aha!" Moment' },
      { title: 'The Confrontation with the Killer' },
      { title: 'The Killer\'s Motive Revealed' },
      { title: 'Justice is Served' },
    ]
  },
   {
    id: 'space-opera',
    name: 'Space Opera',
    description: "A grand, adventurous story set in space, involving conflict, romance, and futuristic technology.",
    type: 'Genre',
    sections: [
      { title: 'Opening Shot of a Starship' },
      { title: 'A Desperate Message' },
      { title: 'The Cynical Smuggler / Pilot' },
      { title: 'Escape from an Oppressive Regime' },
      { title: 'Journey to a Strange New World' },
      { title: 'The Ancient Alien Secret' },
      { title: 'The Empire Strikes' },
      { title: 'A Dogfight in the Asteroid Belt' },
      { title: 'The Superweapon is Revealed' },
      { title: 'The Final Assault' },
      { title: 'A New Hope for the Galaxy' },
    ]
  },
];