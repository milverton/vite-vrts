import React, {useEffect, useState} from "react";

interface TabsProps {
  className: string
  children: React.ReactNode|React.ReactNode[]
  onTabChange: (tab: any) => void
}

export const Tabs = (props: TabsProps) => {

  // Get tab names from children
  const _tabs = React.Children.map(props.children, (c: any) => c.props.menuEntry)
  const [tabs, setTabs] = useState(_tabs)


  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  const currentTab = tabs.find((tab: { current: any; }) => tab.current)

  const updateTabs = (currentTab: { name: any; }, allTabs: any[]) => {
    return allTabs.map(t => {
      if (t.name === currentTab.name) {
        return {...t, current: true}
      }
      return {...t, current: false}
    })
  }

  // Reset
  useEffect(() => {
    props.onTabChange(currentTab)
  }, [currentTab])
  if (!currentTab) {
    return <div>...Loading</div>
  }
  return (
    <div className={props.className}>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab: { name: any; current?: any; }) => (
              <button
                onClick={(_) => setTabs(updateTabs(tab, tabs))}
                key={tab.name}
                className={classNames(
                  tab.current
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                )}
                aria-current={tab.current ? 'page' : undefined}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {React.Children.map(props.children, ((child: any) => {
        // Merge parent props minus children with the child props and return with the child
        const parentProps = {...props}
        delete parentProps.children
        const mergedProps = {...parentProps, ...child.props}
        if (currentTab.id === child.props.menuEntry.id) {
          return React.cloneElement(child, mergedProps)
        }
        return <></>
      }))}

    </div>
  )
}
export default Tabs;