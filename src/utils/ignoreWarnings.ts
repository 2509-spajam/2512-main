import { LogBox } from "react-native";

if (__DEV__) {
  const ignoredLogs = [
    "SafeAreaView has been deprecated",
    "ImagePicker.MediaTypeOptions",
    "Internal React error: Expected static flag was missing",
  ];

  const originalWarn = console.warn;
  const originalError = console.error;

  const shouldIgnore = (args: any[]) => {
    const firstArg = args[0];
    if (typeof firstArg !== "string") return false;
    return ignoredLogs.some((log) => firstArg.includes(log));
  };

  console.warn = (...args) => {
    if (shouldIgnore(args)) return;
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (shouldIgnore(args)) return;
    originalError(...args);
  };

  LogBox.ignoreLogs(ignoredLogs);
}
