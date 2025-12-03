import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validateur personnalisé pour vérifier qu'une date n'est pas dans le passé
export function notPastDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return { pastDate: { value: control.value } };
    }

    return null; 
  };
}

// Validateur pour vérifier que la date de fin est après la date de début
export function endDateAfterStartDateValidator(startDateField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !control.parent) {
      return null;
    }

    const startDate = control.parent.get(startDateField)?.value;
    if (!startDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(control.value);

    if (end < start) {
      return { endDateBeforeStart: { startDate, endDate: control.value } };
    }

    return null;
  };
}