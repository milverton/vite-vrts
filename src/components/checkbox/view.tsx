const Checkbox = (props: { id: string, selected: boolean, onClick: (status: boolean) => void }) => {

  const selected = props.selected === undefined || props.id === undefined ? false : props.selected

  return (
    <input
      id={props.id}
      aria-describedby="comments-description"
      name={props.id}
      type="checkbox"
      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      readOnly={true}
      checked={selected}
      onChange={(_) => props.onClick(!selected)}
    />
  )
}


export default Checkbox