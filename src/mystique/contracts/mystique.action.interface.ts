export interface MystiqueActionInterface {
  icon?: string;
  label: string;
  props: { [prop: string]: any };
  component?: {
    path: string;
    props: { [prop: string]: any };
  };
}
