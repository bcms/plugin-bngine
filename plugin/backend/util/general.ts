import * as childProcess from 'child_process';

export class GeneralUtil {
  static async exec(
    cmd: string,
    output: (chunk: string, type: 'stdout' | 'stderr') => void,
  ) {
    return await new Promise((resolve, reject) => {
      const proc = childProcess.exec(cmd);
      if (output) {
        proc.stdout.on('data', (chunk) => {
          output(chunk, 'stdout');
        });
        proc.stderr.on('data', (chunk) => {
          output(chunk, 'stderr');
        });
      }
      proc.on('close', (code) => {
        if (code !== 0) {
          reject(undefined);
        } else {
          resolve(undefined);
        }
      });
    });
  }
}
