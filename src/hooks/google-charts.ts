import {useEffect, useState} from "react";

function useGoogleCharts() {
  const [google, setGoogle] = useState()

  useEffect(() => {
    if (!google) {
      const head = document.head
      let script = document.getElementById('googleChartsScript')
      if (!script) {
        // console.log('creating script')
        script = document.createElement('script')
        // @ts-ignore
        script.src = 'https://www.gstatic.com/charts/loader.js'
        script.id = 'googleChartsScript'
        script.onload = () => {
          // @ts-ignore
          if (window.google && window.google.charts) {
            // @ts-ignore
            window.google.charts.load('current', {'packages': ['corechart']})
            // @ts-ignore
            window.google.charts.setOnLoadCallback(() => setGoogle(window.google))
          }

        }
        head.appendChild(script)
      } else { // @ts-ignore
        if (window.google && window.google.charts && window.google.visualization) {
                // @ts-ignore
                setGoogle(window.google)
              }
      }
    }
    return () => {
      let script = document.getElementById('googleChartsScript');
      if (script) {
        script.remove();
      }
    }
  }, [google])
  return google
}

export default useGoogleCharts;