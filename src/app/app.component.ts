import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  word: string = '';
  words: string[] = [];
  subStringsProcessed: string[] = [];
  permutesProcessed: string[] = [];
  private searchTermSubject = new Subject<void>();
  private masterList: string[] = [];
  private filteredDictionary: string[] = [];

  constructor(private http: HttpClient) { }
  ngOnInit() {
    this.http.get('/assets/afrikaans', { responseType: 'text' }).subscribe(text => this.masterList = text.toLowerCase().split('\n').map(word => word.trim()).filter(word => !!word).sort());
    // this.searchTermSubject.asObservable().pipe(debounceTime(300)).subscribe(_ => this.performSearch());
  }
  triggerSearch() {
    this.searchTermSubject.next();
  }
  buildAnagram() {
    this.words = [];
    const distribution = this.calculateFrequencyDistribution(this.word);
    const usedChars = Object.keys(distribution);
    const wordLength = this.word.length;
    const regex = new RegExp(`[^${usedChars.join('')}]`);
    const filteredDictionary = this.masterList.filter((value: string) => {
      if (value.length > wordLength) {
        return false;
      }
      if (!!value.match(regex)) {
        return false;
      }
      const valueDist = this.calculateFrequencyDistribution(value);
      for (const key of usedChars) {
        if (!!valueDist[key] && valueDist[key] > distribution[key]) {
          return false;
        }
      }
      return true;
    });

    this.words = [...new Set(filteredDictionary)];
    // console.log('Words:', this.words, filteredDictionary);
  }
  wordAllowed(str: string): boolean {
    return str === 'aarsel'; // this.masterList.includes(str) && !this.words.includes(str);
  }
  calculateFrequencyDistribution(word: string): Record<string, number> {
    const chars = word.split('');
    const result: Record<string, number> = chars.reduce((result, current) => {
      result[current] = (result[current] || 0) + 1;
      return result;
    }, {} as Record<string, number>);
    return result;
  }

}

