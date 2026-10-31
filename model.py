"""Tunnel model v0.1: exact effective two-qubit dynamics, no dependencies.

Run `python model.py` to write a CSV history to stdout.
Time is measured in T0; J and gamma in inverse T0. Basis: |10>, |01>.
"""
import csv
import math
import sys


def clock_rate(mode="local", amount=0.0):
    if not math.isfinite(amount) or not 0 <= amount < 1:
        raise ValueError("Clock parameter must be in [0,1).")
    if mode == "local":
        return 1.0
    if mode == "sr":
        return math.sqrt(1 - amount * amount)
    if mode == "gr":
        return math.sqrt(1 - amount)
    raise ValueError("Unknown clock mode.")


def state(t, J=1.0, gamma=0.0, initial="excited", rate=1.0):
    if not all(map(math.isfinite, [t, J, gamma, rate])) or min(t, J, gamma) < 0 or not 0 < rate <= 1:
        raise ValueError("Invalid dynamics parameter.")
    if initial not in ("excited", "bell", "mixture"):
        raise ValueError("Unknown initial state.")
    tau, a = t * rate, gamma / 2
    z0, x0 = float(initial == "excited"), float(initial == "bell")
    z, y = z0, 0.0
    if J > 0:
        d = 4 * J * J - a * a
        if abs(d) * tau * tau < 1e-10:
            e, q = math.exp(-a * tau), d * tau * tau
            ec, es = e * (1 - q / 2 + q*q / 24), e * tau * (1 - q / 6 + q*q / 120)
        elif d > 0:
            w, e = math.sqrt(d), math.exp(-a * tau)
            ec, es = e * math.cos(w * tau), e * math.sin(w * tau) / w
        else:
            k = math.sqrt(-d)
            slow, fast = math.exp((-4 * J*J / (a+k)) * tau), math.exp((-a-k) * tau)
            ec, es = (slow+fast)/2, (slow-fast)/(2*k)
        z, y = (ec+a*es)*z0, -2*J*es*z0
    x = x0 * math.exp(-gamma*tau)
    p_a, p_b = (1+z)/2, (1-z)/2
    return dict(t=t, tau=tau, J=J, gamma=gamma, initial=initial, rate=rate,
                x=x, y=y, z=z, pA=p_a, pB=p_b,
                concurrence=math.hypot(x,y), purity=(1+x*x+y*y+z*z)/2,
                rho=[[complex(p_a),complex(x/2,-y/2)],
                     [complex(x/2,y/2),complex(p_b)]],
                sites={"A": [-0.5,0,0], "B": [0.5,0,0]},
                spatial_units="site separation d", zzCorrelation=-1)


if __name__ == "__main__":
    writer = csv.DictWriter(sys.stdout, fieldnames=["t","tau","pA","pB","concurrence","purity"])
    writer.writeheader()
    for i in range(801):
        sample = state(i/100)
        writer.writerow({k: sample[k] for k in writer.fieldnames})
