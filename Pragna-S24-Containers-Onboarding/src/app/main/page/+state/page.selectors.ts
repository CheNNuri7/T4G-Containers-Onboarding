import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../../core/store/app.reducer';
import { EntitySelectorService } from '../../../core/store/app.selectors';

import { Observable, of, combineLatest } from 'rxjs';
import { bufferTime, distinctUntilChanged, shareReplay, mergeMap, filter, switchMap, map } from 'rxjs/operators';
import { User } from '../../../core/store/user/user.model';
import { LongTermGoal } from '../../../core/store/long-term-goal/long-term-goal.model';

@Injectable({
  providedIn: 'root',
})
export class PageSelectors {
  constructor(private slRx: EntitySelectorService) {}
  selectLongTermData(currentUser$: Observable<User>, cId: string): Observable<LongTermGoal> {

    return combineLatest(currentUser$).pipe(
      switchMap(([currentUser]) => {
        return this.slRx.selectLongTermGoal('ltg', cId).pipe(
            map(goals => {
              console.log('goals');
              return goals;
            }),
          )
      }
      )
    )
  }

  /** Release memoized selectors. */
  cleanup(cId: string) {
    this.slRx.release(cId);
  }
}