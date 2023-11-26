import {BoundingBox} from "../../../../core/bounding-box";
import {getCenterPointForBoundary} from "../../../../lib/stores/boundary/transform";
import {boundaryStore} from "../../../../lib/stores/boundary/store";
import {scalePointWithBoundingBox} from "../../../../lib/map";
import {threeJsStore} from "./MeshCreationMachine";
import * as THREE from "three"

import {ThreeJsDisposer} from "../threeJS-dispose";

import {MyGridHelper} from "./MyGridHelper";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {Sky} from "three/examples/jsm/objects/Sky.js";

export class ThreeJsComponent {
  public camera: THREE.PerspectiveCamera | undefined
  public controls: OrbitControls | undefined
  public renderer: THREE.WebGLRenderer | undefined
  public scene: THREE.Scene = new THREE.Scene()
  public light: THREE.AmbientLight
  public light2: THREE.DirectionalLight
  public blockMesh:  null | THREE.Mesh | undefined
  public boundaries: THREE.Line[] = []
  public isInitialized = false
  public sceneObjects = []

  private gridHelper = null

  private sky = null

  constructor() {
    this.scene = new THREE.Scene()
    this.light = new THREE.AmbientLight(0xF5F5F3, 0.6);
    this.light2 = new THREE.DirectionalLight(0xFFFFFF, 0.8);

    this.light2.position.set(0, 2, -50)
    this.light2.target.position.set(0, 0, 0)
    this.light2.castShadow = true
    this.light2.shadow.camera.near = 0.1
    this.light2.shadow.camera.far = 10000
    this.scene.add(this.light2)
    this.scene.add(this.light)
  }

  public UpdateScene(scene: THREE.Scene) {
    this.scene = scene
  }

  public UpdateWithRenderer = (width: number, height: number, canvas: any) => {
    // RENDERER SETTINGS ----
    this.renderer = new THREE.WebGLRenderer({canvas, antialias: true, logarithmicDepthBuffer: true})
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.sortObjects = true
    this.renderer.toneMappingExposure = 1
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;


    // CAMERA SETTINGS ----
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 50000)
    // this.camera.position.set(-2500, 1000, 0)
    this.camera.position.set(0, 0, 0)
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.target.set(0, 0, 0)
    this.isInitialized = true


    // @ts-ignore
    this.gridHelper = new MyGridHelper(100000, 350, 0xffffff, 0xffffff)
    // @ts-ignore
    this.gridHelper.mesh.position.set(0, -50, 0)
    // @ts-ignore
    this.scene.add(this.gridHelper.mesh)

    // @ts-ignore
    this.sky = new Sky();
    // @ts-ignore
    this.sky.scale.setScalar(450000);

    // @ts-ignore
    const uniforms = this.sky.material.uniforms

    uniforms['turbidity'].value = 7;
    uniforms['rayleigh'].value = 2;
    uniforms['mieCoefficient'].value = 0.001;
    uniforms['mieDirectionalG'].value = 0.995;

    this.UpdateSun(50, 7)
    // @ts-ignore
    this.scene.add(this.sky);
    this.renderer.render(this.scene, this.camera)
  }

  public UpdateSun(angle: number, height: number){
    // @ts-ignore
    const uniforms = this.sky.material.uniforms
    const phi = THREE.MathUtils.degToRad(90 - height);
    const theta = THREE.MathUtils.degToRad(angle);
    this.light2.position.setFromSphericalCoords(1, phi, theta);
    uniforms['sunPosition'].value.copy(this.light2.position);
    // @ts-ignore
    this.sky.material.uniforms = uniforms;

    let min = new THREE.Color(0x291912)
    let max = new THREE.Color(0xffffff)
    let value = this.normalize(height, 0, 10)
    let opacityFactor = this.normalize(height, 2, 100)
    let newColor = new THREE.Color().lerpColors(min, max, value)

    // @ts-ignore
    this.gridHelper.UpdateColors(newColor,newColor)
    // @ts-ignore
    this.gridHelper.material.opacity = opacityFactor
    this.light.intensity = this.normalize(height, -10, 5) * 0.7
    this.light2.intensity = this.normalize(height, -10, 5) * 0.8

    let minColor = new THREE.Color(0x795d42)
    let maxColor = new THREE.Color(0xffffff)
    let colorValue = this.normalize(height, 0, 10)
    let newColor2 = new THREE.Color().lerpColors(minColor, maxColor, colorValue)
    this.light2.color = newColor2
    this.light.color = newColor2
  }


  private normalize(val: number, min: number, max: number){
    // Shift to positive to avoid issues when crossing the 0 line
    if(min < 0){
      max += 0 - min;
      val += 0 - min;
      min = 0;
    }
    // Shift values from 0 - max
    val = val - min;
    max = max - min;
    return Math.max(0, Math.min(1, val / max));
  }
  public CreateObjects(objects: THREE.Object3D[]) {
    // @ts-ignore
    this.sceneObjects.push(...objects)
    for (let i = 0; i < objects.length; i++) {
      this.scene.add(objects[i])
    }
  }

  public CreateObject(object: THREE.Object3D) {
    // @ts-ignore
    this.sceneObjects.push(object)
    this.scene.add(object)
  }

  public CreateMesh(geometry: THREE.Mesh, materials: THREE.Material[], bbox: BoundingBox): THREE.Mesh {
    // @ts-ignore
    let mesh = new THREE.Mesh(geometry, materials)
    mesh.position.set(bbox.width / 2, 0, bbox.height / 2)
    mesh.scale.set(1, -1, -1)
    mesh.rotation.x = Math.PI / 2
    mesh.updateMatrixWorld()
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.blockMesh = mesh

    this.scene.add(this.blockMesh)
    // @ts-ignore
    this.sceneObjects.push(this.blockMesh)
    return mesh
  }

  public CreateMeshWithMaterial(geometry: THREE.Mesh, material: THREE.MeshPhongMaterial, bbox: BoundingBox) {
    // @ts-ignore
    let mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(bbox.width / 2, -25, bbox.height / 2)
    mesh.scale.set(1, -1, -1)
    mesh.rotation.x = Math.PI / 2

    this.scene.add(mesh)
    // @ts-ignore
    this.sceneObjects.push(this.blockMesh)
  }

  public ClearScene(): Promise<boolean> {
    return new Promise((resolve, _) => {
      for (let i = 0; i < this.sceneObjects.length; i++) {
        this.scene.remove(this.sceneObjects[i])
      }
      this.sceneObjects = []
      resolve(true)
    })
  }

  public AddMeshOutline = (mesh: THREE.Mesh, bbox: BoundingBox) => {
    // Create a line around the mesh
    let lineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000
    })
    // @ts-ignore
    lineMaterial.lineWidth = 10
    let points: THREE.Vector3[] | THREE.Vector2[] = []

    // @ts-ignore
    let lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    let line = new THREE.Line(lineGeometry, lineMaterial)
    line.position.set(-bbox.width / 2, bbox.height / 2, 0)
    line.rotation.x = Math.PI / 2
    mesh.add(line)
    // @ts-ignore
    this.sceneObjects.push(line)
  }
  // @ts-ignore
  public AddBoundaries = (bbox: BoundingBox, lines: THREE.Line[]) => {
    this.boundaries = []
    for (let i = 0; i < lines.length; i++) {
      this.scene.add(lines[i])
      this.boundaries.push(lines[i])
      // @ts-ignore
      this.sceneObjects.push(lines[i])
    }
  }
  public RemoveBoundaries = () => {
    if (this.boundaries.length === 0) return
    this.scene.remove(...this.boundaries)
    this.sceneObjects = this.sceneObjects.filter((obj) => {
      return !this.boundaries.includes(obj)
    })
    this.boundaries = []
  }

  public UpdateCameraPosition = (bbox: BoundingBox) => {
    // CONTROLS SETTINGS ----
    const centerPoint = getCenterPointForBoundary(boundaryStore.boundary)
    const [cx, cy] = scalePointWithBoundingBox(bbox, centerPoint[0], centerPoint[1])

    // @ts-ignore
    this.camera.position.set(cx, cx + cy, cy)
    // @ts-ignore
    this.controls.target.set(cx, 0, cy)
    // @ts-ignore
    this.controls.enablePan = true
    // @ts-ignore
    this.controls.panSpeed = 1
    // @ts-ignore
    this.controls.zoomSpeed = 4
    // @ts-ignore
    this.controls.enableDamping = true
    // @ts-ignore
    this.controls.enableZoom = true
    // @ts-ignore
    this.controls.autoRotate = true
    // @ts-ignore
    this.controls.autoRotateSpeed = threeJsStore.sceneSettings.autoRotateSpeed
    // @ts-ignore
    this.controls.minZoom = -999999
    // @ts-ignore
    this.controls.minDistance = -999999
    // @ts-ignore
    this.controls.keyPanSpeed = 100
    // @ts-ignore
    this.controls.keys = {
      LEFT: 'ArrowLeft', //left arrow
      UP: 'ArrowUp', // up arrow
      RIGHT: 'ArrowRight', // right arrow
      BOTTOM: 'ArrowDown' // down arrow
    }

    // @ts-ignore
    this.controls.update()
  }
}

export const SatelliteIdx = 0
export const WaterIdx = 2
export const InterpolatedIdx = 1

export const MapStatus = {
  Disabled: 0,
  Enabled: 1,
}
export const GetMapStatus = (bool: boolean): number => {
  if (bool) return MapStatus.Enabled
  return MapStatus.Disabled
}
export const GetSatelliteState = (url = threeJsStore.mapSettings.SatelliteTexture) => GetMapStatus(url !== "")
export const GetInterpolationState = (url = threeJsStore.userSettings.InterpolatedUrl) => GetMapStatus(url !== "")
export const GetWaterState = (url = threeJsStore.mapSettings.WaterFlowUrl) => GetMapStatus(url !== "")

export class MeshMaterials {
  public static SatelliteMaterial = {
    texture: threeJsStore.mapSettings.SatelliteTexture,
    material: null as THREE.MeshPhysicalMaterial | null,
  }
  public static InterpolatedMaterial = {
    url: threeJsStore.userSettings.InterpolatedUrl,
    material: null as THREE.MeshPhysicalMaterial | null,
  }
  public static WaterMaterial = {
    url: threeJsStore.mapSettings.WaterFlowUrl,
    material: null as THREE.MeshPhysicalMaterial | null,
  }

  public static BaseEmptyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    depthWrite: true,
  })

  public static GetAllMaterialsUpdated = (): Promise<THREE.MeshPhysicalMaterial[]> => {
    let materialPromises = [
      MeshMaterials.GetBaseSatelliteMaterial(threeJsStore.mapSettings.SatelliteTexture, GetSatelliteState()),
      MeshMaterials.GetInterpolatedMaterial(threeJsStore.userSettings.InterpolatedUrl, GetInterpolationState()),
      MeshMaterials.GetWaterMaterial(threeJsStore.mapSettings.WaterFlowUrl, GetWaterState())
    ]
    return Promise.all(materialPromises)
  }
  // @ts-ignore
  private static GetBaseSatelliteMaterial = (texture: any, status: number): Promise<MeshPhysicalMaterial> => {
    if (status === MapStatus.Disabled)  {
      return new Promise((resolve, _) => resolve(MeshMaterials.BaseEmptyMaterial))
    }
    return new Promise((resolve, _reject) => {
      // If the material has already been loaded, return it
      if (texture === MeshMaterials.SatelliteMaterial.texture) {
        resolve(MeshMaterials.SatelliteMaterial.material)
        return
      }
      let material = new THREE.MeshPhysicalMaterial({
        map: texture,
        color: 0xffffff,
        side: THREE.DoubleSide,
        depthWrite: true,
      })
      material.toneMapped = false
      MeshMaterials.SatelliteMaterial.texture = texture
      // @ts-ignore
      MeshMaterials.SatelliteMaterial.material = material
      material.needsUpdate = true
      ThreeJsDisposer.DisposeMaterial(material).then(() => {
        resolve(material)
      })
    })
  }
  private static GetInterpolatedMaterial = (url: string, status: number): Promise<THREE.MeshPhysicalMaterial> => {
    if (status === MapStatus.Disabled) return new Promise((resolve, _) => {
      resolve(new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: true,
        opacity: 0
      }))
    })
    return new Promise((resolve, _) => {
      // If the material has already been loaded, return it
      if (url === MeshMaterials.InterpolatedMaterial.url) {
        resolve(MeshMaterials.InterpolatedMaterial.material as THREE.MeshPhysicalMaterial)
        return
      }
      let loader = new THREE.TextureLoader()
      loader.load(url, (texture) => {
        let material = new THREE.MeshPhysicalMaterial({
          map: texture,
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: true,
          opacity: threeJsStore.userSettings.Opacity
        })
        material.toneMapped = false

        MeshMaterials.InterpolatedMaterial.url = url
        MeshMaterials.InterpolatedMaterial.material = material
        ThreeJsDisposer.DisposeMaterial(material).then(() => {
          resolve(MeshMaterials.InterpolatedMaterial.material as THREE.MeshPhysicalMaterial)
        })
      })
    })


  }

  private static GetWaterMaterial = (url: string, status: number): Promise<THREE.MeshPhysicalMaterial> => {
    if (status === MapStatus.Disabled) return new Promise((resolve, _) => {
      resolve(new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: true,
        opacity: 0
      }))
    })
    return new Promise((resolve, _) => {
      // If the material has already been loaded, return it
      if (url === MeshMaterials.WaterMaterial.url) {
        resolve(MeshMaterials.WaterMaterial.material as THREE.MeshPhysicalMaterial)
        return
      }
      let loader = new THREE.TextureLoader()
      loader.load(url, (texture) => {
        let material = new THREE.MeshPhysicalMaterial({
          map: texture,
          color: 0xffffff,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: true,
          opacity: threeJsStore.userSettings.WaterOpacity
        })
        material.toneMapped = false

        MeshMaterials.WaterMaterial.url = url
        MeshMaterials.WaterMaterial.material = material
        ThreeJsDisposer.DisposeMaterial(material).then(() => {
          resolve(material)
        })
      })
    })
  }


}
