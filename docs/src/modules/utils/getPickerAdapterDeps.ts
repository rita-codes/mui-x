import childProcess from 'node:child_process';
import path from 'node:path';

interface ListedDependency {
  name: string;
  devDependencies?: {
    [key: string]: {
      version: string;
    };
  };
}

export function getPickerAdapterDeps() {
  const adapterLibs = childProcess.execSync(
    'pnpm list date-fns date-fns-jalali dayjs luxon moment moment-hijri moment-jalaali --json',
    { cwd: path.resolve(__dirname, '../../../../packages/x-date-pickers') },
  );
  const jsonListedDependencies: ListedDependency[] = JSON.parse(adapterLibs.toString());
  const adapterDependencyMap = Object.entries(
    jsonListedDependencies[0].devDependencies ?? {},
  ).reduce(
    (result, [libraryName, libraryInfo]) => {
      result[libraryName] = libraryInfo.version;
      return result;
    },
    {} as Record<string, string>,
  );
  return adapterDependencyMap;
}
