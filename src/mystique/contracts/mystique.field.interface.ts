interface MystiqueBaseFieldInterface {
  name: string;
  label: string;
  value?: string;
}

interface MystiqueSelectFieldInterface extends MystiqueBaseFieldInterface {
  type: 'select';
  values: {
    label: string;
    value: string | number;
  }[];
}

interface MystiqueTextFieldInterface extends MystiqueBaseFieldInterface {
  type: 'text';
}

export type MystiqueFieldInterface =
  | MystiqueSelectFieldInterface
  | MystiqueTextFieldInterface;
