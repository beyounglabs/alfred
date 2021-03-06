export interface MystiqueActionInterface {
  code?: string;
  icon?: string;
  label: string;
  url?: string;
  props: { [prop: string]: any };
  component?: {
    path: string;
    props: { [prop: string]: any };
  };
}
