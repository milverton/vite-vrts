import {MenuProps} from "../../../components/string-select/model";
import {StringSelect} from "../../../components/string-select/view";
import {NumberInput} from "../../../components/number-input/view";
import ToggleSwitch from "../../../components/toggle-switch/view";

export const StringSelectorControl = (
  {
    label,
    menu,
    selected,
    setSelected
  }: {
    label?: string,
    menu: MenuProps[],
    selected: MenuProps,
    setSelected: (SelectedProps: any) => void
  }
) => {
  return (
    <div className="control-container-col">
      {label? <label htmlFor="soil-results" className="lbl-xs lbl-badge mb-1">{label}</label>: null}
      <StringSelect name={'soil-results'} className='text-xs string-select' menu={menu}
                    selected={selected} setSelected={setSelected}/>
    </div>
  )
}

export const ToggleControl = (
  {
    label,
    selected,
    setSelected
  }: {
    label: string,
    selected: boolean,
    setSelected: (arg0: boolean) => void
  }
) => {
  return (
    <div className="control-container-col">
      <label htmlFor="shrink-table" className="lbl-xs lbl-badge mb-1">{label}</label>
      <div className="toggle-middle">
        <ToggleSwitch name={"no"} default={selected} toggle={setSelected}/>
      </div>
    </div>
  )
}

export const NumberInputControl = (
  {
    label,
    selected,
    setSelected,
    min,
    max,
    step
  }: {
    label: string,
    selected: number,
    setSelected: (arg0: number) => void,
    min: number,
    max: number,
    step: number
  }
) => {
  return (
    <div className="control-container-col">
      <label htmlFor="opacity" className="lbl-xs lbl-badge mb-1">{label}</label>
      <div className="">
        <NumberInput className="number-input-xs" id={'opacity'} name={'Opacity'} min={min} max={max} step={step}
                     selected={selected} setSelected={setSelected}/>
      </div>
    </div>
  )
}