import React from "react";
import {logFailure} from "../../lib/stores/logging";

export default class ErrorBoundary extends React.Component {
  state = {
    errorMessage: '',
  };

  static getDerivedStateFromError(error: { toString: () => any; }) {
    return {errorMessage: error.toString()};
  }

  componentDidCatch(error: { toString: () => string; }, info: { componentStack: any; }) {
    logFailure('ErrorBoundary', error.toString());
    this.logErrorToServices(error.toString(), info.componentStack);
  }

  // A fake logging service.
  logErrorToServices = console.log;

  render() {
    if (this.state.errorMessage) {
      return <p>{this.state.errorMessage}</p>;
    }
    // @ts-ignore
    return this.props.children;
  }
}