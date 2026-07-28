export class Section {
  static COPYCAT = 0;

  constructor(lengthInSteps = 16) {
    this.sectionNotes = [];
    this.lengthInSteps = lengthInSteps;
    this.typeOfSection = 0;
    this.mustHitSection = true;
  }
}
