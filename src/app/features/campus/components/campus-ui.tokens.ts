import { SubjectCategory, AttendanceStatus } from '../../../core/campus/campus.models';

export interface SubjectCategoryMeta {
  label: string;
  icon: string;
  badgeClass: string;
  tileTintClass: string;
}

export const SUBJECT_CATEGORY_META: Record<SubjectCategory, SubjectCategoryMeta> = {
  stem: {
    label: 'Ciencias',
    icon: 'science',
    badgeClass: 'bg-primary-box text-on-primary-box',
    tileTintClass: 'bg-primary-box text-on-primary-box'
  },
  humanities: {
    label: 'Humanidades',
    icon: 'menu_book',
    badgeClass: 'bg-tertiary-box text-on-tertiary-box',
    tileTintClass: 'bg-tertiary-box text-on-tertiary-box'
  },
  arts: {
    label: 'Arquitectura',
    icon: 'architecture',
    badgeClass: 'bg-sec-box text-on-sec-box',
    tileTintClass: 'bg-sec-box text-on-sec-box'
  },
  sports: {
    label: 'Salud',
    icon: 'fitness_center',
    badgeClass: 'bg-success-box text-on-success-box',
    tileTintClass: 'bg-success-box text-on-success-box'
  }
};

export interface AttendanceStatusMeta {
  code: 'P' | 'T' | 'F';
  label: string;
  activeClass: string;
  ariaLabel: string;
}

export const ATTENDANCE_STATUS_META: Record<AttendanceStatus, AttendanceStatusMeta> = {
  present: {
    code: 'P',
    label: 'Presente',
    activeClass: 'bg-success-box text-on-success-box',
    ariaLabel: 'Marcar como presente'
  },
  late: {
    code: 'T',
    label: 'Tardanza',
    activeClass: 'bg-warning-box text-on-warning-box',
    ariaLabel: 'Marcar como tardanza'
  },
  absent: {
    code: 'F',
    label: 'Falta',
    activeClass: 'bg-error-box text-on-error-box',
    ariaLabel: 'Marcar como falta'
  }
};
