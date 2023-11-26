import {MapLayerSelection} from "../model";
import React from "react";

export interface LayerProps {
  fn: MapLayerSelection
  toggle: (id: string) => void
  children: React.ReactNode
}
export const Layer = ({fn,toggle,children}: LayerProps) => {

  return (
    <>
      <hr className="w-full h-[2px]"/>
      <div className="relative flex items-start py-4">
      <div className="min-w-0 flex-1 text-sm">
        <label htmlFor={`layer-${fn.id}`} className="select-none font-medium text-gray-700">
          {fn.name}
        </label>
      </div>
      <div className="ml-3 flex flex-col items-center">
        <input
          id={`layer-${fn.id}`}
          name={`layer-${fn.id}`}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={fn.active}
          onChange={() => toggle(fn.id)}
        />
      </div>
    </div>
      {children}
    </>
  )
}

