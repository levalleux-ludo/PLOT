import { Component, OnInit } from '@angular/core';
import { randomInt } from 'src/app/_helpers/utils';
import { returnOrFallthrough } from '@clr/core/common';
import { assertNotNull } from '@angular/compiler/src/output/output_ast';
import { BloomFilter } from 'bloomfilter';
import { buildMapFromList } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { SimulationService, Individual, TimeSlot, GlobalInfectionRecord, Simulation } from 'src/app/_services/simulation.service';
import { PrivacyService, BloomedGlobalRecord, BloomedLocationRecord } from 'src/app/_services/privacy.service';



// class Location {
//   constructor(public x: number, public y: number) {}
//   equals(l2: Location): boolean {
//     return (l2) && this.equalsTo(l2.x, l2.y);
//   }
//   equalsTo(x: number, y: number): boolean {
//     return (x === this.x) && (y === this.y);
//   }
//   toString() {
//     return `(${this.x},${this.y})`;
//   }
// }

// interface Individual {name: string; locations: Location[]; infectedTime: number;}

// interface TimeSlot {time: number; day: number; slotInDay: number; locations: Location[]; }


// function md_convert(time: number, x: number, y: number): number {
//   if (time >= 2 ** 8) {
//     throw new Error('Overflow on time value' + time);
//   }
//   if (x >= 2 ** 12) {
//     throw new Error('Overflow on x value' + x);
//   }
//   if (y >= 2 ** 12) {
//     throw new Error('Overflow on y value' + y);
//   }
//   // tslint:disable-next-line: no-bitwise
//   return (x << 20) + (y << 8) + time;
// }

// function md_parse(n: number): {time: number, x: number, y: number} {
//   // tslint:disable-next-line: no-bitwise
//   const time = n & 0xFF;
//   // tslint:disable-next-line: no-bitwise
//   const y = (n & 0xFFF00) >> 8;
//   // tslint:disable-next-line: no-bitwise
//   const x = (n & 0xFFF00000) >> 20;
//   return {time, x, y};
// }
@Component({
  selector: 'app-simulation1',
  templateUrl: './simulation1.component.html',
  styleUrls: ['./simulation1.component.scss'],
  host: {
    '[class.dox-content-panel]': 'true',
    '[class.content-area]': 'true'
  }
})
export class Simulation1Component implements OnInit {

  nbTimeSlotsPerDay = 1;
  nbOfDays = 5;
  areaSideSize = 2;
  incubationPeriod = 3;
  people = ['Alice', 'Bob', 'Charlie', 'Denise', 'Edward'];

  // people = ['Alice', 'Bob'];

  md_globalInfectionReport: Map<number, number[]> = new Map();

  bloomSize = 256;

  simulation: Simulation;

  globalInfectionReport: GlobalInfectionRecord;

  bloomGlobalRecord: BloomedGlobalRecord;

  bloomedRecordPerIndividual: Map<string, BloomedLocationRecord> = new Map();

  constructor(
    private simulationService: SimulationService,
    private privacyService: PrivacyService
  ) { }

  ngOnInit(): void {
    this.simulation = this.simulationService.createSimulation(
      this.nbTimeSlotsPerDay,
      this.nbOfDays,
      this.areaSideSize,
      this.people
    );
    this.globalInfectionReport = new GlobalInfectionRecord(
      this.simulation,
      this.incubationPeriod
    );
    this.bloomGlobalRecord = new BloomedGlobalRecord(
      this.bloomSize,
      this.simulation
    );
  }

  public refreshSimulation() {
    this.simulation = this.simulationService.createSimulation(
      this.nbTimeSlotsPerDay,
      this.nbOfDays,
      this.areaSideSize,
      this.people
    );
    this.refreshGlobalinfectionReport();
  }

  whenHere(individual: Individual, x: number, y: number): string {
    let when = '';
    for (let timeSlot = 0; timeSlot < this.simulation.nbTimeSlots; timeSlot++) {
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
    for (let timeSlot = 0; timeSlot < this.simulation.nbTimeSlots; timeSlot++) {
      if ( individual.locations[timeSlot].equalsTo(x, y) ) {
          return true ;
      }
    }
    return false;
  }

  whoIsHere(t: number, x: number, y: number) {
    let who = '';
    for (const individual of this.simulation.individuals) {
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
    for (let timeSlot = 0; timeSlot < this.simulation.nbTimeSlots; timeSlot++) {
      if (timeSlot > 0) {
        record += '\n';
      }
      record += `${timeSlot}: ${individual.locations[timeSlot].toString()}`;
    }
    return record;
  }

  detectContact(timeSlot: TimeSlot): string {
    let contacts = '';
    for (const contact of this.simulation.detectContact(timeSlot)) {
      if (contacts !== '') {
        contacts += '\n';
      }
      contacts += contact.individual1.name[0] + '-' + contact.individual2.name[0];
    }
    return contacts;
  }

  getClassesForTable() {
    if (this.simulation.areaSideSize <= 4) {
      return "clr-col-6 clr-col-md-3 clr-col-lg-2 clr-col-xl-1";
    } else if (this.simulation.areaSideSize <= 6) {
      return "clr-col-xs-12 clr-col-sm-6 clr-col-md-4 clr-col-lg-3 clr-col-xl-2";
    }
    return "clr-col-12 clr-col-md-6 clr-col-lg-4 clr-col-xl-3";
  }

  onChecked(event, individual, timeSlot) {
    if (event.target.checked) {
      individual.infectedTime = timeSlot.time;
    } else if ((individual.infectedTime >= 0) && (individual.infectedTime < timeSlot.time)) {
      event.target.checked = true; // stay checked
      individual.infectedTime = timeSlot.time;
    } else {
      individual.infectedTime = -1;
    }
    this.refreshGlobalinfectionReport();
  }

  refreshGlobalinfectionReport() {
    this.bloomGlobalRecord = new BloomedGlobalRecord(
      this.bloomSize,
      this.simulation
    );
    for (const individual of this.simulation.individuals) {
      if (individual.infectedTime >= 0) {
        const indivBloomRecord = new BloomedLocationRecord(this.bloomSize, individual, this.simulation, this.incubationPeriod);
        this.bloomedRecordPerIndividual.set(individual.name, indivBloomRecord);
        this.bloomGlobalRecord.mergeIndividualRecord(indivBloomRecord);
      }
    }
    this.globalInfectionReport = new GlobalInfectionRecord(
      this.simulation,
      this.incubationPeriod
    );
    this.lastScore_bloom = new Map();
  }

  computeRisk(individual: Individual, timeSlot: TimeSlot): string {
    let nbContacts = this.globalInfectionReport.computeNbInfectedContacts(
      individual,
      timeSlot
    );
    if (nbContacts > 0) {
      return nbContacts.toString();
    }
    return '';
  }

  computeScore(individual: Individual, timeSlot: TimeSlot): string {
    let nbContacts = 0;
    for (let time = 0; time <= timeSlot.time; time++) {
      const day = Math.floor(time / this.nbTimeSlotsPerDay);
      const slotInDay = time - day * this.nbTimeSlotsPerDay;
      nbContacts += this.globalInfectionReport.computeNbInfectedContacts(
        individual,
        {time, day, slotInDay}
      );
    }
    if (nbContacts > 0) {
      return nbContacts.toString();
    }
    return '';
  }

  // computeRisk_md(individual: Individual, timeSlot: TimeSlot): string {
  //   let nbContacts = 0;
  //   const day = timeSlot.day;
  //   const dayInfectedLocations = this.md_globalInfectionReport.get(day);
  //   const maxSlot = timeSlot.slotInDay;
  //   for (let slot = 0; slot <= maxSlot; slot++) {
  //     const time = day * this.nbTimeSlotsPerDay + slot;
  //     const indivLocation = individual.locations[time];
  //     const md_value = md_convert(slot, indivLocation.x, indivLocation.y);
  //     if (dayInfectedLocations.includes(md_value)) {
  //       nbContacts++;
  //     }
  //   }
  //   if (nbContacts > 0) {
  //     return `(+${nbContacts})`;
  //   }
  //   return '';
  // }

  // computeScore_md(individual: Individual, timeSlot: TimeSlot): string {
  //   let nbContacts = 0;
  //   for (let time = 0; time <= timeSlot.time; time++) {
  //     const day = Math.floor(time / this.nbTimeSlotsPerDay);
  //     const slot = time - (day * this.nbTimeSlotsPerDay);
  //     const dayInfectedLocations = this.md_globalInfectionReport.get(day);
  //     const indivLocation = individual.locations[time];
  //     const md_value = md_convert(slot, indivLocation.x, indivLocation.y);
  //     if (dayInfectedLocations.includes(md_value)) {
  //       nbContacts++;
  //     }
  //   }
  //   if (nbContacts === 0) {
  //     return '';
  //   }
  //   return nbContacts.toString();
  // }

  isInfected(time: number, x: number, y: number) {
    return this.globalInfectionReport.isInfected(time, x, y);
  }

  public md_parse(md_val: number): string {
    const {slotInDay, x, y} = BloomedLocationRecord.md_parse(md_val);
    return `${slotInDay}:(${x},${y})`;
  }

  // public computeBloomForDay(day: number) {
  //   const bloom = new BloomFilter(32 * this.bloomSize, 16);
  //   const dayInfectedLocations = this.md_globalInfectionReport.get(day);
  //   for (const md_val of dayInfectedLocations) {
  //     bloom.add(md_val);
  //   }
  //   this.bloomPerDay.set(day, bloom);
  // }

  // public computeBlooms() {
  //   for (const day of this.simulation.allDays) {
  //     this.computeBloomForDay(day);
  //   }
  // }

  public serializeBloom(day: number) {
    const bloom = this.bloomGlobalRecord.globalBloomPerDay.get(day);
    if (bloom) {
      return JSON.stringify([].slice.call(bloom.buckets));
    }
    return '';
  }

  public serializedBloomSize(day: number): number {
    const bloom = this.bloomGlobalRecord.globalBloomPerDay.get(day);
    if (bloom) {
      return bloom.buckets.length;
    } else {
      return 0;
    }
  }

  computeScore_bloom(individual: Individual, timeSlot: TimeSlot): string {
    let nbContacts = this.bloomGlobalRecord.testIndividualRecordAtTime(
      individual,
      timeSlot,
      this.nbTimeSlotsPerDay
    );
    let lastScore = this.lastScore_bloom.get(individual.name);
    if (!lastScore) {
      lastScore = new Array(this.simulation.timeSlots.length).fill('');
      this.lastScore_bloom.set(individual.name, lastScore);
    }
    if (nbContacts === 0) {
      lastScore[timeSlot.time] = '';
      return '';
    }
    lastScore[timeSlot.time] = nbContacts.toString();
    return nbContacts.toString();
  }

  computeAllScore_bloom(individual: Individual) {
    const lastScore = [];
    for (let timeSlot of this.simulation.timeSlots) {
      lastScore.push(this.computeScore_bloom(individual, timeSlot));
    }
    this.lastScore_bloom.set(individual.name, lastScore);
  }

  lastScore_bloom: Map<string, string[]> = new Map();
  getLastScore_bloom(individual: Individual, timeSlot: TimeSlot): string {
    const lastScore = this.lastScore_bloom.get(individual.name);
    if (lastScore) {
      return lastScore[timeSlot.time];
    }
    return '';
  }

}
