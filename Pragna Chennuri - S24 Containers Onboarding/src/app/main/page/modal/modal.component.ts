import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, Inject } from '@angular/core';
import { ModalAnimations } from './modal.animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LongTermGoal } from 'src/app/core/store/long-term-goal/long-term-goal.model';
import { BehaviorSubject } from 'rxjs';



@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: ModalAnimations,
})
export class ModalComponent implements OnInit {
  // --------------- INPUTS AND OUTPUTS ------------------

  // --------------- LOCAL AND GLOBAL STATE --------------
  /** A loading indicator. */
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Local state for form info. */
  longTerm: LongTermGoal;

  // --------------- DATA BINDING ------------------------

  // --------------- EVENT BINDING -----------------------
  /** Close the modal. */
  close() {
    this.dialogRef.close();
  }

  /** Submit the project data. */
  submit() {
    this.data.updateGoals(this.longTerm, this.loading$);
  }

  // --------------- HELPER FUNCTIONS AND OTHER ----------

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      longTerm: LongTermGoal,
      updateGoals: (goals: LongTermGoal, loading$: BehaviorSubject<boolean>) => void,
    },
    private dialogRef: MatDialogRef<ModalComponent>,
  ) { }

  ngOnInit(): void {
    console.log(this.data.longTerm);
    this.longTerm.__id = this.data.longTerm.__id;
    this.longTerm.__userId = this.data.longTerm.__userId;
    this.longTerm.oneYear = this.data.longTerm.oneYear;
    this.longTerm.fiveYear = this.data.longTerm.fiveYear;
  }
}
