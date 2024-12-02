declare module 'rticonnextdds-connector' {
  interface Ticket {
    number: string | number;
  }

  interface ConnectorConfig {
    configName: string;
    url: string;
  }

  interface Instance {
    setNumber(field: string, value: number): void;
    setString(field: string, value: string): void;
    setBoolean(field: string, value: boolean): void;
    getNumber(field: string): number;
    getString(field: string): string;
    getBoolean(field: string): boolean;
    setFromJSON(json: unknown): void;
  }

  interface Output {
    instance: Instance;
    write(): void;
  }

  interface Input {
    take(): void;
    read(): void;
    wait(timeout?: number): Promise<void>;
    samples: {
      validDataIterator: Array<{
        getJson(): Ticket;
      }>;
    };
  }

  class Connector {
    constructor(configName: string, xmlPath: string);
    
    getOutput(outputName: string): Output;
    getInput(inputName: string): Input;
    
    wait(timeout?: number): void;
    close(): void;
  }

  export default Connector;
}