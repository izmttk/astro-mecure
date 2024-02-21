import { execSync } from "child_process";

const COMMITER_DATE_ISO_FORMAT = "%cI";

export default function getFileUpdateTime(filePath: string): Date {
  try {
    const result = execSync(`git log --pretty=format:"${COMMITER_DATE_ISO_FORMAT}" ${filePath}`).toString();
    if (!result) {
      throw new Error('Git command failed to execute');
    }
    const commits = result.split(/\r?\n/g);
    return new Date(commits[0]);
  } catch(e) {
    // not committed yet
    return new Date();
  }
}