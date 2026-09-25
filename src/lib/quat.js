// ---------------------------------------------------------------------------
// Minimal 3D maths for the globe ⇄ archive morph: Vector3 lerp, quaternion
// slerp, and a CSS matrix3d writer. Every tile's pose is (position, rotation,
// scale); the morph interpolates the SAME tile between two poses.
// Coordinates: x right, y DOWN (CSS), z toward the viewer.
// ---------------------------------------------------------------------------
export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const smooth = (t) => t * t * (3 - 2 * t)
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const _qy = [0, 0, 0, 1], _qx = [0, 0, 0, 1], _qz = [0, 0, 0, 1], _t = [0, 0, 0, 1]
/** Quaternion from yaw (about Y), pitch (about X), roll (about Z): q = qY · qX · qZ,
 *  i.e. the same pose as CSS `rotateY(yaw) rotateX(pitch) rotateZ(roll)`. */
export function quatFromYPR(yaw, pitch, roll, out = [0, 0, 0, 1]) {
  _qy[0] = 0; _qy[1] = Math.sin(yaw / 2); _qy[2] = 0; _qy[3] = Math.cos(yaw / 2)
  _qx[0] = Math.sin(pitch / 2); _qx[1] = 0; _qx[2] = 0; _qx[3] = Math.cos(pitch / 2)
  _qz[0] = 0; _qz[1] = 0; _qz[2] = Math.sin(roll / 2); _qz[3] = Math.cos(roll / 2)
  quatMul(_qy, _qx, _t)
  return quatMul(_t, _qz, out)
}

export function quatMul(a, b, out = [0, 0, 0, 1]) {
  const [ax, ay, az, aw] = a
  const [bx, by, bz, bw] = b
  out[0] = aw * bx + ax * bw + ay * bz - az * by
  out[1] = aw * by - ax * bz + ay * bw + az * bx
  out[2] = aw * bz + ax * by - ay * bx + az * bw
  out[3] = aw * bw - ax * bx - ay * by - az * bz
  return out
}

export function slerp(a, b, t, out = [0, 0, 0, 1]) {
  let [bx, by, bz, bw] = b
  let cos = a[0] * bx + a[1] * by + a[2] * bz + a[3] * bw
  if (cos < 0) { cos = -cos; bx = -bx; by = -by; bz = -bz; bw = -bw } // shortest arc
  let k0, k1
  if (cos > 0.9995) { k0 = 1 - t; k1 = t } else {
    const th = Math.acos(cos), s = Math.sin(th)
    k0 = Math.sin((1 - t) * th) / s
    k1 = Math.sin(t * th) / s
  }
  out[0] = a[0] * k0 + bx * k1
  out[1] = a[1] * k0 + by * k1
  out[2] = a[2] * k0 + bz * k1
  out[3] = a[3] * k0 + bw * k1
  const n = Math.hypot(out[0], out[1], out[2], out[3]) || 1
  out[0] /= n; out[1] /= n; out[2] /= n; out[3] /= n
  return out
}

/** Rotate vector v by quaternion q. */
export function rotateVec(q, v, out = [0, 0, 0]) {
  const [x, y, z, w] = q
  const [vx, vy, vz] = v
  const ix = w * vx + y * vz - z * vy
  const iy = w * vy + z * vx - x * vz
  const iz = w * vz + x * vy - y * vx
  const iw = -x * vx - y * vy - z * vz
  out[0] = ix * w + iw * -x + iy * -z - iz * -y
  out[1] = iy * w + iw * -y + iz * -x - ix * -z
  out[2] = iz * w + iw * -z + ix * -y - iy * -x
  return out
}

/** CSS matrix3d (column-major) from position, quaternion, uniform scale. */
export function matrix3d(p, q, s) {
  const [x, y, z, w] = q
  const x2 = x + x, y2 = y + y, z2 = z + z
  const xx = x * x2, xy = x * y2, xz = x * z2
  const yy = y * y2, yz = y * z2, zz = z * z2
  const wx = w * x2, wy = w * y2, wz = w * z2
  const f = (n) => (Math.abs(n) < 1e-6 ? 0 : +n.toFixed(5))
  return `matrix3d(${f((1 - (yy + zz)) * s)},${f((xy + wz) * s)},${f((xz - wy) * s)},0,${f((xy - wz) * s)},${f((1 - (xx + zz)) * s)},${f((yz + wx) * s)},0,${f((xz + wy) * s)},${f((yz - wx) * s)},${f((1 - (xx + yy)) * s)},0,${f(p[0])},${f(p[1])},${f(p[2])},1)`
}
