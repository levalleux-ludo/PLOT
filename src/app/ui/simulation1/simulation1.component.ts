import { Component, OnInit } from '@angular/core';
import { randomInt } from 'src/app/_helpers/utils';
import { returnOrFallthrough } from '@clr/core/common';
import { assertNotNull } from '@angular/compiler/src/output/output_ast';
import { BloomFilter } from 'bloomfilter';
import { buildMapFromList } from '@angular/flex-layout/extended/typings/style/style-transforms';



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

interface TimeSlot {time: number; day: number; slotInDay: number; locations: Location[]; }


function md_convert(time: number, x: number, y: number): number {
  if (time >= 2 ** 8) {
    throw new Error('Overflow on time value' + time);
  }
  if (x >= 2 ** 12) {
    throw new Error('Overflow on x value' + x);
  }
  if (y >= 2 ** 12) {
    throw new Error('Overflow on y value' + y);
  }
  // tslint:disable-next-line: no-bitwise
  return (x << 20) + (y << 8) + time;
}

function md_parse(n: number): {time: number, x: number, y: number} {
  // tslint:disable-next-line: no-bitwise
  const time = n & 0xFF;
  // tslint:disable-next-line: no-bitwise
  const y = (n & 0xFFF00) >> 8;
  // tslint:disable-next-line: no-bitwise
  const x = (n & 0xFFF00000) >> 20;
  return {time, x, y};
}
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

  nbTimeSlotsPerDay = 2;
  nbOfDays = 5;
  areaSideSize = 5;
  incubationPeriod = 3;
  people = ['Alice', 'Bob', 'Charlie', 'Denise', 'Edward'];

  timeSlots: TimeSlot[] = this.createTimeSlots();

  individuals: Individual[] = this.createIndividuals();

  globalInfectionReport: {locations: Location[]}[] = [];

  md_globalInfectionReport: Map<number, number[]> = new Map();

  bloomPerDay: Map<number, BloomFilter> = new Map();

  bloomSize = 256;

  constructor() { }

  ngOnInit(): void {
    this.refreshGlobalinfectionReport();
  }

  public get nbTimeSlots(): number {
    return this.nbTimeSlotsPerDay * this.nbOfDays;
  }

  createTimeSlots(): TimeSlot[] {
    const timeSlots = [];
    for (let d = 0; d < this.nbOfDays; d++) {
      for (let s = 0; s < this.nbTimeSlotsPerDay; s++) {
        const t = s + d * this.nbTimeSlotsPerDay;
        const timeSlot = { time: t, day: d, slotInDay: s, locations: [] };
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
    this.globalInfectionReport = [];
    this.md_globalInfectionReport = new Map();
    for (const day of this.allDays) {
      const dayInfectedLocations = [];
      for (const slot of this.allSlotsInDay) {
        const time = day * this.nbTimeSlotsPerDay + slot;
        for (const individual of this.individuals) {
          if (individual.infectedTime >= 0) {
            const infectedDay = Math.floor(individual.infectedTime / this.nbTimeSlotsPerDay);
            if (day >= infectedDay - this.incubationPeriod) {
              const location = individual.locations[time];
              dayInfectedLocations.push(md_convert(slot, location.x, location.y));
            }
          }
        }
      }
      this.md_globalInfectionReport.set(day, dayInfectedLocations);
    }
    for (let timeSlot of this.timeSlots) {
      const locations = [];
      for (let individual of this.individuals) {
        if (individual.infectedTime >= 0) {
          const infectedDay = Math.floor(individual.infectedTime / this.nbTimeSlotsPerDay);
          if (timeSlot.day >= infectedDay - this.incubationPeriod) {
            const location = individual.locations[timeSlot.time];
            locations.push(location); // TODO: avoid duplicates
          }
        }
      }
      this.globalInfectionReport.push({locations});
    }
  }

  // getGlobalInfectionAtTime(time: number): string {
  //   let report = '';
  //   for (const location of this.globalInfectionReport[time].locations) {
  //     if (report !== '') {
  //       report += '\n';
  //     }
  //     report += location.toString();
  //   }
  //   return report;
  // }

  computeRisk(individual: Individual, timeSlot: TimeSlot): string {
    let nbContacts = 0;
    // compute intersection between individual record and the global one
    const indivLocation = individual.locations[timeSlot.time];
    for (const  location of this.globalInfectionReport[timeSlot.time].locations) {
      if (location.equals(indivLocation)) {
        nbContacts++;
      }
    }
    if (nbContacts > 0) {
      return nbContacts.toString();
    }
    return '';
  }

  computeRisk_md(individual: Individual, timeSlot: TimeSlot): string {
    let nbContacts = 0;
    const day = timeSlot.day;
    const dayInfectedLocations = this.md_globalInfectionReport.get(day);
    const maxSlot = timeSlot.slotInDay;
    for (let slot = 0; slot <= maxSlot; slot++) {
      const time = day * this.nbTimeSlotsPerDay + slot;
      const indivLocation = individual.locations[time];
      const md_value = md_convert(slot, indivLocation.x, indivLocation.y);
      if (dayInfectedLocations.includes(md_value)) {
        nbContacts++;
      }
    }
    if (nbContacts > 0) {
      return `(+${nbContacts})`;
    }
    return '';
  }

  computeScore_md(individual: Individual, timeSlot: TimeSlot): string {
    let nbContacts = 0;
    for (let time = 0; time <= timeSlot.time; time++) {
      const day = Math.floor(time / this.nbTimeSlotsPerDay);
      const slot = time - (day * this.nbTimeSlotsPerDay);
      const dayInfectedLocations = this.md_globalInfectionReport.get(day);
      const indivLocation = individual.locations[time];
      const md_value = md_convert(slot, indivLocation.x, indivLocation.y);
      if (dayInfectedLocations.includes(md_value)) {
        nbContacts++;
      }
    }
    if (nbContacts === 0) {
      return '';
    }
    return nbContacts.toString();
  }

  isInfected(time: number, x: number, y: number) {
    for (const location of this.globalInfectionReport[time].locations) {
      if (location.equalsTo(x ,y )) {
        return true;
      }
    }
    return false;
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
    return this.createIntArray(0, this.nbOfDays);
  }

  public get allSlotsInDay(): number[] {
    return this.createIntArray(0, this.nbTimeSlotsPerDay);
  }

  public md_parse(md_val: number): string {
    const {time, x, y} = md_parse(md_val);
    return `${time}:(${x},${y})`;
  }

  public computeBloomForDay(day: number) {
    const bloom = new BloomFilter(32 * this.bloomSize, 16);
    const dayInfectedLocations = this.md_globalInfectionReport.get(day);
    for (const md_val of dayInfectedLocations) {
      bloom.add(md_val);
    }
    this.bloomPerDay.set(day, bloom);
  }

  public computeBlooms() {
    for (const day of this.allDays) {
      this.computeBloomForDay(day);
    }
  }

  public serializeBloom(day: number) {
    const bloom = this.bloomPerDay.get(day);
    if (bloom) {
      return JSON.stringify([].slice.call(bloom.buckets));
    }
    return '';
  }

  public serializedBloomSize(day: number): number {
    const bloom = this.bloomPerDay.get(day);
    if (bloom) {
      return bloom.buckets.length;
    } else {
      return 0;
    }
  }

  computeScore_bloom(individual: Individual, timeSlot: TimeSlot): string {
    let nbContacts = 0;
    if (this.bloomPerDay.size > 0) {
      for (let time = 0; time <= timeSlot.time; time++) {
        const day = Math.floor(time / this.nbTimeSlotsPerDay);
        const slot = time - (day * this.nbTimeSlotsPerDay);
        const bloom = this.bloomPerDay.get(day);
        const indivLocation = individual.locations[time];
        const md_value = md_convert(slot, indivLocation.x, indivLocation.y);
        if (bloom.test(md_value)) {
          nbContacts++;
        }
      }
    }
    if (nbContacts === 0) {
      return '';
    }
    return nbContacts.toString();
  }




}
