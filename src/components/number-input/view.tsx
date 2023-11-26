import {NumberInputProps} from "./model";
import  {useEffect, useState} from "react";
import {debounce} from "lodash";

export const NumberInput = (props: NumberInputProps): JSX.Element => {
  const cleanedProps = {...props}
  return <input type="number" value={props.selected}
                onChange={e => props.setSelected(parseFloat(e.target.value))} {...cleanedProps} />
}

export const DelayedNumberInput = (props: NumberInputProps): JSX.Element => {
  const [state, setState] = useState(props.selected)
  const cleanedProps = {...props}
  // @ts-ignore
  delete cleanedProps.setSelected
  // @ts-ignore
  delete cleanedProps.selected
  const setSelected = props.delay? debounce(props.setSelected, 300): props.setSelected

  useEffect(() => {
    setSelected(state)
  }, [state])

  return <input type="number" value={state}
                onChange={e => setState(parseFloat(e.target.value))} {...cleanedProps} />
}