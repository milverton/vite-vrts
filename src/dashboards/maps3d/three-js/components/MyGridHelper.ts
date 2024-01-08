import {LineSegments} from 'three/src/objects/LineSegments.js';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial.js';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute.js';
import {BufferGeometry} from 'three/src/core/BufferGeometry.js';
import {Color} from 'three/src/math/Color.js';

export class MyGridHelper {
  public mesh: LineSegments;
  public material: LineBasicMaterial;
  public geometry: BufferGeometry;
  constructor( size = 10, divisions = 10, color1:Color = new Color(0x000000), color2:Color = new Color(0x888888)) {
    
    color1 = new Color( color1 );
    color2 = new Color( color2 );

    const center = divisions / 2;
    const step = size / divisions;
    const halfSize = size / 2;

    const vertices = [], colors: number | Iterable<number> | ArrayLike<number> | ArrayBuffer = [];

    for ( let i = 0, j = 0, k = - halfSize; i <= divisions; i ++, k += step ) {

      vertices.push( - halfSize, 0, k, halfSize, 0, k );
      vertices.push( k, 0, - halfSize, k, 0, halfSize );

      const color = i === center ? color1 : color2 as never;

      color.toArray( colors as number[], j ); j += 3;
      color.toArray( colors as number[], j ); j += 3;
      color.toArray( colors as number[], j ); j += 3;
      color.toArray( colors as number[], j ); j += 3;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 4 ) );

    const material = new LineBasicMaterial( { vertexColors: true, toneMapped: true, opacity:0.25, transparent:true } );
    this.geometry = geometry;
    this.material = material;
    this.mesh = new LineSegments( geometry, material );
  }

  public UpdateColors( color1:Color = new Color(0x000000), color2:Color = new Color(0x888888)){
    color1 = new Color( color1 );
    color2 = new Color( color2 );

    const center = this.geometry.attributes.position.count / 2;
    const colors: number | Iterable<number> | ArrayLike<number> | ArrayBuffer = [];

    for ( let i = 0, j = 0; i <= center; i ++ ) {

      const color = i === center ? color1 : color2 as Color;

      color.toArray( colors as number[], j ); j += 3;
      color.toArray( colors as number[], j ); j += 3;
      color.toArray( colors as number[], j ); j += 3;
      color.toArray( colors as number[], j ); j += 3;

    }
    this.geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );
  }
  dispose() {

    this.geometry.dispose();
    this.material.dispose();

  }

}