import {Fragment, useEffect, useRef, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import {XMarkIcon} from "@heroicons/react/24/solid";

export interface ZoomableImageProps {
  className?: string
  src: string
  onLoad: () => void
}
export const ZoomablePhoto = ({className,src,onLoad}:ZoomableImageProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [_, setLoaded] = useState(false)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [zoom, setZoom] = useState(1);

  const handleWheel = (e:any) => {
    const zoomFactor = 0.1;
    if (e.deltaY < 0) {
      // Scrolling up - zoom in
      setZoom(zoom => Math.min(zoom + zoomFactor, 20)); // Max zoom level 5
    } else {
      // Scrolling down - zoom out
      setZoom(zoom => Math.max(zoom - zoomFactor, 0.3)); // Min zoom level 1
    }
  };


  useEffect(() => {
    if (!imgRef.current) {
      return;
    }

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    if (isNaN(viewportWidth) || isNaN(viewportHeight)) {
      return;
    }

    viewportWidth = viewportWidth * 0.8;
    viewportHeight = viewportHeight * 0.8;

    const naturalWidth = imgRef.current.naturalWidth;
    const naturalHeight = imgRef.current.naturalHeight;

    const widthRatio = viewportWidth / naturalWidth;
    const heightRatio = viewportHeight / naturalHeight;



    const scale = Math.min(widthRatio, heightRatio) * zoom;
    if (isNaN(scale) || scale === Infinity) {
      return;
    }
    const scaledWidth = naturalWidth * scale;
    const scaledHeight = naturalHeight * scale;
    // console.log("SCALE", scale, scaledWidth, scaledHeight, viewportWidth, viewportHeight, naturalWidth, naturalHeight)
    setDimensions({ width: scaledWidth, height: scaledHeight });

  }, [imgRef?.current?.naturalWidth, imgRef?.current?.naturalHeight, zoom])
  // <img onLoad={() => {setLoaded(true);onLoad();}} ref={imgRef} className={className} onClick={zoomIn} onContextMenu={zoomOut} src={src}></img>
  return (
    <img onLoad={() => {setLoaded(true);onLoad();}} ref={imgRef} className={className} src={src} width={dimensions.width} height={dimensions.height} onWheel={handleWheel}></img>
  )
}
const PhotoModal = ({photoUrl, open, setOpen}: {photoUrl: string, open:boolean, setOpen: (arg0: boolean) => void}) => {

  const [_, setLoaded] = useState(false)

  console.log(open)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="h-full flex justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all ">
                <div className="">
                  <ZoomablePhoto onLoad={() => setLoaded(true)} className={""} src={photoUrl} />
                  {/*<img onLoad={() => setLoaded(true)} ref={imgRef} className="" onClick={zoomIn} onContextMenu={zoomOut} src={photoUrl} width={width}></img>*/}

                </div>
                <div className="flex flex-col justify-center items-center p-2">
                  <button type="button" className="btn pastel-blue-button text-gray-500 text-sm w-1/4" onClick={() => setOpen(false)}><XMarkIcon className="w-5 h-5 m-auto"/></button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
export default PhotoModal