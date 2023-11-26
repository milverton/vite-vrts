import React from "react";
import ErrorBoundary from "../../../components/error-boundary/view";

export const Main = ({children, id,className}: {children:React.ReactNode,id:string,className:string}) => {
  return (
    <ErrorBoundary>
      <main key={id} className={className}>
        <div className="max-auto z-0 rounded-lg h-full">
          {children}
        </div>
      </main>
    </ErrorBoundary>
  )
}