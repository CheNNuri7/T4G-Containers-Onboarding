import {ChangeDetectionStrategy, Component, OnInit, Input,} from '@angular/core';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../core/store/app.reducer';
import * as fromAuth from '../../core/store/auth/auth.reducer';
import { PageAnimations } from './page.animations';
import { FirebaseService } from '../../core/firebase/firebase.service';
import {tap, filter, withLatestFrom, take, takeUntil, map, subscribeOn} from 'rxjs/operators';
import {of, distinctUntilChanged,interval,Observable, Subject, BehaviorSubject, combineLatest} from 'rxjs';
import { User } from '../../core/store/user/user.model';
import { PageSelectors } from './+state/page.selectors';
import { LoadData, Cleanup } from './+state/page.actions';
import { RouterNavigate } from '../../core/store/app.actions';
import { UpdateUser } from '../../core/store/user/user.actions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalComponent } from './modal/modal.component';
import { EntitySelectorService } from '../../core/store/app.selectors';
import {LongTermGoalActionTypes, UpdateLongTermGoal} from '../../core/store/long-term-goal/long-term-goal.actions';
import { LongTermGoal } from '../../core/store/long-term-goal/long-term-goal.model';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: PageAnimations,
})
export class PageComponent implements OnInit {
  // --------------- ROUTE PARAMS & CURRENT USER ---------
  /** The currently signed in user. */
  currentUser$: Observable<User> = this.store.pipe(
    select(fromAuth.selectUser),
    filter((user) => user !== null)
  );

  // --------------- LOCAL AND GLOBAL STATE --------------
  /** For storing the dialogRef in the opened modal. */
  dialogRef: MatDialogRef<any>;

  // --------------- DB ENTITY DATA ----------------------

  /** Container id for selectors and loading. */
  containerId: string = this.db.createId();

  // --------------- DATA BINDING ------------------------
  /** Raw time in milliseconds from 1970/01/01 00:00:00:000 **/
  currentDateTime$: Observable<number> = interval(1000).pipe(
    map(() => Date.now())
  );

  longTermGoal$: Observable<LongTermGoal> = this.selectors.selectLongTermData(
    this.currentUser$,
    this.containerId
  );

  // --------------- EVENT BINDING -----------------------
  /** Event for opening the edit modal. */
  openEditModal$: Subject<void> = new Subject();

  /** Event for saving goal edits. */
  saveGoals$: Subject<{
    goal: LongTermGoal;
    loading$: BehaviorSubject<boolean>;
  }> = new Subject();

  // --------------- HELPER FUNCTIONS AND OTHER ----------

  /** Unsubscribe observable for subscriptions. */
  unsubscribe$: Subject<void> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private selectors: PageSelectors,
    private store: Store<fromStore.State>,
    private db: FirebaseService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    // --------------- EVENT HANDLING ----------------------

    console.log(this.longTermGoal$);

    /** Handle openEditModal events. */
    this.openEditModal$
      .pipe(withLatestFrom(this.longTermGoal$), takeUntil(this.unsubscribe$))
      .subscribe(([_, longTermGoal]) => {
        console.log('modal component opened');
        this.dialogRef = this.dialog.open(ModalComponent, {
          data: {
            longTermGoal: longTermGoal,
            updateGoals: (
              goal: LongTermGoal,
              loading$: BehaviorSubject<boolean>
            ) => {
              this.saveGoals$.next({ goal, loading$ });
            },
          },
          panelClass: 'dialog-container',
        });
      });
    
    // this.saveGoals$
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(({ goal, loading$ }) => {
    //     this.store.dispatch(new UpdateLongTermGoal({ longTermGoal: goal }));
    //     loading$.next(false);
    //   });


    /** Handle save goals events. */
    this.saveGoals$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ goal, loading$ }) => {
        console.log('long term goals saved/changed');
        this.store.dispatch(
          new UpdateLongTermGoal(
            goal.__id,
            {
              oneYear: goal.oneYear,
              fiveYear: goal.fiveYear,
            },
            this.containerId
          )
        );
        this.dialogRef.close();
      });
    
    // --------------- LOAD DATA ---------------------------
    // Once everything is set up, load the data for the role.
    combineLatest(this.currentUser$)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([currentUser]) => {
        this.store.dispatch(
          new LoadData(
            {
              currentUser,
            },
            this.containerId
          )
        );
      });
  }

  ngOnDestroy() {
    // Unsubscribe subscriptions.
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    // Unsubscribe from firebase connection from load and free up memoized selector values.
    this.store.dispatch(new Cleanup(this.containerId));
    this.selectors.cleanup(this.containerId);
  }
}
