import {Subject} from "rxjs";
import {nanoid} from "nanoid";
import {hashText} from "../common";

export enum LogLevel {
  Debug = 'Debug',
  Info = "Information",
  Warning = "Warning",
  Success = "Success",
  Failure = "Failure"
}

export interface LogMessage {
  ts: number,
  uid: string,
  message: string,
  checksum: string,
  warnings: string[],
  label: string,
  level: LogLevel,
}

export const LogChannel = new Subject<LogMessage>()
export function debug(label: string, message: string): LogMessage {
  const ts = new Date().getTime();
  const hs = hashText(message.toString())
  const v = {
    ts: ts,
    uid: nanoid(),
    message: message.toString(),
    checksum: hs,
    warnings: [],
    level: LogLevel.Debug,
    label: label,
  }
  return v
}
export function logDebug(label: string, message: string): LogMessage {
  const v = debug(label, message)
  LogChannel.next(v)
  return v
}



export function succeed(label: string, message: string): LogMessage {
  const ts = new Date().getTime();
  const hs = hashText(message.toString())
  const v = {
    ts: ts,
    uid: nanoid(),
    message: message.toString(),
    checksum: hs,
    warnings: [],
    level: LogLevel.Success,
    label: label,
  }
  return v
}
export function logSuccess(label: string, message: string): LogMessage {
  const v = succeed(label, message)
  LogChannel.next(v)
  return v
}

export function inform(label: string, message: string): LogMessage {
  const ts = new Date().getTime();
  const hs = hashText(message)
  const v = {
    ts: ts,
    uid: nanoid(),
    value: null,
    message: message,
    checksum: hs,
    warnings: [],
    level: LogLevel.Info,
    label: label,
  }
  return v
}
export function logInformation(label: string, message: string): LogMessage {
  const v = inform(label, message)
  LogChannel.next(v)
  return v
}

export function warn(label: string, message: string):LogMessage {
  const ts = new Date().getTime();
  const hs = hashText(message.toString())
  const v = {
    ts: ts,
    uid: nanoid(),
    message: message.toString(),
    checksum: hs,
    warnings: [],
    level: LogLevel.Warning,
    label: label,
  }
  return v
}
export function logWarning(label: string, message: string):LogMessage {
  const v = warn(label, message)
  LogChannel.next(v)
  return v
}

export function fail(label: string, message: string):LogMessage {
  const ts = new Date().getTime();
  const hs = hashText(message.toString())
  const v = {
    ts: ts,
    uid: nanoid(),
    message: message.toString(),
    checksum: hs,
    warnings: [],
    level: LogLevel.Failure,
    label: label,
  }
  return v
}

export function logFailure(label: string, message: string):LogMessage {
  const v = fail(label, message)
  LogChannel.next(v)
  return v
}
function extractSubjectAndRemaining(errorMessage: string): { subject: string, remaining: string } {
  const regex = /\[([^\]]+)\]/;

  const match = errorMessage.match(regex);

  if (match) {
    const subject = match[1];
    const remaining = errorMessage.replace(regex, '').trim();
    return { subject, remaining };
  } else {
    return { subject: 'Unknown Error', remaining: errorMessage };
  }
}
export const formatServerError = (e:any, code: string):LogMessage => {

  // exception
  // "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  //   "title": "[NullReferenceException] Object reference not set to an instance of an object.",
  //   "status": 404,
  //   "traceId": "0HMV7QCEIR3TH:00000001"
  // "detail"

  // problem
  // {
  //   "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  //   "title": "Not Found",
  //   "status": 404,
  //   "detail": "Meta with uid a9fbBysU6jEUfj7adUzWieWmPX not found"
  // }

  if (e.detail !== undefined) {
    return fail(e.title, `[${e.status}] ${e.detail} L(${code})`)
  }

  if (!e.title && e.message && e.label) {
    console.warn("deprecated message type (label, message", e)
    return fail(e.label, e.message)
  }
  const {subject, remaining} = extractSubjectAndRemaining(e.title)
  return fail(subject, `[${e.traceId}] ${remaining} L(${code})`)
}

export const logServerFailure = (e:any, code: string):LogMessage => {
  const v = formatServerError(e, code)
  logFailure(v.label, v.message)
  LogChannel.next(v)
  return v
}


