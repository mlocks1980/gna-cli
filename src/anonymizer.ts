import * as path from "path";
import * as crypto from "crypto";

export interface CrashMetadata {
  file: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  timestamp: number;
}

export interface AnonymizedMetadata {
  fileHash: string;
  fileExtension: string;
  errorType: string;
  errorMessage: string;
  timestamp: number;
}

const HOME_DIR_PATTERN = /~\/[\w./\\-]+/g;
const WINDOWS_PATH_PATTERN = /[A-Za-z]:\\[\w\\.-]+/g;
const UNIX_PATH_PATTERN = /(?:\/[\w.-]+){2,}\/?/g;
const STRING_LITERAL_PATTERN = /"[^"]{3,}"/g;

export function anonymize(metadata: CrashMetadata): AnonymizedMetadata {
  return {
    fileHash: hashPath(metadata.file),
    fileExtension: path.extname(metadata.file),
    errorType: metadata.errorType,
    errorMessage: sanitizeString(metadata.errorMessage),
    timestamp: metadata.timestamp,
  };
}

export function hashPath(filePath: string): string {
  return crypto.createHash("sha256").update(filePath).digest("hex").slice(0, 16);
}

export function sanitizeString(input: string): string {
  return input
    .replace(HOME_DIR_PATTERN, "<HOME_PATH>")
    .replace(WINDOWS_PATH_PATTERN, "<WIN_PATH>")
    .replace(UNIX_PATH_PATTERN, "<PATH>")
    .replace(STRING_LITERAL_PATTERN, '"<STRING>"');
}
