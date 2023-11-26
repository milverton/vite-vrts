import {recordDetails} from "../../../lib/db";

export const AuditHeader = () => {
  return (
    <thead className="relative">
    <tr className="sticky top-16">
      <th
        title="Client"
        scope="col"
        className="w-96 whitespace-nowrap text-left py-3.5 pl-4 pr-3 text-left text-sm font-semibold bg-gray-50 text-gray-900 sm:pl-6"
      >
        Client
      </th>
      <th
        title="Season"
        scope="col"
        className="whitespace-nowrap text-center px-1 py-3.5 text-left text-sm font-semibold bg-gray-50 text-gray-900"
      >
        Season
      </th>
      {
        recordDetails.map(d => {
          return <th
            key={d.abbr}
            title={d.title}
            scope="col"
            className="whitespace-nowrap text-center px-1 py-3.5 text-left text-sm font-semibold bg-gray-50 text-gray-900"
          >{d.abbr}</th>
        })
      }
    </tr>
    </thead>
  )
}