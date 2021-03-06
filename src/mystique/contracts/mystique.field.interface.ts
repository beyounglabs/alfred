import { MystiqueComponentFieldInterface } from './mystique.component.field.interface';
import { MystiqueDateFieldInterface } from './mystique.date.field.interface';
import { MystiqueDatetimeFieldInterface } from './mystique.datetime.field.interface';
import { MystiqueGroupFieldInterface } from './mystique.group.field.interface';
import { MystiqueRelationFieldInterface } from './mystique.relation.field.interface';
import { MystiqueSelectFieldInterface } from './mystique.select.field.interface';
import { MystiqueTabFieldInterface } from './mystique.tab.field.interface';
import { MystiqueTextFieldInterface } from './mystique.text.field.interface';

export type MystiqueFieldInterface =
  | MystiqueSelectFieldInterface
  | MystiqueTextFieldInterface
  | MystiqueDateFieldInterface
  | MystiqueDatetimeFieldInterface
  | MystiqueComponentFieldInterface
  | MystiqueGroupFieldInterface
  | MystiqueRelationFieldInterface
  | MystiqueTabFieldInterface;
