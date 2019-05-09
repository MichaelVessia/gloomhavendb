import { Component, Input } from '@angular/core';
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'gdb-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent {
  @Input() label: string;

  constructor(private formComponent: FormComponent) {}
}
