import { execSync } from "child_process";

const COMMITER_DATE_ISO_FORMAT = "%cI";

export default function getFileCreateTime(filePath: string): Date {
  const result = execSync(`git log --pretty=format:"${COMMITER_DATE_ISO_FORMAT}" ${filePath}`).toString();
  // not committed yet
  if (!result) {
    return new Date();
  }
  const commits = result.split(/\r?\n/g);
  return new Date(commits[commits.length - 1]);
}