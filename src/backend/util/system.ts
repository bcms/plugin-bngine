import * as childProcess from 'child_process';

export class System {
  static async exec(
    cmd: string,
    onChunk?: (type: 'stdout' | 'stderr', chunk: string) => void
  ): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      const proc = childProcess.exec(cmd);
      let err = '';
      if (proc.stderr) {
        proc.stderr.on('data', (chunk) => {
          if (onChunk) {
            onChunk('stderr', chunk);
          }
          err += chunk;
        });
      }
      if (proc.stdout && onChunk) {
        proc.stdout.on('data', (chunk) => {
          onChunk('stdout', chunk);
        });
      }
      proc.on('close', (code) => {
        if (code !== 0) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
