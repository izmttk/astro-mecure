import { execSync } from "child_process";

const COMMITER_DATE_ISO_FORMAT = "%cI";

export default function getFileCreateTime(filePath: string): Date {
  try {
    const result = execSync(`git log --pretty=format:"${COMMITER_DATE_ISO_FORMAT}" ${filePath}`).toString();
    if (!result) {
      throw new Error('Git command failed to execute');
    }
    const commits = result.split(/\r?\n/g);
    return new Date(commits[commits.length - 1]);
  } catch(e) {
    // not committed yet
    return new Date();
  }
}