import { Component } from "react";
import { BloomFilter } from "bloomfilter";
import LocationRecorder, { addDays } from "./LocationRecorder";
import fetchService from "./FetchService";
import { BloomFilterService } from "./BloomFilterService";
import { LocationArea } from "./LocationService";

export abstract class CheckPublishAbstract extends Component {

    async generateBloomFilter(day: Date): Promise<BloomFilter>{
        const recorder = new LocationRecorder();
        return new Promise((resolve, reject) => {
          recorder.recordExists(day).then(exists => {
            if (exists) {
              fetchService.getGIRInfos().then(infos => {
                recorder.getLocations(day).then(locations => {
                  const bloomFilter = BloomFilterService.createBloomFilter(
                    locations,
                    infos.bloomFilter.sizeInBits,
                    infos.bloomFilter.nbHashes
                  );
                  setTimeout(() => resolve(bloomFilter), 1);
                  // resolve(bloomFilter);
                }).catch(e => {
                  console.error(e);
                  reject(e);
                });
              }).catch(e => {
                console.error(e);
                reject(e);
              });
            } else {
              const e = `No location record found for day ${day.toDateString()}`;
              console.error(e);
              reject(e);
            }
          }).catch(e => {
            console.error(e);
            reject(e);
          });
        });
      }

      loadRecord(
        dayStart: Date,
        nbDaysBackwards: number,
        callback: (data: any, index: number, next: () => void) => void
    ) {
        const recorder = new LocationRecorder();
        const dayEnd = addDays(dayStart, -nbDaysBackwards);
        this.recursiveLoadRecord(
            recorder,
            dayStart,
            dayEnd,
            -1,
            0,
            callback
        );
    }

    recursiveLoadRecord(
        recorder: LocationRecorder,
        dayStart: Date,
        dayEnd: Date,
        dayIncrement: number,
        index: number,
        callback: (data: any, index: number, next: () => void) => void) {
        const onLocations = (day: Date, locations: LocationArea[], index: number) => {
            console.log(`Get ${locations.length} locations for day ${day.toDateString()}`);
            callback({
                day: day,
                selected: false,
                completed: false,
                computing: false,
                downloading: false,
                comparing: false,
                error: false,
                status: '',
                nbContacts: 0
            }, index, () => {
              if (day.getUTCDate() !== dayEnd.getUTCDate()) {
                index++;
                this.recursiveLoadRecord(recorder, dayStart, dayEnd, dayIncrement, index, callback);
              } else {
                  console.log(`loadRecord finished for day ${day.toDateString()}, index=${index}`);
              }
            });
        }
        const day = addDays(dayStart, index * dayIncrement);
        recorder.recordExists(day).then(exists => {
          if (exists) {
            recorder.getLocations(day).then(locations => {
                onLocations(day, locations, index);
            }).catch(e => console.error(e));
          } else {
            onLocations(day, [], index);
            }
        }).catch(e => console.error(e));
    }


}