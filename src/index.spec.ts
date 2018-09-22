import { CAM16 } from './cam16'

describe('cam16', () => {
  const cam16 = new CAM16

  describe('conversion', () => {
    const xyz = [.123, .456, .789]
    const [J, C, H, h, M, s, Q] = cam16.fromXYZ(xyz)

    it('should convert from JCH', () => {
      const out = cam16.toXYZ([J, C, H], 'JCH')
      expect(out[0]).toBeCloseTo(xyz[0], 8)
      expect(out[1]).toBeCloseTo(xyz[1], 8)
      expect(out[2]).toBeCloseTo(xyz[2], 8)
    })

    it('should convert from QMh', () => {
      const out = cam16.toXYZ([Q, M, h], 'QMh')
      expect(out[0]).toBeCloseTo(xyz[0], 8)
      expect(out[1]).toBeCloseTo(xyz[1], 8)
      expect(out[2]).toBeCloseTo(xyz[2], 8)
    })

    it('should convert from Jsh', () => {
      const out = cam16.toXYZ([J, s, h], 'Jsh')
      expect(out[0]).toBeCloseTo(xyz[0], 8)
      expect(out[1]).toBeCloseTo(xyz[1], 8)
      expect(out[2]).toBeCloseTo(xyz[2], 8)
    })
  })
})
