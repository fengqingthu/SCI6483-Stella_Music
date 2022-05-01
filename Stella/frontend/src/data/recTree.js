class Song {
  constructor(name, children) {
    this.name = name;
    this.children = children;
  }
}
const HappierThanEver = new Song("Happier Than ever", []);
const Insominia = new Song("Insominia", [HappierThanEver]);
const DayTripper = new Song("Day Tripper", []);
const SolidStateSurvivor = new Song("Solid State Survivor", []);

const IRanOutOfSongNames = new Song("I Ran Out Of Song Names", []);
const HarderBetterFasterStronger = new Song(
  "Harder, Better, Faster, Stronger",
  []
);

const AbsoluteEgoDance = new Song("Absolute Ego Dance", [IRanOutOfSongNames]);
const Rydeen = new Song("Rydeen", [
  SolidStateSurvivor,
  HarderBetterFasterStronger,
]);
const Castalia = new Song("Castalia", [Insominia, DayTripper]);

const Technopolis = new Song("Technopolis", [
  AbsoluteEgoDance,
  Rydeen,
  Castalia,
]);

const Songs = [
  Technopolis,
  AbsoluteEgoDance,
  Rydeen,
  Castalia,
  Insominia,
  DayTripper,
  SolidStateSurvivor,
  HarderBetterFasterStronger,
  IRanOutOfSongNames,
  HappierThanEver,
];

export default Songs;
