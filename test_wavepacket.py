"""Independent reference for an exact free Gaussian wavepacket in hbar=1 units."""
import math
import unittest

def moments(x0, sigma0, k0, mass, time):
    if sigma0 <= 0 or mass <= 0 or time < 0:
        raise ValueError("Invalid parameters")
    u = time / (2 * mass * sigma0**2)
    return x0 + k0 * time / mass, sigma0 * math.hypot(1, u)

def density(x, x0, sigma0, k0, mass, time):
    center, width = moments(x0, sigma0, k0, mass, time)
    return math.exp(-0.5 * ((x - center) / width)**2) / (math.sqrt(2 * math.pi) * width)

class GaussianWavepacketTests(unittest.TestCase):
    def test_initial_width(self):
        self.assertEqual(moments(-3, 1, 1.2, 1.5, 0), (-3, 1))
    def test_center_moves_at_group_velocity(self):
        self.assertAlmostEqual(moments(-3, 1, 1.2, 1.5, 10)[0], 5)
    def test_spreading_even_under_time_reversal(self):
        s0 = moments(0, 1, 0, 1, 0)[1]
        self.assertGreater(moments(0, 1, 0, 1, 4)[1], s0)
    def test_density_normalization(self):
        args=(0,1,0.7,1.2,3)
        lo,hi,n=-40,40,20000
        dx=(hi-lo)/n
        total=sum(density(lo+(i+.5)*dx,*args)*dx for i in range(n))
        self.assertAlmostEqual(total,1,places=5)
    def test_variance_numeric(self):
        args=(0,1.4,-.8,2,4)
        mean,sigma=moments(*args)
        dx=80/20000
        variance=sum((( -40+(i+.5)*dx)-mean)**2*density(-40+(i+.5)*dx,*args)*dx for i in range(20000))
        self.assertAlmostEqual(variance,sigma*sigma,places=4)
if __name__=='__main__': unittest.main()
