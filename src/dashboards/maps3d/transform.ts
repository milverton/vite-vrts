import {BoundingBox} from "../../core/bounding-box";
import * as THREE from "three";

export const getStaticImageFromBbox = (bbox: BoundingBox): Promise<THREE.Texture> =>  {
  const host = 'https://api.mapbox.com/styles/v1'
  const api = import.meta.env.VITE_MB_KEY
  const username = 'mapbox'
  const style_id = 'satellite-v9'
  //const style_id = 'outdoors-v12'

  const [newWidth, newHeight] = fitDimensions(bbox.width, bbox.height, 1, 1280, 1, 1280)
  const url = `${host}/${username}/${style_id}/static/[${bbox.min_x},${bbox.min_y},${bbox.max_x},${bbox.max_y}]/${newWidth}x${newHeight}@2x?access_token=${api}&attribution=true&logo=true`
  const textureLoader = new THREE.TextureLoader()

  return new Promise<THREE.Texture>((resolve, reject) => {
    fetch(url).then((response) => {
      if(!response.ok) { reject(response.statusText) }
      textureLoader.load(response.url, (texture) => {
        resolve(texture)
      })

    }).catch((error) => {
      console.log("error", error)
      reject(error)
    })

  })
}
export const getStaticImage4X = (bbox: BoundingBox): Promise<THREE.CanvasTexture> =>  {
  const host = 'https://api.mapbox.com/styles/v1'
  const api = import.meta.env.VITE_MB_KEY
  const username = 'mapbox'
  const style_id = 'satellite-v9'
  const style = `@2x?access_token=${api}&attribution=true&logo=true`


  const smallerBoxWidth = bbox.width / 2;
  const smallerBoxHeight = bbox.height / 2;
  const [newWidth, newHeight] = fitDimensions(smallerBoxWidth, smallerBoxHeight, 1, 1280, 1, 1280)
  const boundingBoxes = splitBoundingBoxIntoFour(bbox) as GeoBoundingBox[]

  const topLeftUrl = `${host}/${username}/${style_id}/static/[${boundingBoxes[0].min_x},${boundingBoxes[0].min_y},${boundingBoxes[0].max_x},${boundingBoxes[0].max_y}]/${newWidth}x${newHeight}${style}`
  const topRightUrl = `${host}/${username}/${style_id}/static/[${boundingBoxes[1].min_x},${boundingBoxes[1].min_y},${boundingBoxes[1].max_x},${boundingBoxes[1].max_y}]/${newWidth}x${newHeight}${style}`
  const bottomLeftUrl = `${host}/${username}/${style_id}/static/[${boundingBoxes[2].min_x},${boundingBoxes[2].min_y},${boundingBoxes[2].max_x},${boundingBoxes[2].max_y}]/${newWidth}x${newHeight}${style}`
  const bottomRightUrl = `${host}/${username}/${style_id}/static/[${boundingBoxes[3].min_x},${boundingBoxes[3].min_y},${boundingBoxes[3].max_x},${boundingBoxes[3].max_y}]/${newWidth}x${newHeight}${style}`

  const promises = [loadUrl(topLeftUrl), loadUrl(topRightUrl), loadUrl(bottomLeftUrl), loadUrl(bottomRightUrl)]
  return new Promise<THREE.CanvasTexture>((resolve, reject) => {
    Promise.all(promises).then((values) => {
      const urls = {topLeft: values[0], topRight: values[1], bottomLeft: values[2], bottomRight: values[3]}

      const textures = {
        topLeft: loadTexture(urls.topLeft),
        topRight: loadTexture(urls.topRight),
        bottomLeft: loadTexture(urls.bottomLeft),
        bottomRight: loadTexture(urls.bottomRight)
      };
      Promise.all([textures.topLeft, textures.topRight, textures.bottomLeft, textures.bottomRight]).then(loadedTextures => {
        const [topLeft, topRight, bottomLeft, bottomRight] = loadedTextures;

        // Create canvas, set dimensions, and draw images
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject("No context")
          return;
        }

        canvas.width = topLeft.image.width + topRight.image.width;
        canvas.height = topLeft.image.height + bottomLeft.image.height;

        ctx.drawImage(topLeft.image, 0, 0);
        ctx.drawImage(topRight.image, topLeft.image.width, 0);
        ctx.drawImage(bottomLeft.image, 0, topLeft.image.height);
        ctx.drawImage(bottomRight.image, bottomLeft.image.width, topRight.image.height);

        const stitchedTexture = new THREE.CanvasTexture(canvas);
        console.log("------------ stitchedTexture", stitchedTexture)
        resolve(stitchedTexture)
      }).catch(
        error => reject(error)
      )
    }).catch((error) => {
      console.log("error", error)
      reject(error)
    })
  })
}

export const getStaticImages3By3FromBbox = (bbox: BoundingBox): Promise<THREE.CanvasTexture> =>  {
  const host = 'https://api.mapbox.com/styles/v1'
  const api = import.meta.env.VITE_MB_KEY
  const username = 'mapbox'
  const style_id = 'satellite-v9'

  const boxWidth = bbox.width / 3;
  const boxHeight = bbox.height / 3;

  const [newWidth, newHeight] = fitDimensions(boxWidth, boxHeight, 1, 1280, 1, 1280);
  const boundingBoxes = splitBoundingBoxIntoNine(bbox);
  const promises = boundingBoxes.map(box => {
    const url = `${host}/${username}/${style_id}/static/[${box.min_x},${box.min_y},${box.max_x},${box.max_y}]/${newWidth}x${newHeight}@2x?access_token=${api}`;
    return loadUrl(url);
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = newWidth * 3;
  canvas.height = newHeight * 3;

  return new Promise<THREE.CanvasTexture>((resolve, reject) => {
    Promise.all(promises).then((urls => {
      const texturePromises = urls.map(url => loadTexture(url)) as Promise<THREE.Texture>[];
      Promise.all(texturePromises).then(loadedTextures => {
        loadedTextures.forEach((texture, index) => {
          const x = (index % 3) * newWidth;
          const y = (2 - Math.floor(index / 3)) * newHeight;

          ctx?.drawImage(texture.image, x, y);
        });


        const stitchedTexture = new THREE.CanvasTexture(canvas);
        resolve(stitchedTexture);
      }).catch(error => {
        console.log(error)
        reject(error)
      });
    })).catch(error => {
      console.log(error)
      reject(error)
    });
  })
}
function splitBoundingBoxIntoNine(bbox: BoundingBox): BoundingBox[] {
  const boxWidth = (bbox.max_x - bbox.min_x) / 3;
  const boxHeight = (bbox.max_y - bbox.min_y) / 3;
  const boxes: BoundingBox[] = [];

  for (let j = 0; j < 3; j++) { // Outer loop for rows (latitude)
    for (let i = 0; i < 3; i++) { // Inner loop for columns (longitude)
      boxes.push({
        min_x: bbox.min_x + (i * boxWidth),
        max_x: bbox.min_x + ((i + 1) * boxWidth),
        max_y: bbox.max_y - (j * boxHeight),  // Start from max_y and decrease
        min_y: bbox.max_y - ((j + 1) * boxHeight), // to get the next min_y
        width: bbox.width / 3,
        height: bbox.height / 3
      } as BoundingBox);
    }
  }

  return boxes;
}


function loadTexture(url:string):Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      texture => resolve(texture),
      undefined,
      error => reject(error)
    );
  });
}

const loadUrl = (url:string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(url).then((response) => {
      if(!response.ok) { reject(response.statusText) }
      resolve(response.url)
    }).catch((error) => {
      console.log("error", error)
      reject(error)
    })
  })
}
interface GeoBoundingBox {
  min_x: number; // minimum longitude
  min_y: number; // minimum latitude
  max_x: number; // maximum longitude
  max_y: number; // maximum latitude
}
function splitBoundingBoxIntoFour(bbox: BoundingBox): GeoBoundingBox[] {
  // Find the midpoints for longitude and latitude
  const midX = (bbox.min_x + bbox.max_x) / 2;
  const midY = (bbox.min_y + bbox.max_y) / 2;

  return [
    // Top-left box
    {
      min_x: bbox.min_x,
      min_y: midY,
      max_x: midX,
      max_y: bbox.max_y,
    },
    // Top-right box
    {
      min_x: midX,
      min_y: midY,
      max_x: bbox.max_x,
      max_y: bbox.max_y,
    },
    // Bottom-left box
    {
      min_x: bbox.min_x,
      min_y: bbox.min_y,
      max_x: midX,
      max_y: midY,
    },
    // Bottom-right box
    {
      min_x: midX,
      min_y: bbox.min_y,
      max_x: bbox.max_x,
      max_y: midY,
    },
  ];
}
export const getStaticBingImageFromBbox = (bbox: BoundingBox): Promise<string> =>  {
  const host = 'https://dev.virtualearth.net/REST/v1/Imagery/Map/Aerial/'
  const api = import.meta.env.VITE_BI_KEY;

  const [newWidth, newHeight] = fitDimensions(bbox.width, bbox.height, 1, 2048, 1, 2048)
  const centerLat = (bbox.max_y + bbox.min_y) / 2
  const centerLon = (bbox.max_x + bbox.min_x) / 2

  const lngDiff = bbox.max_x - bbox.min_x;
  const latDiff = bbox.max_y - bbox.min_y;
  const scaleLat = newHeight / latDiff;
  const scaleLng = newWidth / lngDiff;
  const scale = Math.min(scaleLat, scaleLng);
  const worldWidthInPixelsAtZoom1 = 256;
  const zoomEstimate = Math.log(scale * lngDiff / worldWidthInPixelsAtZoom1) / Math.log(2);
  const zoom = Math.floor(zoomEstimate);

  const url = `${host}${centerLat},${centerLon}/${zoom}?mapSize=${newWidth},${newHeight}&key=${api}`

  return new Promise<string>((resolve, reject) => {
    fetch(url).then((response) => {
      if(!response.ok) { reject(response.statusText) }

      console.log("response", response.url)
      resolve(response.url)
    }).catch((error) => {
      console.log("error", error)
      reject(error)
    })

  })
}
export interface ISatelliteElevation {
  elevation: number[];
  rows: number;
  cols: number;
}
export const getStaticSatelliteElevation = (bbox: BoundingBox): Promise<ISatelliteElevation> =>  {
 return new Promise((resolve, reject) => {
   const apiKey = import.meta.env.VITE_BI_KEY
   const boundingBox = {
     southLatitude: bbox.min_y,
     westLongitude: bbox.min_x,
     northLatitude: bbox.max_y,
     eastLongitude: bbox.max_x
   }

   const [cols, rows] = fitDimensions(bbox.width, bbox.height, 1, 32, 1, 32)
   const apiUrl = `https://dev.virtualearth.net/REST/v1/Elevation/Bounds?bounds=${boundingBox.southLatitude},${boundingBox.westLongitude},${boundingBox.northLatitude},${boundingBox.eastLongitude}&rows=${rows}&cols=${cols}&key=${apiKey}`;



   fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.statusCode === 200) {
          const elevations = data.resourceSets[0].resources[0].elevations;
          const flippedY = flipY(elevations, rows, cols);
          resolve({
            elevation: flippedY as [],
            rows: rows,
            cols: cols
          } as ISatelliteElevation)

        } else {
          console.error('Error fetching elevation:', data.statusDescription);
          reject(data.statusDescription)
        }
      })
      .catch(error => console.error('Fetch Error:', error));
  })
}

// export const getStaticElevationForEmptyPoints = (bbox: BoundingBox, elevation:number[], min:number, grid: GridCell[]): Promise<[]> =>  {
//   const apiKey = import.meta.env.VITE_BI_KEY
//   const segments: any[] = []
//   let currentIdx = 0;
//   let currentSegment = []
//   const bb = [
//     bbox.min_x,
//     bbox.min_y,
//     bbox.max_x,
//     bbox.max_y
//   ]
//   // Loop through and create segments of 1024 points
//   for(const i = 0; i < elevation.length; i++) {
//     if(currentIdx >= 500 || i === grid.length - 1){
//       segments.push(currentSegment)
//       currentSegment = []
//       currentIdx = 0;
//     }
//     // Scale points to lat,lon based on boundingBox
//     if(elevation[i] !== 0) continue;
//     const [x,y] = unScalePoint(bb, grid[i].position.x, grid[i].position.z, bbox.dist_x, bbox.dist_y, bbox.width, bbox.height)
//     const point = new THREE.Vector3(y, elevation[i], x)
//     currentSegment.push([i,point])
//     currentIdx++
//   }
//
//   return new Promise<[]>(async (resolve, _reject) => {
//     const promises = []
//     for(const i = 0; i < segments.length; i++) {
//       const segment = segments[i]
//       promises.push(FetchElevationForPoints(segment, apiKey))
//     }
//     Promise.all(promises).then((results) => {
//       console.log("results", results)
//       for(const i = 0; i < results.length; i++){
//         for(const j = 0; j < results[i].length; j++){
//           const point = results[i][j]
//           elevation[point[0]] = point[1] - min
//         }
//       }
//       resolve(elevation as [])
//     })
//
//   })
// }

// interface IPoint {
//   x: number;
//   y: number;
//   z: number;
// }

// const FetchElevationForPoints = (segment: IPoint[], apiKey: string): Promise<[]> => {
//   return new Promise<[]>((resolve, reject) => {
//     const elevation: number[][] = []
//     let latitude = 0
//     let longitude = 0
//     const result = []
//     if (segment.length === 0) reject("No points requiring elevation")
//     const elevationPointsToGet = segment.map((p) => [p.x, p.z])
//     for(let i = 0; i < elevationPointsToGet.length; i++){
//       const point = elevationPointsToGet[i]
//       const lat = Math.round(point[1] * 100000)
//       const lon =  Math.round(point[0] * 100000)
//
//       let dy = lat - latitude
//       let dx = lon - longitude
//       latitude = lat
//       longitude = lon
//
//       dy = (dy << 1) ^ (dy >> 31)
//       dx = (dx << 1) ^ (dx >> 31)
//
//       let index = ((dy + dx) * (dy + dx + 1) / 2) + dy
//
//       while (index > 0) {
//         let rem = index & 31;
//         index = (index - rem) / 32;
//
//         if (index > 0) rem += 32;
//
//         result.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"[rem]);
//       }
//     }
//     result.join("")
//
//     const url = `http://dev.virtualearth.net/REST/v1/Elevation/List?points=${result}&key=${apiKey}`
//
//     console.log("text", result)
//     fetch(url).then((response) => {
//       if (response.ok === false) {
//         reject(response.statusText)
//       }
//       return response.json()
//     }).then((data) => {
//       if (data.statusCode === 200) {
//         const elevations = data.resourceSets[0].resources[0].elevations
//
//         segment.forEach((p, i) => {
//           elevation.push([p.x, elevations[i]])
//         })
//         // console.log("elevation", elevation)
//         resolve(elevation as [])
//       }
//     }).catch((error) => {
//       reject(error)
//     }).catch((error) => {
//       console.log("error", error)
//       reject(error)
//     })
//   })
// }

function flipY(data: number[], rows: number, cols: number): number[] {
  const flipped: number[] = new Array(data.length);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Calculate the index in the original flat array
      const originalIndex = r * cols + c;

      // Calculate the index in the flipped array
      const flippedIndex = (rows - 1 - r) * cols + c;

      flipped[flippedIndex] = data[originalIndex];
    }
  }

  return flipped;
}

function fitDimensions(width: number, height: number, _minWidth: number, maxWidth: number, minHeight: number, maxHeight: number) {
  // Ensure the input values are numbers
  // const width = parseFloat(widthS)
  // const height = parseFloat(heightS)
  // // const minWidth = parseFloat(minWidthS)
  // const maxWidth = parseFloat(maxWidthS)
  // const minHeight = parseFloat(minHeightS)
  // const maxHeight = parseFloat(maxHeightS)

  // Calculate the aspect ratio
  const aspectRatio = width / height

  // Calculate the new width and height based on maxWidth and maxHeight
  let newWidth = Math.min(maxWidth, width)
  let newHeight = newWidth / aspectRatio

  // If newHeight is out of range, recalculate based on maxHeight
  if (newHeight < minHeight || newHeight > maxHeight) {
    newHeight = Math.min(maxHeight, Math.max(minHeight, height))
    newWidth = newHeight * aspectRatio;
  }

  // Round the values to get integers
  newWidth = Math.round(newWidth)
  newHeight = Math.round(newHeight)

  return [newWidth, newHeight ]
}

