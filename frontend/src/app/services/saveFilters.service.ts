import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SaveSearchService {
  private localStorageKey = 'searchParameters';

  setSavedSearch(searchParameters: SearchParameters): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(searchParameters));
  }

  getSavedSearch(): SearchParameters {
    const storedData = localStorage.getItem(this.localStorageKey);
    try {
      return storedData ? JSON.parse(storedData) : getDefaultSearchParameters();
    } catch (error) {
      console.error('Error parsing stored data:', error);
      return getDefaultSearchParameters();
    }
  }

  clearSavedSearch(): void {
    localStorage.removeItem(this.localStorageKey);
  }

  isSavedSearchEmpty(): boolean {
    const storedData = localStorage.getItem(this.localStorageKey);
    return !storedData || storedData === 'null';
  }
}

interface SearchParameters {
  searchName: string;
  searchBodyPart: string;
  withoutEquipment: boolean;
  selectedMuscles: { [key: string]: boolean };
}

function getDefaultSearchParameters(): SearchParameters {
  return {
    searchName: '',
    searchBodyPart: '',
    withoutEquipment: false,
    selectedMuscles: {}
  };
}
