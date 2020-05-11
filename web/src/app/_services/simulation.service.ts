import { Injectable } from '@angular/core';
import { randomInt } from '../_helpers/utils';

export class Location {
  constructor(public x: number, public y: number) {}
  equals(l2: Location): boolean {
    return (l2) && this.equalsTo(l2.x, l2.y);
  }
  equalsTo(x: number, y: number): boolean {
    return (x === this.x) && (y === this.y);
  }
  toString() {
    return `(${this.x},${this.y})`;
  }
}

export interface Individual {name: string; locations: Location[]; infectedTime: number;}

export interface TimeSlot {time: number; day: number; slotInDay: number; }

export class Simulation {
  timeSlots: TimeSlot[];
  individuals: Individual[];

  constructor(
    private _nbTimeSlotsPerDay: number,
    private _durationInDays: number,
    private _areaSideSize: number,
    private _peopleNames: string[]
  ) {
    this.timeSlots = this.createTimeSlots();
    this.individuals = this.createIndividuals();
    for (let i = 0; i < this.peopleNames.length - 1; i++) {
      this.individuals[i + 1].locations[i].x = this.individuals[i].locations[i].x;
      this.individuals[i + 1].locations[i].y = this.individuals[i].locations[i].y;
    }
  }

  public get nbTimeSlotsPerDay() {
    return this._nbTimeSlotsPerDay;
  }

  public get durationInDays() {
    return this._durationInDays;
  }

  public get areaSideSize() {
    return this._areaSideSize;
  }

  public get peopleNames() {
    return this._peopleNames;
  }

  public get nbTimeSlots(): number {
    return this.nbTimeSlotsPerDay * this.durationInDays;
  }

  createTimeSlots(): TimeSlot[] {
    const timeSlots = [];
    for (let d = 0; d < this.durationInDays; d++) {
      for (let s = 0; s < this.nbTimeSlotsPerDay; s++) {
        const t = s + d * this.nbTimeSlotsPerDay;
        const timeSlot = { time: t, day: d, slotInDay: s };
        timeSlots.push(timeSlot);
      }
    }
    return timeSlots;
  }

  createIndividuals(): Individual[] {
    const individuals = [];
    for (let person of this.peopleNames) {
      const individual = {
        name: person,
        locations: [],
        infectedTime: -1
      };
      let location = new Location(
        randomInt(0, this.areaSideSize),
        randomInt(0, this.areaSideSize)
        // Math.floor(this.areaSideSize/2),
        // Math.floor(this.areaSideSize/2)
      );
      for (let t = 0; t < this.nbTimeSlots; t++) {
        individual.locations.push(location);
        const moveX = randomInt(-1, 2); // return -1 or 0 or +1
        const moveY = randomInt(-1, 2); // return -1 or 0 or +1
        location = new Location(
          Math.max(0, Math.min(location.x + moveX, this.areaSideSize - 1)),
          Math.max(0, Math.min(location.y + moveY, this.areaSideSize - 1))
        );
      }
      individuals.push(individual);
    }
    return individuals;
  }

  private createIntArray(start: number, nbElem: number): number[] {
    const table = []
    for (let i = start; i < start + nbElem; i++) {
      table.push(i);
    }
    return table;
  }

  public get allX(): number[] {
    return this.createIntArray(0, this.areaSideSize);
  }

  public get allY(): number[] {
    return this.createIntArray(0, this.areaSideSize);
  }

  public get allDays(): number[] {
    return this.createIntArray(0, this.durationInDays);
  }

  public get allSlotsInDay(): number[] {
    return this.createIntArray(0, this.nbTimeSlotsPerDay);
  }

  detectContact(timeSlot: TimeSlot): {individual1: Individual, individual2: Individual}[] {
    let contacts = [];
    for (let i = 0; i < this.individuals.length - 1; i++) {
      for (let j = i + 1; j < this.individuals.length; j++) {
        if (this.individuals[i].locations[timeSlot.time].equals(this.individuals[j].locations[timeSlot.time])) {
          contacts.push({individual1: this.individuals[i], individual2: this.individuals[j]});
        }
      }
    }
    return contacts;
  }

}

export class GlobalInfectionRecord {

  infectedLocationsPerTime: Location[][];

  constructor(
    private simulation: Simulation,
    private _incubationPeriodInDays: number
  ) {
    this.refresh();
  }

  public get incubationPeriod() {
    return this._incubationPeriodInDays;
  }

  refresh() {
    this.infectedLocationsPerTime = [];
    for (let timeSlot of this.simulation.timeSlots) {
      const locations = [];
      for (let individual of this.simulation.individuals) {
        if (individual.infectedTime >= 0) {
          const infectedDay = Math.floor(individual.infectedTime / this.simulation.nbTimeSlotsPerDay);
          if (timeSlot.day >= infectedDay - this.incubationPeriod) {
            const location = individual.locations[timeSlot.time];
            let included = false;
            for (const l of locations) {
              if (l.equals(location)) {
                included = true;
                break;
              }
            }
            if (!included) {
              locations.push(location);
            }
          }
        }
      }
      this.infectedLocationsPerTime.push(locations);
    }
  }

  computeNbInfectedContacts(individual: Individual, timeSlot: TimeSlot): number {
    let nbContacts = 0;
    // compute intersection between individual record and the global one
    const indivLocation = individual.locations[timeSlot.time];
    for (const  location of this.infectedLocationsPerTime[timeSlot.time]) {
      if (location.equals(indivLocation)) {
        // console.log("without priv contact at time", timeSlot.time, "location", location);
        nbContacts++;
      }
    }
    return nbContacts;
  }

  isInfected(time: number, x: number, y: number): boolean {
    for (const location of this.infectedLocationsPerTime[time]) {
      if (location.equalsTo(x, y)) {
        return true;
      }
    }
    return false;
  }

}

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  constructor() { }

  createSimulation(
    nbTimeSlotsPerDay: number,
    durationInDays: number,
    areaSideSize: number,
    peopleNames: string[]
  ) {
    const simulation = new Simulation(
      nbTimeSlotsPerDay,
      durationInDays,
      areaSideSize,
      peopleNames
    );
    return simulation;
  }

}
