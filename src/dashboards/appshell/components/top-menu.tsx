import {IMenu} from "../model";
import {Link} from "react-router-dom";
import {classNames} from "../../../lib/common";

export const TopMenu = ({mainMenu}: { mainMenu: IMenu[] }) => {
  return (
    <nav className="flex flex-row space-x-4">
      {mainMenu.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={classNames(
            item.current ? 'bg-blue-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            'group flex items-center px-4 text-sm font-medium rounded-md'
          )}
        >
          <item.icon
            className={classNames(
              item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
              'mr-3 flex-shrink-0 h-6 w-6'
            )}
            aria-hidden="true"
          />
          {item.name}
        </Link>
      ))}
    </nav>
  )
}