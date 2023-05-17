const path = require('path');
const { ChildProcess } = require('@banez/child_process');
const { createConfig, createTasks } = require('@banez/npm-tool');
const { createFS } = require('@banez/fs');

const fs = createFS({
  base: process.cwd(),
});

module.exports = createConfig({
  custom: {
    '--setup': async () => {
      await createTasks([
        {
          title: 'Setup directories',
          task: async () => {
            const dirList = [
              'db',
              'logs',
              'backend-logs',
              'uploads',
              'storage',
            ];
            for (let i = 0; i < dirList.length; i++) {
              const dir = dirList[i];
              if (!(await fs.exist(dir))) {
                await fs.mkdir(dir);
              }
            }
          },
        },
      ]).run();
    },

    '--dev-ui': async () => {
      await ChildProcess.spawn('npm', ['run', 'dev'], {
        cwd: path.join(process.cwd(), 'ui'),
        stdio: 'inherit',
      });
    },

    '--build-ui': async () => {
      await ChildProcess.spawn('npm', ['run', 'build'], {
        cwd: path.join(process.cwd(), 'ui'),
        stdio: 'inherit',
      });
    },

    '--build-backend': async () => {
      await ChildProcess.spawn('tsc', [], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
      });
      const fileTree = await fs.fileTree(['dist', 'backend'], '');
      for (let i = 0; i < fileTree.length; i++) {
        const fileInfo = fileTree[i];
        const file = await fs.readString(fileInfo.path.abs);
        const fileWithFixedImports = file.replace(
          /\("@becomes\/cms-backend\/src\//g,
          '("@becomes/cms-backend/'
        );
        if (fileWithFixedImports !== file) {
          await fs.save(fileInfo.path.abs, fileWithFixedImports);
        }
      }
    },

    '--postinstall': async () => {
      await ChildProcess.spawn('npm', ['i'], {
        stdio: 'inherit',
        cwd: path.join(process.cwd(), 'ui'),
      });
      if (await fs.exist(['ui', 'src', 'bcms-ui'])) {
        await fs.deleteDir(['ui', 'src', 'bcms-ui']);
      }
      const bcmsUiBase = ['ui', 'node_modules', '@becomes', 'cms-ui'];
      const copy = [
        'components',
        'directives',
        'services',
        'translations',
        'types',
        'util',
      ];
      for (let i = 0; i < copy.length; i++) {
        const item = copy[i];
        await fs.copy([...bcmsUiBase, item], ['ui', 'src', 'bcms-ui', item]);
      }
    },
  },
});
