export {};
declare global {
  interface Result<T = any> {
    code: string;
    data: T;
    msg: string;
    success?: boolean;
  }

  interface Page<T = any> {
    records: T[];
    total: number;
  }
}
