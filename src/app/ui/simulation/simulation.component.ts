import { Component, OnInit } from '@angular/core';
import { randomInt } from 'src/app/_helpers/utils';
import { returnOrFallthrough } from '@clr/core/common';

class Location {
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

interface Individual {name: string; locations: Location[]; infectedTime: number;}

interface TimeSlot {time: number; locations: Location[]; }

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
  host: {
    '[class.dox-content-panel]': 'true',
    '[class.content-area]': 'true'
  }
})
export class SimulationComponent implements OnInit {

  nbTimeSlots = 12;
  areaSideSize = 4;
  people = ['Alice', 'Bob', 'Charlie', 'Denise', 'Edward'];

  timeSlots: TimeSlot[] = this.createTimeSlots();

  individuals: Individual[] = this.createIndividuals();

  globalInfectionReport : {locations: Location[]}[] = [];

  constructor() { }

  ngOnInit(): void {
    this.refreshGlobalinfectionReport();
  }

  createTimeSlots(): TimeSlot[] {
    const timeSlots = [];
    for (let t = 0; t < this.nbTimeSlots; t++) {
      const timeSlot = { time: t, locations: [] };
      for (let y = 0; y < this.areaSideSize; y++) {
        const locationRow = [];
        for (let x = 0; x < this.areaSideSize; x++) {
          locationRow.push({
            location: 1 + x + this.areaSideSize * y
          });
        }
        timeSlot.locations.push(locationRow);
      }
      timeSlots.push(timeSlot);
    }
    return timeSlots;
  }

  createIndividuals(): Individual[] {
    const individuals = [];
    for (let person of this.people) {
      const individual = {
        name: person,
        locations: [],
        infectedTime: -1
      };
      let location = new Location(
        randomInt(0, this.areaSideSize),
        randomInt(0, this.areaSideSize)
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

  whenHere(individual: Individual, x: number, y: number): string {
    let when = '';
    for (let timeSlot = 0; timeSlot < this.nbTimeSlots; timeSlot++) {
      if ( individual.locations[timeSlot].equalsTo(x, y) ) {
        if (when !== '') {
          when += ',';
        }
        when += +timeSlot;
      }
    }
    return when;
  }

  isHere(individual: Individual, x: number, y: number): boolean {
    for (let timeSlot = 0; timeSlot < this.nbTimeSlots; timeSlot++) {
      if ( individual.locations[timeSlot].equalsTo(x, y) ) {
          return true ;
      }
    }
    return false;
  }

  whoIsHere(t: number, x: number, y: number) {
    let who = '';
    for (const individual of this.individuals) {
      if (individual.locations[t].equalsTo(x, y)) {
        if (who !== '') {
          who += ',';
        }
        who += individual.name[0];
      }
    }
    return who;
  }

  locationRecord(individual: Individual): string {
    let record = '';
    for (let timeSlot = 0; timeSlot < this.nbTimeSlots; timeSlot++) {
      if (timeSlot > 0) {
        record += '\n';
      }
      record += `${timeSlot}: ${individual.locations[timeSlot].toString()}`;
    }
    return record;
  }

  detectContact(timeSlot: TimeSlot): string {
    let contacts = '';
    // for (const location of timeSlot.locations) {
      for (let i = 0; i < this.individuals.length - 1; i++) {
        for (let j = i + 1; j < this.individuals.length; j++) {
          if (this.individuals[i].locations[timeSlot.time].equals(this.individuals[j].locations[timeSlot.time])) {
            if (contacts !== '') {
              contacts += '\n';
            }
            contacts += this.individuals[i].name[0] + "-" + this.individuals[j].name[0];
          }
        }
      }
    // }
    return contacts;
  }

  getClassesForTable() {
    if (this.areaSideSize <= 4) {
      return "clr-col-6 clr-col-md-3 clr-col-lg-2 clr-col-xl-1";
    } else if (this.areaSideSize <= 6) {
      return "clr-col-xs-12 clr-col-sm-6 clr-col-md-4 clr-col-lg-3 clr-col-xl-2";
    }
    return "clr-col-12 clr-col-md-6 clr-col-lg-4 clr-col-xl-3";
  }

  onChecked(checked, individual, timeSlot) {
    if (checked) {
      individual.infectedTime = timeSlot.time;
    } else {
      individual.infectedTime = -1;
    }
    this.refreshGlobalinfectionReport();
  }

  refreshGlobalinfectionReport() {
    this.globalInfectionReport = [];
    for (let timeSlot of this.timeSlots) {
      const locations = [];
      for (let individual of this.individuals) {
        if ((individual.infectedTime >= 0) && (individual.infectedTime <= timeSlot.time)) {
          locations.push(individual.locations[timeSlot.time]); // TODO: avoid duplicates
        }
      }
      this.globalInfectionReport.push({locations});
    }
  }

  getGlobalInfectionAtTime(time: number): string {
    let report = '';
    for (const location of this.globalInfectionReport[time].locations) {
      if (report !== '') {
        report += '\n';
      }
      report += location.toString();
    }
    return report;
  }

}
