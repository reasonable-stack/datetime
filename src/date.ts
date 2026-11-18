import { Duration } from './duration.js';
import { NativeDate } from './native.js';
import * as u from './utils.js';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const parseISO = (iso: string) => {
  const match = ISO_DATE.exec(iso);

  if (!match) throw new RangeError(`invalid ISO date \`${iso}\``);

  const [, year, month, day] = match;

  return { year: Number(year), month: Number(month), day: Number(day) };
};

const epochOf = (date: Date): number => u.toEpoch(date.year, date.month, date.day);

const shift = (date: Date, milliseconds: number): Date => {
  if (milliseconds % u.DAY !== 0) {
    throw new RangeError('a date can only be shifted by whole days');
  }

  const { year, month, day } = u.fromEpoch(epochOf(date) + milliseconds);

  return new Date({ year, month, day });
};

export class Date {
  public readonly year: number;
  public readonly month: number; // 1..12
  public readonly day: number; // 1..31

  constructor({ year, month, day }: { year: number, month: number, day: number }) {
    u.assertInteger('year', year, 0, 9999);
    u.assertInteger('month', month, 1, 12);
    u.assertInteger('day', day, 1, u.daysInMonth(year, month));

    this.year = year;
    this.month = month;
    this.day = day;
  }

  static is(value: unknown): value is Date { return value instanceof Date }
  static parse(iso: string): Date { return new Date(parseISO(iso)) }

  static todayUTC(): Date {
    const { year, month, day } = u.fromEpoch(NativeDate.now());

    return new Date({ year, month, day });
  }

  static sort(values: Date[]): Date[] { return u.sortAll(values) }
  static min(values: Date[]): Date { return u.minOf(values) }
  static max(values: Date[]): Date { return u.maxOf(values) }

  add(duration: Duration): Date { return shift(this, duration['~total']) }
  sub(duration: Duration): Date { return shift(this, -duration['~total']) }

  diff(other: Date): Duration {
    return new Duration({ milliseconds: epochOf(other) - epochOf(this) });
  }

  compare(other: Date): -1 | 0 | 1 {
    return u.compareNumbers(epochOf(this), epochOf(other));
  }

  beginningOf(unit: 'year' | 'month'): Date {
    return new Date({ year: this.year, month: unit === 'year' ? 1 : this.month, day: 1 });
  }

  endOf(unit: 'year' | 'month'): Date {
    const month = unit === 'year' ? 12 : this.month;

    return new Date({ year: this.year, month, day: u.daysInMonth(this.year, month) });
  }

  toISOString(): string {
    return `${u.pad(this.year, 4)}-${u.pad(this.month)}-${u.pad(this.day)}`;
  }

  toJSON(): string { return this.toISOString() }
  toString(): string { return this.toISOString() }
};
