
export const AuditTable = (props: any) => {
  return (
    <div className="flex flex-col inline-block min-w-full align-middle ">
      <div className="flex-grow shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 relative table-fixed">
          {props.header ? <props.header/> : ''}
          <tbody className="divide-y divide-gray-200 bg-white">
          {props.children}
          </tbody>
        </table>
      </div>
    </div>
  )
}