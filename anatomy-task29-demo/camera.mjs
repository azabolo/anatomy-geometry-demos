import * as k from './kit/iso-kit.mjs';

export const HOME=Object.freeze({azimuth:255,elevation:24,zoom:1});
export const VIEWS=Object.freeze({front:{azimuth:255,elevation:24},reverse:{azimuth:315,elevation:22}});
export const LIMITS=Object.freeze({minElevation:8,maxElevation:82,minZoom:.72,maxZoom:1.8});
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function cameraTarget(values,current=HOME){
 const next={...current,...values};
 if(!Object.values(next).every(Number.isFinite))throw new Error('Invalid camera coordinates');
 next.elevation=clamp(next.elevation,LIMITS.minElevation,LIMITS.maxElevation);
 next.zoom=clamp(next.zoom,LIMITS.minZoom,LIMITS.maxZoom);
 return next;
}
export function nearestAzimuth(angle,from){return from+((angle-from+180)%360+360)%360-180;}
export function projectionFor(camera){
 const P={origin:[0,0],scale:21*camera.zoom,azimuth:camera.azimuth,elevation:camera.elevation};
 const center=k.iso([0,0,6],P);
 P.origin=[400-center[0],280-center[1]];
 return P;
}
export function triangleCamera(M,from=HOME){
 return cameraTarget({azimuth:nearestAzimuth(90,from.azimuth),elevation:Math.atan2(4-M.y,M.z)*180/Math.PI,zoom:1.16},from);
}
