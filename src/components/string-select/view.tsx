import {StringSelectProps} from "./model";
import {slugify} from "../../lib/common";

export const StringSelect = ({className, name, menu, selected, setSelected}: StringSelectProps) => {
  return (
    <select
      id={slugify(name)}
      name={name}
      value={selected ? selected.menuName : "Loading..."}
      className={className}
      // defaultValue={selected && selected.menuName? selected.menuName: "Loading..."}
      onChange={(e) => {
        // get new value and update our state and notify others via props.onChange
        const value = e.target.value
        const menuType = menu.filter(x => x.menuName === value).first().menuType
        const changed = {...selected, menuName: value, menuType}
        setSelected(changed)
      }}
    >
      {menu.map(o => <option className="" key={o.menuType}>{o.menuName}</option>)}
    </select>
  )
}