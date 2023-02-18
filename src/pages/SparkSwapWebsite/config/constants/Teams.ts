import { ITeams, TeamsConfig } from "./types";

const developers: ITeams[] = [
  {
    name: 'Mat Ivan Arquero',
    position: 'TECHNICAL DIRECTOR',
    image: 'Mat',
    linkedinlink: 'mat-ivan-arquero-311b15211'
  },
  {
    name: 'Aldrick Bonaobra',
    position: 'SENIOR BLOCKCHAIN DEVELOPER',
    image: 'Aldrick',
    linkedinlink: 'aldrickb'
  },
  {
    name: 'Medard Mandane',
    position: 'LEAD BACKEND DEVELOPER',
    image: 'Medard',
    linkedinlink: 'medardm'
  },
  {
    name: 'Jan Balbin',
    position: 'QA SPECIALIST',
    image: 'Balbz',
    linkedinlink: 'john-anthony-balbin-802501144'
  },
  {
    name: 'Koji Adriano',
    position: 'FULL STACK DEVELOPER',
    image: 'Koji',
    linkedinlink: 'koji-adriano'
  },
  {
    name: 'Shanie Polagñe',
    position: 'UI & UX DESIGNER',
    image: 'Shanie',
    linkedinlink: 'spolagne'
  },
]

const advisors: ITeams[] = [
  {
    name: 'Andy Agnas',
    position: 'ADVISOR',
    image: 'Andy',
    linkedinlink: 'andrino-agnas-2473a3158'
  },
  {
    name: 'Rico Zuñiga',
    position: 'ADVISOR',
    image: 'Rico',
    linkedinlink: 'ricoz'
  }
];

const TeamData: TeamsConfig = {
  'developers':developers,
  'advisors': advisors
}


export default TeamData;
